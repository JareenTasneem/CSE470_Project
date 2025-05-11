// BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/*  Tailwind‑safe colour map for every booking status                 */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  Pending:   { chip: 'bg-yellow-500', grad: 'from-yellow-400 to-yellow-600' },
  Confirmed: { chip: 'bg-green-500',  grad: 'from-green-400 to-green-600'  },
  Cancelled: { chip: 'bg-red-500',    grad: 'from-red-400 to-red-600'     },
};

export default function BookingModal({
  booking,
  open,
  onClose,
  onUpdate,
  statusOptions = [],
}) {
  /* ----------------------- component state ------------------------ */
  const [status, setStatus] = useState(booking?.status || 'Pending');
  const [reason, setReason] = useState('');

  /* reset when a different booking is opened */
  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setReason('');
    }
  }, [booking]);

  if (!open || !booking) return null;

  const styleFor = (stat) => STATUS_STYLES[stat] ?? STATUS_STYLES.Pending;

  /* ------------------------- rendered card ------------------------ */
  return createPortal(
    <div className="fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto w-full max-w-3xl mx-4 bg-white border border-gray-200 rounded-3xl shadow-2xl p-8"
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 shadow"
        >
          &times;
        </button>

        {/* header */}
        <h3 className="text-xl font-extrabold text-center mb-4">Manage Booking</h3>
        <div className="flex flex-col items-center mb-6">
          <span
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold shadow text-white',
              styleFor(booking.status).chip,
            )}
          >
            {booking.status}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Last updated:&nbsp;
            {format(
              new Date(booking.updatedAt || booking.createdAt),
              "MMM d, yyyy 'at' h:mm a",
            )}
          </span>
        </div>

        {/* status selector */}
        <label className="block text-sm font-semibold mb-2">Update Status</label>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-full mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={clsx(
                'flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                status === opt.value
                  ? [
                      'bg-gradient-to-r text-white shadow-sm scale-[1.03]',
                      styleFor(opt.value).grad,
                    ]
                  : 'bg-transparent text-gray-700 hover:bg-gray-200',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* notes */}
        <label className="block text-sm font-semibold mb-2">Additional Notes</label>
        <textarea
          rows={3}
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-300"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add notes or reason for status change"
        />

        {/* action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
          >
            Cancel
          </button>
          <button
            disabled={status === booking.status}
            onClick={() => onUpdate({ status, reason })}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow"
          >
            Update Status
          </button>
        </div>

        {/* footer meta */}
        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-gray-600 mt-6 border-t pt-4">
          <span><b>Customer:</b> {booking.user?.name ?? 'N/A'}</span>
          <span><b>Email:</b> {booking.user?.email ?? 'N/A'}</span>
          <span><b>Booking ID:</b> {booking.booking_id}</span>
          <span><b>Amount:</b> ${booking.total_price}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
