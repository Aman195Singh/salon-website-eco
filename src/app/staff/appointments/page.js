"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./staff.module.css";

const FALLBACK_STAFF = [
  { id: "s1", display_name: "Priya Sharma" },
  { id: "s2", display_name: "Rajesh Verma" },
  { id: "s3", display_name: "Ananya Patel" },
];

export default function StaffAppointmentsPage() {
  const [staffList, setStaffList] = useState(FALLBACK_STAFF);
  const [selectedStaffId, setSelectedStaffId] = useState(FALLBACK_STAFF[0].id);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Load active staff members
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/staff");
        const data = await res.json();
        if (data.success && Array.isArray(data.staff) && data.staff.length > 0) {
          const active = data.staff.filter((s) => s.is_active);
          if (active.length > 0) {
            setStaffList(active);
            setSelectedStaffId(active[0].id);
          }
        }
      } catch {
        // Keep fallback staff
      }
    }
    loadStaff();
  }, []);

  // Fetch appointments for selected specialist & date
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setBannerMessage(null);
    try {
      const res = await fetch(
        `/api/booking?staffId=${encodeURIComponent(selectedStaffId)}&date=${encodeURIComponent(selectedDate)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        // Fallback demonstration appointments
        setAppointments([
          {
            id: "appt-demo-1",
            booking_reference: "AL-BK-91X3B",
            customer_name: "Rahul Verma",
            customer_phone: "9876543210",
            service_name: "Haircut & Beard Trim",
            duration_minutes: 45,
            starts_at: `${selectedDate}T10:30:00+05:30`,
            status: "confirmed",
            customer_notes: "Low skin fade on sides, trim mustache lightly.",
          },
          {
            id: "appt-demo-2",
            booking_reference: "AL-BK-54K2P",
            customer_name: "Karan Mehta",
            customer_phone: "9812345678",
            service_name: "Deep Cleansing Facial",
            duration_minutes: 60,
            starts_at: `${selectedDate}T12:00:00+05:30`,
            status: "arrived",
            customer_notes: "First time facial client.",
          },
          {
            id: "appt-demo-3",
            booking_reference: "AL-BK-72L9R",
            customer_name: "Vikram Malhotra",
            customer_phone: "9899887766",
            service_name: "Hair Spa & Scalp Massage",
            duration_minutes: 50,
            starts_at: `${selectedDate}T14:15:00+05:30`,
            status: "completed",
            customer_notes: "",
          },
        ]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStaffId, selectedDate]);

  useEffect(() => {
    if (selectedStaffId && selectedDate) {
      fetchSchedule();
    }
  }, [selectedStaffId, selectedDate, fetchSchedule]);

  // Handle rapid operational status update
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setActionInProgress(appointmentId);
    setBannerMessage(null);
    try {
      const res = await fetch("/api/booking/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
        );
        setBannerMessage({
          type: "success",
          text: `Status updated to "${newStatus.replace("_", " ").toUpperCase()}".`,
        });
      } else {
        setBannerMessage({
          type: "error",
          text: data.error || "Failed to update status.",
        });
      }
    } catch {
      setBannerMessage({
        type: "error",
        text: "Network error updating status.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatTime = (isoStr) => {
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

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return styles.statusConfirmed;
      case "arrived":
        return styles.statusArrived;
      case "in_service":
        return styles.statusInService;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      case "no_show":
        return styles.statusNoShow;
      default:
        return styles.statusConfirmed;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.portalContainer}>
        {/* Header */}
        <header className={styles.portalHeader}>
          <div>
            <span className={styles.brandBadge}>Salon Specialist View</span>
            <h1 className={styles.portalTitle}>Chair-Side Schedule</h1>
          </div>
          <Link href="/dashboard" className={styles.switchLink}>
            Dashboard →
          </Link>
        </header>

        {/* Banner Alert */}
        {bannerMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.85rem",
              background:
                bannerMessage.type === "success"
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
              color: bannerMessage.type === "success" ? "#34d399" : "#f87171",
              border: `1px solid ${bannerMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {bannerMessage.text}
          </div>
        )}

        {/* Filter Controls */}
        <div className={styles.controlsCard}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="staffSelect">
              Stylist / Specialist
            </label>
            <select
              id="staffSelect"
              className={styles.controlSelect}
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="dateSelect">
              Appointment Date (IST)
            </label>
            <input
              id="dateSelect"
              type="date"
              className={styles.controlInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Appointments List */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#a8a29e" }}>
              Loading schedule...
            </div>
          ) : appointments.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✂️</div>
              <p>No appointments booked for this specialist on this date.</p>
            </div>
          ) : (
            <div className={styles.appointmentList}>
              {appointments.map((appt) => (
                <div key={appt.id} className={styles.appointmentCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.timeBadge}>{formatTime(appt.starts_at)}</span>
                    <span className={`${styles.statusPill} ${getStatusClass(appt.status)}`}>
                      {appt.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className={styles.clientName}>{appt.customer_name}</div>
                  <div className={styles.serviceInfo}>
                    ✂️ {appt.service_name} • {appt.duration_minutes} min
                  </div>

                  <div className={styles.clientContact}>
                    <span>Ref: {appt.booking_reference}</span>
                    {appt.customer_phone && (
                      <span>
                        📞{" "}
                        <a href={`tel:${appt.customer_phone}`} className={styles.phoneLink}>
                          {appt.customer_phone}
                        </a>
                      </span>
                    )}
                  </div>

                  {appt.customer_notes && (
                    <div className={styles.notesBox}>
                      &ldquo;{appt.customer_notes}&rdquo;
                    </div>
                  )}

                  {/* Status Actions Grid */}
                  <div className={styles.actionGrid}>
                    {appt.status === "confirmed" && (
                      <>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnArrived}`}
                          disabled={actionInProgress === appt.id}
                          onClick={() => handleUpdateStatus(appt.id, "arrived")}
                        >
                          ✓ Mark Arrived
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnNoShow}`}
                          disabled={actionInProgress === appt.id}
                          onClick={() => handleUpdateStatus(appt.id, "no_show")}
                        >
                          ✕ No Show
                        </button>
                      </>
                    )}

                    {appt.status === "arrived" && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnStart}`}
                        disabled={actionInProgress === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, "in_service")}
                      >
                        ▶ Start Service
                      </button>
                    )}

                    {appt.status === "in_service" && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnComplete}`}
                        disabled={actionInProgress === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, "completed")}
                      >
                        ✓ Complete Service
                      </button>
                    )}

                    {appt.status === "completed" && (
                      <div style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 600 }}>
                        ✓ Service Completed
                      </div>
                    )}

                    {appt.status === "cancelled" && (
                      <div style={{ fontSize: "0.8rem", color: "#f87171" }}>
                        ✕ Appointment Cancelled
                      </div>
                    )}

                    {appt.status === "no_show" && (
                      <div style={{ fontSize: "0.8rem", color: "#f87171" }}>
                        ✕ Client Did Not Show Up
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
