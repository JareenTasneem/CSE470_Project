// BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import clsx from 'clsx';

const iconStyle = { width: 18, height: 18, minWidth: 18, minHeight: 18, display: 'inline', verticalAlign: 'middle' };

/* ------------------------------------------------------------------ */
/*  Status styles configuration                                        */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  Pending: {
    chip: 'bg-amber-500',
    grad: 'from-amber-400 to-amber-600',
    icon: (
      <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  Confirmed: {
    chip: 'bg-emerald-500',
    grad: 'from-emerald-400 to-emerald-600',
    icon: (
      <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    )
  },
  Cancelled: {
    chip: 'bg-rose-500',
    grad: 'from-rose-400 to-rose-600',
    icon: (
      <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    )
  }
};

export default function BookingModal({
  booking,
  open,
  onClose,
  onUpdate,
  statusOptions = [],
  onUpdateRefund,
}) {
  const [status, setStatus] = useState(booking?.status || 'Pending');
  const [reason, setReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundStatus, setRefundStatus] = useState(booking?.refundStatus || 'none');
  const [refundAmount, setRefundAmount] = useState(booking?.refundAmount || 0);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setReason('');
      setShowDetails(false);
      setIsSubmitting(false);
      setRefundStatus(booking.refundStatus || 'none');
      setRefundAmount(booking.refundAmount || 0);
    }
  }, [booking]);

  if (!open || !booking) return null;

  const styleFor = (stat) => STATUS_STYLES[stat] ?? STATUS_STYLES.Pending;

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate({ status, reason });
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRefund = async () => {
    setIsSubmitting(true);
    try {
      console.log('BookingModal: Sending refundStatus:', refundStatus, 'refundAmount:', refundAmount);
      await onUpdateRefund({ refundStatus, refundAmount });
    } catch (error) {
      console.error("Error updating refund:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "540px",
          padding: "32px 24px 24px 24px",
          position: "relative",
          maxHeight: "90%",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "28px",
            cursor: "pointer",
            color: "#888"
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div style={{marginBottom: 24}}>
          <h3 style={{fontWeight: 700, fontSize: 22, margin: 0, color: '#222', display: 'flex', alignItems: 'center', gap: 8}}>
            {styleFor(booking.status).icon}
            Manage Booking
          </h3>
          <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 8}}>
            <span className={clsx('px-3 py-1 rounded-full text-sm font-medium text-white', styleFor(booking.status).chip)}>
              {booking.status}
            </span>
            <span style={{fontSize: 13, color: '#888'}}>Last updated: {format(new Date(booking.updatedAt || booking.createdAt), "MMM d 'at' h:mm a")}</span>
          </div>
        </div>
        <div style={{marginBottom: 20}}>
          <div style={{fontWeight: 600, color: '#444', marginBottom: 4}}>Customer</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 38, height: 38, borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {booking.user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <div style={{fontWeight: 500, color: '#222'}}>{booking.user?.name || 'N/A'}</div>
              <div style={{fontSize: 13, color: '#888'}}>{booking.user?.email || 'N/A'}</div>
            </div>
          </div>
        </div>
        <div style={{marginBottom: 20}}>
          <div style={{fontWeight: 600, color: '#444', marginBottom: 4}}>Booking Details</div>
          <div style={{fontSize: 15, color: '#222', marginBottom: 2}}>{booking.tour_package?.package_title || booking.flightMeta?.airline_name || booking.hotelMeta?.hotel_name || "Custom Package"}</div>
          <div style={{fontSize: 14, color: '#666'}}>Booking ID: <span style={{fontWeight: 500}}>{booking.booking_id}</span></div>
          <div style={{fontSize: 14, color: '#666'}}>Total: <span style={{fontWeight: 500}}>${booking.total_price}</span></div>
        </div>
        <div style={{marginBottom: 20}}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 4
            }}
          >
            {showDetails ? 'Hide details' : 'Show more details'}
            <svg style={iconStyle} className={showDetails ? 'rotate-180' : ''} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showDetails && (
            <div style={{background: '#f3f4f6', borderRadius: 8, padding: 12, fontSize: 14, color: '#444', marginTop: 6}}>
              <div>Created: <b>{format(new Date(booking.createdAt), "MMMM d, yyyy")}</b></div>
              {booking.payment_status && <div>Payment Status: <b>{booking.payment_status}</b></div>}
              {booking.additional_notes && <div>Notes: <span style={{color: '#555'}}>{booking.additional_notes}</span></div>}
            </div>
          )}
        </div>
        <div style={{marginBottom: 20}}>
          <div style={{fontWeight: 600, color: '#444', marginBottom: 8}}>Update Status</div>
          <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={clsx(
                  'flex-1 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center transition-all',
                  status === opt.value
                    ? ['bg-gradient-to-r text-white shadow-sm', styleFor(opt.value).grad]
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                )}
                style={{minWidth: 90, border: 'none', outline: 'none', cursor: 'pointer'}}
              >
                {status === opt.value && React.cloneElement(styleFor(opt.value).icon, { style: iconStyle })}
                {opt.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            style={{width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8, resize: 'none'}}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Add notes or reason for status change"
          />
        </div>
        <div style={{marginBottom: 20}}>
          <div style={{fontWeight: 600, color: '#444', marginBottom: 8}}>Refund Management</div>
          <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
            <select value={refundStatus} onChange={e => setRefundStatus(e.target.value)} style={{padding: 8, borderRadius: 6, border: '1.5px solid #e5e7eb'}}>
              <option value="none">None</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select>
            <input type="number" min="0" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} style={{padding: 8, borderRadius: 6, border: '1.5px solid #e5e7eb', width: 120}} placeholder="Refund Amount" />
          </div>
          <button
            disabled={isSubmitting}
            onClick={handleUpdateRefund}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: '#10b981',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              marginTop: 6
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update Refund'}
          </button>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10}}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: '1.5px solid #e5e7eb',
              background: '#fff',
              color: '#444',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            disabled={isSubmitting || (status === booking.status && !reason.trim())}
            onClick={handleUpdate}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
              cursor: isSubmitting || (status === booking.status && !reason.trim()) ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || (status === booking.status && !reason.trim()) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isSubmitting ? (
              <svg style={iconStyle} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            Update Status
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
