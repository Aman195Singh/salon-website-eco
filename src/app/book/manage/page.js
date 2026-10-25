"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineChatAlt2, HiOutlinePhone, HiOutlineArrowLeft } from "react-icons/hi";
import styles from "./manage.module.css";

function generateNextDays(count = 21) {
  const days = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    days.push({ dateStr, dayName, dayNum, monthName });
  }
  return days;
}

function ManageBookingContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [bookingRef, setBookingRef] = useState(initialRef);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sub-view: "details" | "reschedule" | "cancel"
  const [subView, setSubView] = useState("details");

  // Reschedule state
  const [daysList] = useState(() => generateNextDays(21));
  const [selectedDate, setSelectedDate] = useState(() => generateNextDays(21)[0]?.dateStr || "");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

  // Cancellation state
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Auto-search if ref is in URL and phone provided
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setAppointment(null);

    if (!bookingRef.trim() || !phoneNumber.trim()) {
      setErrorMessage("Please enter both your Booking Reference and Phone Number.");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/booking/manage?ref=${encodeURIComponent(bookingRef.trim())}&phone=${encodeURIComponent(phoneNumber.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "No booking found with these details.");
        return;
      }

      setAppointment(data.appointment);
      setSubView("details");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  // Fetch slots when in reschedule subView
  useEffect(() => {
    if (subView !== "reschedule" || !selectedDate) return;

    async function fetchRescheduleSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/booking/availability?date=${selectedDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots);
        } else {
          setAvailableSlots([]);
        }
      } catch {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchRescheduleSlots();
  }, [subView, selectedDate]);

  // Execute Reschedule
  const handleConfirmReschedule = async () => {
    if (!selectedSlot) {
      setErrorMessage("Please select a new time slot.");
      return;
    }

    setRescheduling(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/booking/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          bookingReference: appointment.booking_reference,
          phone: phoneNumber.trim(),
          newSlotTime: selectedSlot.isoString,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reschedule. Please choose another slot.");
        return;
      }

      setSuccessMessage(data.message || "Appointment rescheduled successfully!");
      setAppointment((prev) => ({
        ...prev,
        starts_at: selectedSlot.isoString,
      }));
      setSubView("details");
    } catch {
      setErrorMessage("Network error during reschedule. Please try again.");
    } finally {
      setRescheduling(false);
    }
  };

  // Execute Cancel
  const handleConfirmCancel = async () => {
    setCancelling(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/booking/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          bookingReference: appointment.booking_reference,
          phone: phoneNumber.trim(),
          reason: cancelReason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to cancel appointment.");
        return;
      }

      setSuccessMessage("Your appointment has been cancelled.");
      setAppointment((prev) => ({
        ...prev,
        status: "cancelled",
        canModify: false,
      }));
      setSubView("details");
    } catch {
      setErrorMessage("Network error during cancellation. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const formatISTDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const formatISTTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <span className={styles.tagline}>Self-Service Portal</span>
        <h1 className={styles.title}>Manage Appointment</h1>
        <p className={styles.subtitle}>
          Look up your reservation, reschedule to a convenient date, or cancel in accordance with our salon policy.
        </p>
      </div>

      {/* Global Alerts */}
      {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}
      {successMessage && <div className={styles.successBanner}>✓ {successMessage}</div>}

      {/* Lookup Form (Shown if no appointment selected or to search another) */}
      {!appointment && (
        <div className={styles.card}>
          <form onSubmit={handleLookup}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="ref">
                Booking Reference *
              </label>
              <input
                id="ref"
                type="text"
                className={styles.formInput}
                placeholder="e.g. AL-BK-82A4N"
                required
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="phone">
                Phone Number (Used during booking) *
              </label>
              <input
                id="phone"
                type="tel"
                className={styles.formInput}
                placeholder="e.g. 9876543210"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={searching}>
              {searching ? "Finding Reservation..." : "Find My Appointment"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link href="/book" style={{ color: "#d4af37", fontSize: "0.85rem", textDecoration: "none" }}>
              ← Need to book a new appointment instead?
            </Link>
          </div>
        </div>
      )}

      {/* Appointment View & Actions */}
      {appointment && (
        <div className={styles.card}>
          {/* SubView 1: Details */}
          {subView === "details" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={styles.refBadge}>{appointment.booking_reference}</span>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background:
                      appointment.status === "confirmed"
                        ? "rgba(212, 175, 55, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    color: appointment.status === "confirmed" ? "#d4af37" : "#f87171",
                    border: `1px solid ${appointment.status === "confirmed" ? "rgba(212, 175, 55, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                  }}
                >
                  {appointment.status}
                </span>
              </div>

              <div className={styles.metaRow}>
                <span style={{ color: "#a8a29e" }}>Client:</span>
                <span style={{ fontWeight: 600 }}>{appointment.customer_name}</span>
              </div>

              <div className={styles.metaRow}>
                <span style={{ color: "#a8a29e" }}>Service:</span>
                <span style={{ fontWeight: 600 }}>{appointment.service_name}</span>
              </div>

              <div className={styles.metaRow}>
                <span style={{ color: "#a8a29e" }}>Specialist:</span>
                <span>{appointment.staff_name}</span>
              </div>

              <div className={styles.metaRow}>
                <span style={{ color: "#a8a29e" }}>Scheduled Time:</span>
                <span style={{ fontWeight: 700, color: "#d4af37" }}>
                  {formatISTDate(appointment.starts_at)} at {formatISTTime(appointment.starts_at)}
                </span>
              </div>

              <div className={styles.metaRow}>
                <span style={{ color: "#a8a29e" }}>Amount Due at Salon:</span>
                <span>{appointment.price}</span>
              </div>

              {/* Policy Cutoff Notice */}
              {appointment.status === "confirmed" && (
                <>
                  {appointment.canModify ? (
                    <div className={styles.cutoffNoticeAllowed}>
                      ✓ <strong>Eligible for online changes:</strong> You can reschedule (up to 2h advance) or cancel (up to 4h advance per salon policy) online.
                    </div>
                  ) : (
                    <div className={styles.cutoffNoticeBlocked}>
                      ⏳ <strong>Within 4-Hour Cancellation Window:</strong> Because your appointment is starting shortly, online cancellation is closed (4-hour salon policy). For urgent schedule adjustments, please contact the salon directly:
                      <div>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Hi, regarding my appointment ${appointment.booking_reference}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnWhatsApp}
                        >
                          <HiOutlineChatAlt2 size={18} /> Chat with Salon on WhatsApp
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Operational Action Buttons */}
                  {appointment.canModify && (
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => {
                          setSubView("reschedule");
                          setErrorMessage("");
                        }}
                      >
                        Reschedule Appointment
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => {
                          setSubView("cancel");
                          setErrorMessage("");
                        }}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </>
              )}

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAppointment(null);
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}
                  style={{ background: "transparent", border: "none", color: "#a8a29e", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  ← Search another reservation
                </button>
              </div>
            </div>
          )}

          {/* SubView 2: Reschedule */}
          {subView === "reschedule" && (
            <div>
              <button
                type="button"
                onClick={() => setSubView("details")}
                style={{ background: "transparent", border: "none", color: "#a8a29e", cursor: "pointer", marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <HiOutlineArrowLeft size={16} /> Back to details
              </button>

              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>Select New Date & Time</h2>
              <p style={{ color: "#a8a29e", fontSize: "0.85rem", marginBottom: "20px" }}>
                Choose a new slot for your <strong>{appointment.service_name}</strong>:
              </p>

              {/* Horizontal Date Picker */}
              <div className={styles.dateScroll}>
                {daysList.map((d) => (
                  <div
                    key={d.dateStr}
                    className={`${styles.datePill} ${selectedDate === d.dateStr ? styles.datePillSelected : ""}`}
                    onClick={() => setSelectedDate(d.dateStr)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => e.key === "Enter" && setSelectedDate(d.dateStr)}
                  >
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>{d.dayName}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{d.dayNum}</div>
                    <div style={{ fontSize: "0.65rem" }}>{d.monthName}</div>
                  </div>
                ))}
              </div>

              {/* Slots Grid */}
              <div>
                {loadingSlots ? (
                  <div style={{ textAlign: "center", color: "#a8a29e", padding: "20px 0" }}>Loading slots...</div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#a8a29e", padding: "20px 0" }}>No slots available on this date.</div>
                ) : (
                  <div className={styles.slotsGrid}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.isoString}
                        type="button"
                        className={`${styles.slotBtn} ${selectedSlot?.isoString === slot.isoString ? styles.slotBtnSelected : ""}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.displayTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles.submitBtn}
                disabled={!selectedSlot || rescheduling}
                onClick={handleConfirmReschedule}
              >
                {rescheduling ? "Updating Schedule..." : selectedSlot ? `Confirm New Time: ${selectedSlot.displayTime}` : "Select a Time Slot"}
              </button>
            </div>
          )}

          {/* SubView 3: Cancel */}
          {subView === "cancel" && (
            <div>
              <button
                type="button"
                onClick={() => setSubView("details")}
                style={{ background: "transparent", border: "none", color: "#a8a29e", cursor: "pointer", marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <HiOutlineArrowLeft size={16} /> Back to details
              </button>

              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f87171", marginBottom: "8px" }}>
                Confirm Cancellation
              </h2>
              <p style={{ color: "#a8a29e", fontSize: "0.9rem", marginBottom: "20px" }}>
                Are you sure you want to cancel your appointment for <strong>{appointment.service_name}</strong> on {formatISTDate(appointment.starts_at)}?
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="reason">
                  Reason for cancellation (Optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  className={styles.formInput}
                  placeholder="e.g. Schedule conflict, feeling unwell..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.btnDanger}
                  style={{ flex: 1 }}
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel My Appointment"}
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setSubView("details")}
                >
                  Keep Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <main className={styles.pageWrapper}>
      <Suspense fallback={<div style={{ textAlign: "center", color: "#d4af37", padding: "100px 0" }}>Loading portal...</div>}>
        <ManageBookingContent />
      </Suspense>
    </main>
  );
}
