"use client";

import { useMemo } from "react";
import { ParkingRegistration } from "./types";
import { format, parseISO } from "date-fns";

interface ParkingBoardProps {
  registrations: ParkingRegistration[];
  onUpdateStatus: (id: string, status: ParkingRegistration["status"]) => void;
}

export function ParkingBoard({
  registrations,
  onUpdateStatus,
}: ParkingBoardProps) {
  const ordered = useMemo(() => {
    return [...registrations].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  }, [registrations]);

  if (ordered.length === 0) {
    return (
      <section className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-neutral-900/60 dark:text-slate-400">
        <p className="text-base font-medium">
          No vehicles approved yet. Register a tenant or guest to get started.
        </p>
        <p className="mt-2 text-sm">
          Each approval automatically sends a confirmation email and SMS.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Active Approvals
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track parking windows, slot assignments, and completion status in
          real-time.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {ordered.map((registration) => {
          const start = parseISO(registration.createdAt);
          const notification = parseISO(registration.notifiedAt);
          return (
            <li
              key={registration.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-700 dark:bg-neutral-900/80 dark:hover:border-indigo-400"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                  {registration.occupantType === "tenant"
                    ? "Tenant"
                    : "Guest"}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {format(start, "MMM d, yyyy · h:mm a")}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {registration.occupantName}
                </p>
                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-200">
                      Vehicle:
                    </span>{" "}
                    {registration.vehiclePlate} · {registration.vehicleMake || "—"}{" "}
                    {registration.vehicleColor && `· ${registration.vehicleColor}`}
                  </p>
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-200">
                      Slot:
                    </span>{" "}
                    {registration.vehicleSlot === "primary"
                      ? "Primary"
                      : "Second Vehicle"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-200">
                      Hours Approved:
                    </span>{" "}
                    {registration.hoursApproved} hr
                    {registration.hoursApproved > 1 ? "s" : ""}
                  </p>
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-200">
                      Notifications:
                    </span>{" "}
                    Sent {format(notification, "h:mm a")}
                  </p>
                  <p>
                    <span className="font-medium text-slate-600 dark:text-slate-200">
                      Contact:
                    </span>{" "}
                    {registration.email} · {registration.phone}
                  </p>
                </div>
                {registration.notes && (
                  <p className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    {registration.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={registration.status} />
                <div className="flex items-center gap-2">
                  {registration.status === "approved" && (
                    <button
                      onClick={() => onUpdateStatus(registration.id, "parked")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                    >
                      Mark Parked
                    </button>
                  )}
                  {registration.status !== "completed" && (
                    <button
                      onClick={() => onUpdateStatus(registration.id, "completed")}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-rose-400 dark:hover:text-rose-300"
                    >
                      Release
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: ParkingRegistration["status"];
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:bg-sky-500/20 dark:text-sky-200">
        Approved
      </span>
    );
  }

  if (status === "parked") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
        Parked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      Completed
    </span>
  );
}
