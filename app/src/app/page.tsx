/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { ParkingBoard } from "@/components/ParkingBoard";
import { NotificationFeed } from "@/components/NotificationFeed";
import {
  NotificationMessage,
  ParkingRegistration,
} from "@/components/types";
import { nanoid } from "nanoid";

export default function Home() {
  const [registrations, setRegistrations] = useState<ParkingRegistration[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const summary = useMemo(() => {
    const active = registrations.filter(
      (registration) => registration.status !== "completed"
    );
    const tenants = active.filter(
      (registration) => registration.occupantType === "tenant"
    ).length;
    const guests = active.filter(
      (registration) => registration.occupantType === "guest"
    ).length;
    const totalHours = active.reduce(
      (acc, registration) => acc + registration.hoursApproved,
      0
    );

    return {
      active: active.length,
      tenants,
      guests,
      totalHours,
    };
  }, [registrations]);

  function handleCreate(registration: ParkingRegistration) {
    setRegistrations((state) => [...state, registration]);
    setNotifications((state) => [
      {
        id: nanoid(),
        headline: `Parking slot approved for ${registration.vehiclePlate}`,
        details: `Confirmation sent to ${registration.email} and ${registration.phone} for ${registration.hoursApproved} hour${registration.hoursApproved > 1 ? "s" : ""}.`,
        createdAt: registration.notifiedAt,
      },
      ...state,
    ]);
  }

  function handleUpdateStatus(
    id: string,
    status: ParkingRegistration["status"]
  ) {
    setRegistrations((state) =>
      state.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-white py-12 text-slate-900 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-3xl bg-white/80 p-10 shadow-xl shadow-indigo-200/40 ring-1 ring-white/60 backdrop-blur dark:bg-neutral-950/70 dark:ring-white/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-300">
                Tenaent &amp; Guest Parking
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                Parking Command Center
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                Approve parking windows for residents and guests. Each approval
                triggers confirmation emails and SMS notifications with the
                authorized hours and slot assignments.
              </p>
            </div>
            <img
              src="/parking-deck.svg"
              alt="Parking illustration"
              className="h-24 w-24 self-start md:self-center"
            />
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryTile label="Active vehicles" value={summary.active} />
            <SummaryTile label="Tenants parked" value={summary.tenants} />
            <SummaryTile label="Guests parked" value={summary.guests} />
            <SummaryTile
              label="Hours authorized"
              value={summary.totalHours}
              suffix="hrs"
            />
          </dl>
        </header>
        <main className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-8">
            <RegistrationForm
              registrations={registrations}
              onCreate={handleCreate}
            />
            <ParkingBoard
              registrations={registrations}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
          <div className="space-y-6">
            <NotificationFeed notifications={notifications} />
            <PolicyPanel />
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-sm shadow-indigo-100 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-neutral-900/80 dark:hover:border-indigo-400">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 flex items-baseline gap-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
        {suffix && (
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </dd>
    </div>
  );
}

function PolicyPanel() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-700 dark:bg-neutral-900/70">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Parking Policies
      </h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <li>
          • Tenants and guests must be registered before occupying a parking
          slot.
        </li>
        <li>
          • Secondary vehicles are permitted only after the primary slot is
          assigned.
        </li>
        <li>
          • Approvals automatically notify the contact on file with allotted
          hours.
        </li>
        <li>• Expire approvals promptly by marking vehicles as released.</li>
      </ul>
    </aside>
  );
}
