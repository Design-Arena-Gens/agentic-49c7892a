"use client";

import { FormEvent, useMemo, useState } from "react";
import { OccupantType, ParkingRegistration, VehicleSlot } from "./types";
import { nanoid } from "nanoid";

interface RegistrationFormProps {
  registrations: ParkingRegistration[];
  onCreate: (registration: ParkingRegistration) => void;
}

const defaultFormState = {
  occupantName: "",
  occupantType: "tenant" as OccupantType,
  email: "",
  phone: "",
  vehicleSlot: "primary" as VehicleSlot,
  vehiclePlate: "",
  vehicleMake: "",
  vehicleColor: "",
  hoursApproved: 2,
  notes: "",
};

const occupantTypeOptions: { value: OccupantType; label: string }[] = [
  { value: "tenant", label: "Tenant" },
  { value: "guest", label: "Guest" },
];

const vehicleSlotOptions: { value: VehicleSlot; label: string }[] = [
  { value: "primary", label: "Primary Vehicle" },
  { value: "secondary", label: "Second Vehicle" },
];

export function RegistrationForm({
  registrations,
  onCreate,
}: RegistrationFormProps) {
  const [form, setForm] = useState(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    email: string;
    phone: string;
  } | null>(null);

  const byEmail = useMemo(() => {
    return registrations.reduce<Map<string, ParkingRegistration[]>>(
      (map, registration) => {
        const collection = map.get(registration.email) ?? [];
        collection.push(registration);
        map.set(registration.email, collection);
        return map;
      },
      new Map()
    );
  }, [registrations]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = form.email.trim().toLowerCase();
    const existing = byEmail.get(normalizedEmail) ?? [];

    if (!form.occupantName.trim()) {
      setError("Please provide the tenant or guest name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email is required to deliver confirmations.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required to deliver SMS confirmations.");
      return;
    }

    if (!form.vehiclePlate.trim()) {
      setError("Vehicle plate number is required.");
      return;
    }

    if (form.hoursApproved <= 0) {
      setError("Approved parking hours must be at least 1 hour.");
      return;
    }

    const slotAlreadyUsed = existing.some(
      (registration) => registration.vehicleSlot === form.vehicleSlot
    );

    if (slotAlreadyUsed) {
      const slotLabel =
        form.vehicleSlot === "primary" ? "primary vehicle" : "second vehicle";
      setError(
        `The ${slotLabel} slot is already registered for this account. Update the existing record or select another slot.`
      );
      return;
    }

    if (existing.length >= 2) {
      setError(
        "This account already has two vehicles assigned. Remove a vehicle before registering a new one."
      );
      return;
    }

    if (existing.length === 0 && form.vehicleSlot === "secondary") {
      setError(
        "Register the primary vehicle first before assigning a second vehicle."
      );
      return;
    }

    const now = new Date();
    const registration: ParkingRegistration = {
      id: nanoid(),
      createdAt: now.toISOString(),
      occupantName: form.occupantName.trim(),
      occupantType: form.occupantType,
      email: normalizedEmail,
      phone: form.phone.trim(),
      vehicleSlot: form.vehicleSlot,
      vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
      vehicleMake: form.vehicleMake.trim(),
      vehicleColor: form.vehicleColor.trim(),
      hoursApproved: form.hoursApproved,
      notes: form.notes.trim() || undefined,
      status: "approved",
      notifiedAt: now.toISOString(),
    };

    onCreate(registration);
    setConfirmation({
      id: registration.id,
      email: registration.email,
      phone: registration.phone,
    });
    setForm((state) => ({
      ...defaultFormState,
      occupantType: state.occupantType,
    }));

    setTimeout(() => setConfirmation(null), 2500);
  }

  return (
    <section className="rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-neutral-900/70 dark:ring-white/10">
      <header className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Register Parking
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Capture tenant or guest details, assign a vehicle slot, and confirm
          the approved parking duration. Each account can manage up to two
          vehicles.
        </p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Tenant or Guest Name
            </label>
            <input
              value={form.occupantName}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  occupantName: event.target.value,
                }))
              }
              placeholder="e.g. Robin Schneider"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {occupantTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((state) => ({
                      ...state,
                      occupantType: option.value,
                    }))
                  }
                  className={`flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    form.occupantType === option.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200"
                      : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-500 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  email: event.target.value,
                }))
              }
              placeholder="name@domain.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  phone: event.target.value,
                }))
              }
              placeholder="+1 (222) 444-8899"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Vehicle Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vehicleSlotOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((state) => ({
                      ...state,
                      vehicleSlot: option.value,
                    }))
                  }
                  className={`flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    form.vehicleSlot === option.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-200"
                      : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-emerald-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Vehicle Plate
            </label>
            <input
              value={form.vehiclePlate}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  vehiclePlate: event.target.value,
                }))
              }
              placeholder="ABC-1234"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase tracking-widest shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Vehicle Make &amp; Model
            </label>
            <input
              value={form.vehicleMake}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  vehicleMake: event.target.value,
                }))
              }
              placeholder="e.g. Tesla Model 3"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Vehicle Color
            </label>
            <input
              value={form.vehicleColor}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  vehicleColor: event.target.value,
                }))
              }
              placeholder="e.g. Midnight blue"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Hours Approved
            </label>
            <input
              type="number"
              min={1}
              max={72}
              value={form.hoursApproved}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  hoursApproved: Number(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Internal Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((state) => ({
                  ...state,
                  notes: event.target.value,
                }))
              }
              rows={3}
              placeholder="Compliance checks, special instructions, etc."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
        </div>
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confirmation notices will be dispatched to the provided email and
            phone number immediately after approval.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Approve Parking
          </button>
        </div>
        {confirmation && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            Parking confirmation sent to {confirmation.email} and{" "}
            {confirmation.phone}.
          </p>
        )}
      </form>
    </section>
  );
}
