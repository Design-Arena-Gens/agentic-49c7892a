"use client";

import { NotificationMessage } from "./types";
import { formatDistanceToNow, parseISO } from "date-fns";

interface NotificationFeedProps {
  notifications: NotificationMessage[];
}

export function NotificationFeed({ notifications }: NotificationFeedProps) {
  if (notifications.length === 0) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-neutral-900/70 dark:text-slate-400">
        Notifications will appear here once approvals are issued.
      </aside>
    );
  }

  return (
    <aside className="space-y-3 rounded-3xl border border-slate-200 bg-white/70 p-5 dark:border-slate-700 dark:bg-neutral-900/70">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Confirmation Dispatch Log
      </h3>
      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
          >
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              {notification.headline}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {notification.details} ·{" "}
              {formatDistanceToNow(parseISO(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
