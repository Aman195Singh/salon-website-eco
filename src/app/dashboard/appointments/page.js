"use client";

import { useState, useEffect, useMemo } from "react";
import {
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUserAdd,
  HiOutlineX,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import styles from "./appointments.module.css";

// Initial sample appointments for immediate demonstration
const INITIAL_APPOINTMENTS = [
  {
    id: "appt-1",
    booking_reference: "AL-BK-82A4N",
    customer_name: "Aman Singh",
    customer_phone: "9876543210",
    customer_email: "aman@example.com",
    service_name: "Haircut — Men",
    duration_minutes: 30,
    price: "₹450",
    staff_name: "Priya Sharma",
    starts_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    customer_notes: "First time haircut appointment",
  },
  {
    id: "appt-2",
    booking_reference: "AL-BK-49J2M",
    customer_name: "Kavita Rao",
    customer_phone: "9812345678",
    customer_email: "kavita@example.com",
    service_name: "Gold Facial",
    duration_minutes: 60,
    price: "₹2,200",
    staff_name: "Ananya Patel",
    starts_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "arrived",
    customer_notes: "Prefers organic skin products",
  },
  {
    id: "appt-3",
    booking_reference: "AL-BK-11X9Q",
    customer_name: "Rohan Kapoor",
    customer_phone: "9988776655",
    customer_email: "rohan@example.com",
    service_name: "Hair Spa",
    duration_minutes: 45,
    price: "₹1,200",
    staff_name: "Rajesh Verma",
    starts_at: new Date().toISOString(),
    status: "in_service",
    customer_notes: "",
  },
  {
    id: "appt-4",
    booking_reference: "AL-BK-77K3Z",
    customer_name: "Deepa Mehta",
    customer_phone: "9765432109",
    customer_email: "deepa@example.com",
    service_name: "Haircut — Women",
    duration_minutes: 45,
    price: "₹850",
    staff_name: "Priya Sharma",
    starts_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    customer_notes: "",
  },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFeedback, setActionFeedback] = useState("");

  // Walk-In & Manual Booking Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState("");
  const [walkInForm, setWalkInForm] = useState({
    serviceName: "Haircut — Men",
    price: "₹450",
    staffId: "any",
    staffName: "Priya Sharma",
    isRightNow: true,
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "14:00",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNotes: "Walk-in client",
    initialStatus: "arrived",
  });

  // Load active staff members for specialist selector
  useEffect(() => {
    async function loadStaffList() {
      try {
        const res = await fetch("/api/staff");
        const data = await res.json();
        if (data.success && Array.isArray(data.staff)) {
          setStaffOptions(data.staff);
        }
      } catch {}
    }
    loadStaffList();
  }, []);

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setWalkInError("");
    if (!walkInForm.customerName.trim() || !walkInForm.customerPhone.trim()) {
      setWalkInError("Customer name and phone number are required.");
      return;
    }

    setSubmittingWalkIn(true);
    try {
      let slotIso = new Date().toISOString();
      if (!walkInForm.isRightNow) {
        if (!walkInForm.scheduledDate || !walkInForm.scheduledTime) {
          setWalkInError("Please select scheduled date and time.");
          setSubmittingWalkIn(false);
          return;
        }
        slotIso = new Date(`${walkInForm.scheduledDate}T${walkInForm.scheduledTime}:00`).toISOString();
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: walkInForm.serviceName,
          staffId: walkInForm.staffId,
          slotTime: slotIso,
          customerName: walkInForm.customerName.trim(),
          customerPhone: walkInForm.customerPhone.trim(),
          customerEmail: walkInForm.customerEmail.trim() || undefined,
          customerNotes: walkInForm.customerNotes.trim(),
          isWalkIn: true,
          initialStatus: walkInForm.initialStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setWalkInError(data.error || data.message || "Failed to create booking.");
        return;
      }

      // Add new appointment to top of dashboard list
      const newAppt = {
        id: `appt-manual-${Date.now()}`,
        booking_reference: data.bookingReference,
        customer_name: walkInForm.customerName.trim(),
        customer_phone: walkInForm.customerPhone.trim(),
        customer_email: walkInForm.customerEmail.trim(),
        service_name: data.serviceName || walkInForm.serviceName,
        duration_minutes: data.durationMinutes || 30,
        price: walkInForm.price,
        staff_name: walkInForm.staffName,
        starts_at: data.startsAt || slotIso,
        status: data.status || walkInForm.initialStatus,
        customer_notes: walkInForm.customerNotes.trim(),
      };

      setAppointments((prev) => [newAppt, ...prev]);
      setActionFeedback(`Walk-in booked! Reference: ${data.bookingReference} for ${walkInForm.customerName}`);
      setShowWalkInModal(false);
      setWalkInForm({
        serviceName: "Haircut — Men",
        price: "₹450",
        staffId: "any",
        staffName: "Priya Sharma",
        isRightNow: true,
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: "14:00",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerNotes: "Walk-in client",
        initialStatus: "arrived",
      });
    } catch {
      setWalkInError("Network error while creating walk-in booking.");
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  // Load live appointments from Supabase if table exists
  useEffect(() => {
    async function fetchLiveAppointments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            booking_reference,
            starts_at,
            ends_at,
            status,
            customer_notes,
            customers (full_name, phone, email),
            staff (display_name),
            appointment_services (service_name_snapshot, duration_minutes_snapshot, price_paise_snapshot)
          `)
          .order("starts_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            booking_reference: item.booking_reference,
            customer_name: item.customers?.full_name || "Guest Customer",
            customer_phone: item.customers?.phone || "",
            customer_email: item.customers?.email || "",
            service_name: item.appointment_services?.[0]?.service_name_snapshot || "Salon Service",
            duration_minutes: item.appointment_services?.[0]?.duration_minutes_snapshot || 30,
            price: item.appointment_services?.[0]?.price_paise_snapshot
              ? `₹${item.appointment_services[0].price_paise_snapshot / 100}`
              : "—",
            staff_name: item.staff?.display_name || "Specialist",
            starts_at: item.starts_at,
            status: item.status,
            customer_notes: item.customer_notes || "",
          }));
          setAppointments(mapped);
        }
      } catch {
        // Fallback to sample appointments
      } finally {
        setLoading(false);
      }
    }

    fetchLiveAppointments();
  }, []);

  // Update appointment status
  const handleStatusChange = async (appointmentId, newStatus) => {
    // Optimistic local update
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );

    setActionFeedback(`Status updated to ${newStatus}.`);
    setTimeout(() => setActionFeedback(""), 3000);

    try {
      await fetch("/api/booking/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          newStatus,
        }),
      });
    } catch (err) {
      console.warn("Status update network note:", err);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = appt.customer_name?.toLowerCase().includes(query);
        const matchesPhone = appt.customer_phone?.includes(query);
        const matchesRef = appt.booking_reference?.toLowerCase().includes(query);
        const matchesService = appt.service_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesRef && !matchesService) {
          return false;
        }
      }

      // 2. Status match
      if (statusFilter !== "all" && appt.status !== statusFilter) {
        return false;
      }

      // 3. Date match
      if (dateFilter !== "all") {
        const apptDate = new Date(appt.starts_at).toISOString().split("T")[0];
        const todayDate = new Date().toISOString().split("T")[0];
        const isToday = apptDate === todayDate;
        const isPast = new Date(appt.starts_at) < new Date();

        if (dateFilter === "today" && !isToday) return false;
        if (dateFilter === "upcoming" && (isPast && !isToday)) return false;
        if (dateFilter === "past" && !isPast) return false;
      }

      return true;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  // Metric stats
  const totalCount = appointments.length;
  const todayCount = appointments.filter(
    (a) => new Date(a.starts_at).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
  ).length;
  const inServiceCount = appointments.filter((a) => a.status === "in_service").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const formatISTDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
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

  const getStatusBadgeClass = (status) => {
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
    <div className={styles.pageContainer}>
      {/* Header with Walk-In Action */}
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <h1>Appointment Schedule</h1>
          <p>Manage in-person client visits, verify arrivals, track service progress, and update statuses.</p>
        </div>
        <button
          type="button"
          className={styles.btnWalkIn}
          onClick={() => setShowWalkInModal(true)}
        >
          <HiOutlineUserAdd size={18} /> Book Walk-In / Phone Client
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div style={{ background: "rgba(139, 111, 78, 0.12)", border: "1px solid var(--color-primary, #8B6F4E)", color: "var(--color-primary, #8B6F4E)", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem", fontWeight: 600 }}>
          ✓ {actionFeedback}
        </div>
      )}

      {/* Metrics Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Today&apos;s Bookings</span>
          <span className={`${styles.statValue} ${styles.statValueGold}`}>{todayCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Currently In Service</span>
          <span className={`${styles.statValue} ${styles.statValueBlue}`}>{inServiceCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed</span>
          <span className={`${styles.statValue} ${styles.statValueGreen}`}>{completedCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Active</span>
          <span className={styles.statValue}>{totalCount}</span>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className={styles.controlBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search client, phone, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {/* Date Range Pills */}
          <div className={styles.datePills}>
            <button
              type="button"
              className={`${styles.datePill} ${dateFilter === "all" ? styles.datePillActive : ""}`}
              onClick={() => setDateFilter("all")}
            >
              All Dates
            </button>
            <button
              type="button"
              className={`${styles.datePill} ${dateFilter === "today" ? styles.datePillActive : ""}`}
              onClick={() => setDateFilter("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`${styles.datePill} ${dateFilter === "upcoming" ? styles.datePillActive : ""}`}
              onClick={() => setDateFilter("upcoming")}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`${styles.datePill} ${dateFilter === "past" ? styles.datePillActive : ""}`}
              onClick={() => setDateFilter("past")}
            >
              Past
            </button>
          </div>

          {/* Status Dropdown Filter */}
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="in_service">In Service</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            No appointments match your search or filter criteria.
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <div key={appt.id} className={styles.appointmentCard}>
              {/* Col 1: Reference & Time */}
              <div className={styles.refCol}>
                <span className={styles.bookingRef}>{appt.booking_reference}</span>
                <span className={styles.timeDisplay}>{formatISTTime(appt.starts_at)}</span>
                <span className={styles.dateDisplay}>{formatISTDate(appt.starts_at)}</span>
              </div>

              {/* Col 2: Client Info & Quick Actions */}
              <div className={styles.clientCol}>
                <div className={styles.clientName}>{appt.customer_name}</div>
                <div className={styles.clientContact}>
                  <span>{appt.customer_phone}</span>
                  {appt.customer_phone && (
                    <>
                      <a
                        href={`https://wa.me/${appt.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${appt.customer_name}, regarding your appointment (${appt.booking_reference}) at our salon...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactLink}
                        title="Chat on WhatsApp"
                      >
                        <HiOutlineChatAlt2 size={16} /> WhatsApp
                      </a>
                      <a
                        href={`tel:${appt.customer_phone}`}
                        className={styles.contactLink}
                        title="Call Client"
                      >
                        <HiOutlinePhone size={14} /> Call
                      </a>
                    </>
                  )}
                </div>
                {appt.customer_notes && (
                  <div style={{ fontSize: "0.8rem", color: "#a8a29e", fontStyle: "italic", marginTop: "4px" }}>
                    &ldquo;{appt.customer_notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Col 3: Service & Stylist */}
              <div className={styles.serviceCol}>
                <div className={styles.serviceName}>{appt.service_name}</div>
                <div className={styles.staffAssignee}>Specialist: <strong>{appt.staff_name}</strong></div>
                <div className={styles.priceDuration}>
                  {appt.price} • {appt.duration_minutes} min
                </div>
              </div>

              {/* Col 4: Status Badge */}
              <div>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(appt.status)}`}>
                  {appt.status.replace("_", " ")}
                </span>
              </div>

              {/* Col 5: Operational Status Action Selector */}
              <div className={styles.actionCol}>
                <select
                  className={styles.actionSelect}
                  value={appt.status}
                  onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="arrived">Mark Arrived</option>
                  <option value="in_service">Start Service</option>
                  <option value="completed">Complete</option>
                  <option value="cancelled">Cancel Appointment</option>
                  <option value="no_show">Mark No Show</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Book Walk-In / Phone Client */}
      {showWalkInModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Book Walk-In / Phone Client</h2>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                style={{ background: "transparent", border: "none", color: "#a8a29e", cursor: "pointer" }}
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {walkInError && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" }}>
                {walkInError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInService">
                    Service *
                  </label>
                  <select
                    id="walkInService"
                    className={styles.formSelect}
                    value={walkInForm.serviceName}
                    onChange={(e) => {
                      const sName = e.target.value;
                      let p = "₹450";
                      if (sName.includes("Facial")) p = "₹2,200";
                      if (sName.includes("Spa")) p = "₹1,200";
                      if (sName.includes("Beard")) p = "₹350";
                      setWalkInForm({ ...walkInForm, serviceName: sName, price: p });
                    }}
                  >
                    <option value="Haircut — Men">Haircut — Men (₹450, 30m)</option>
                    <option value="Haircut & Styling — Women">Haircut & Styling — Women (₹950, 45m)</option>
                    <option value="Royal Beard Grooming">Royal Beard Grooming (₹350, 20m)</option>
                    <option value="Gold Radiance Facial">Gold Radiance Facial (₹2,200, 60m)</option>
                    <option value="Deep Conditioning Hair Spa">Deep Conditioning Hair Spa (₹1,200, 45m)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInStaff">
                    Assigned Specialist *
                  </label>
                  <select
                    id="walkInStaff"
                    className={styles.formSelect}
                    value={walkInForm.staffId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const selected = staffOptions.find((s) => s.id === id);
                      setWalkInForm({
                        ...walkInForm,
                        staffId: id,
                        staffName: selected?.display_name || "Any Specialist",
                      });
                    }}
                  >
                    <option value="any">First Available Specialist</option>
                    {staffOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.display_name} ({s.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing & Mode */}
              <div style={{ background: "var(--color-bg-alt, #F5F0E8)", border: "1px solid var(--color-border, #E8E0D4)", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: walkInForm.isRightNow ? "0" : "12px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem", color: walkInForm.isRightNow ? "var(--color-primary, #8B6F4E)" : "var(--color-text-secondary, #6B5D4F)", fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="walkInMode"
                      checked={walkInForm.isRightNow}
                      onChange={() => setWalkInForm({ ...walkInForm, isRightNow: true, initialStatus: "arrived" })}
                    />
                    Walk-In Right Now (Immediate)
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem", color: !walkInForm.isRightNow ? "var(--color-primary, #8B6F4E)" : "var(--color-text-secondary, #6B5D4F)", fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="walkInMode"
                      checked={!walkInForm.isRightNow}
                      onChange={() => setWalkInForm({ ...walkInForm, isRightNow: false, initialStatus: "confirmed" })}
                    />
                    Phone / Future Reservation
                  </label>
                </div>

                {!walkInForm.isRightNow && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Date *</label>
                      <input
                        type="date"
                        className={styles.formInput}
                        required
                        value={walkInForm.scheduledDate}
                        onChange={(e) => setWalkInForm({ ...walkInForm, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Time Slot *</label>
                      <input
                        type="time"
                        className={styles.formInput}
                        required
                        value={walkInForm.scheduledTime}
                        onChange={(e) => setWalkInForm({ ...walkInForm, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInName">
                    Customer Name *
                  </label>
                  <input
                    id="walkInName"
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Vikram Seth"
                    required
                    value={walkInForm.customerName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInPhone">
                    Phone Number *
                  </label>
                  <input
                    id="walkInPhone"
                    type="tel"
                    className={styles.formInput}
                    placeholder="e.g. 9876543210"
                    required
                    value={walkInForm.customerPhone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInStatus">
                    Initial Status
                  </label>
                  <select
                    id="walkInStatus"
                    className={styles.formSelect}
                    value={walkInForm.initialStatus}
                    onChange={(e) => setWalkInForm({ ...walkInForm, initialStatus: e.target.value })}
                  >
                    <option value="arrived">Mark Arrived (In Lobby)</option>
                    <option value="in_service">In Service (In Chair)</option>
                    <option value="confirmed">Confirmed (Scheduled)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="walkInEmail">
                    Email (Optional)
                  </label>
                  <input
                    id="walkInEmail"
                    type="email"
                    className={styles.formInput}
                    placeholder="e.g. client@example.com"
                    value={walkInForm.customerEmail}
                    onChange={(e) => setWalkInForm({ ...walkInForm, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="walkInNotes">
                  Front Desk / Client Notes
                </label>
                <input
                  id="walkInNotes"
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Walk-in from salon lobby; requested scissor cut."
                  value={walkInForm.customerNotes}
                  onChange={(e) => setWalkInForm({ ...walkInForm, customerNotes: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setShowWalkInModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={submittingWalkIn}
                >
                  {submittingWalkIn ? "Recording Booking..." : "Confirm & Record Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
