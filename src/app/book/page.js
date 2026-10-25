"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SERVICES } from "@/lib/content";
import styles from "./book.module.css";

// Helper to generate the next 30 days starting from today in IST
function generateNextDays(count = 21) {
  const days = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    days.push({
      dateStr,
      dayName,
      dayNum,
      monthName,
      isToday: i === 0,
    });
  }
  return days;
}

export default function BookingPage() {
  // Stepper state: 1 = Service, 2 = Specialist, 3 = Date & Time, 4 = Details, 5 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Catalogue and specialists
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [staffList, setStaffList] = useState([
    { id: "any", display_name: "Any Available Specialist", role: "First free stylist" },
    { id: "s1", display_name: "Priya Sharma", role: "Master Hair Stylist" },
    { id: "s2", display_name: "Rajesh Verma", role: "Senior Grooming Expert" },
    { id: "s3", display_name: "Ananya Patel", role: "Bridal & Skin Specialist" },
  ]);

  // Selections
  const [daysList] = useState(() => generateNextDays(21));
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(staffList[0]);
  const [selectedDate, setSelectedDate] = useState(() => generateNextDays(21)[0]?.dateStr || "");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Slots availability state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Confirmation result
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Load published services from Supabase or fallback
  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, category, name, description, price, duration, duration_minutes, is_active")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setServices(data);
          const uniqueCats = ["All", ...new Set(data.map((s) => s.category).filter(Boolean))];
          setCategories(uniqueCats);
        } else {
          const uniqueCats = ["All", ...new Set(DEFAULT_SERVICES.map((s) => s.category))];
          setCategories(uniqueCats);
        }
      } catch {
        // Fallback to DEFAULT_SERVICES
        const uniqueCats = ["All", ...new Set(DEFAULT_SERVICES.map((s) => s.category))];
        setCategories(uniqueCats);
      }
    }

    fetchServices();
  }, []);

  // Load active staff specialists from database
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch("/api/staff");
        const data = await res.json();
        if (data.success && Array.isArray(data.staff) && data.staff.length > 0) {
          const anyOption = { id: "any", display_name: "Any Available Specialist", role: "First free stylist" };
          const active = data.staff
            .filter((s) => s.is_active)
            .map((s) => ({
              id: s.id,
              display_name: s.display_name,
              role: "Salon Specialist",
            }));
          if (active.length > 0) {
            setStaffList([anyOption, ...active]);
          }
        }
      } catch {
        // Fallback to default staff list
      }
    }

    fetchStaff();
  }, []);

  // Fetch slots whenever selectedDate, selectedService or selectedStaff changes
  useEffect(() => {
    if (!selectedDate || currentStep < 3) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setErrorMessage("");
      try {
        const serviceIdParam = selectedService?.id ? `&serviceId=${selectedService.id}` : "";
        const staffParam = selectedStaff?.id ? `&staffId=${selectedStaff.id}` : "";
        const res = await fetch(`/api/booking/availability?date=${selectedDate}${serviceIdParam}${staffParam}`);
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

    fetchSlots();
  }, [selectedDate, selectedService, selectedStaff, currentStep]);

  // Filtered services
  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  // Group slots by period
  const morningSlots = availableSlots.filter((s) => s.period === "morning");
  const afternoonSlots = availableSlots.filter((s) => s.period === "afternoon");
  const eveningSlots = availableSlots.filter((s) => s.period === "evening");

  // Step transitions
  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setCurrentStep(3);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setCurrentStep(4);
  };

  // Submit booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage("Please provide a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          serviceName: selectedService?.name,
          staffId: selectedStaff?.id !== "any" ? selectedStaff?.id : null,
          slotTime: selectedSlot?.isoString,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          customerNotes: customerNotes.trim(),
          idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setErrorMessage(data.message || "This slot was just booked by another customer. Please choose a different time.");
        setCurrentStep(3); // Send back to slot selection
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to confirm booking. Please try again.");
        return;
      }

      // Success!
      setBookingConfirmation(data);
      setCurrentStep(5);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerSection}>
          <span className={styles.tagline}>Seamless Self-Service</span>
          <h1 className={styles.title}>Book Your Appointment</h1>
          <p className={styles.subtitle}>
            Select your preferred luxury service, choose an expert stylist, and lock in your schedule instantly.
          </p>
          <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "#a8a29e" }}>
            Already booked?{" "}
            <Link href="/book/manage" style={{ color: "#d4af37", textDecoration: "underline" }}>
              Manage or reschedule your visit
            </Link>
          </p>
        </div>

        {/* Progress Stepper (Hidden on success) */}
        {currentStep < 5 && (
          <div className={styles.stepper} aria-label="Booking Progress">
            <div className={`${styles.stepItem} ${currentStep === 1 ? styles.stepActive : currentStep > 1 ? styles.stepDone : ""}`}>
              <span className={styles.stepNumber}>1</span>
              <span>Service</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.stepItem} ${currentStep === 2 ? styles.stepActive : currentStep > 2 ? styles.stepDone : ""}`}>
              <span className={styles.stepNumber}>2</span>
              <span>Stylist</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.stepItem} ${currentStep === 3 ? styles.stepActive : currentStep > 3 ? styles.stepDone : ""}`}>
              <span className={styles.stepNumber}>3</span>
              <span>Date & Time</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.stepItem} ${currentStep === 4 ? styles.stepActive : ""}`}>
              <span className={styles.stepNumber}>4</span>
              <span>Confirm</span>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        {currentStep < 5 ? (
          <div className={styles.contentLayout}>
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span>Choose a Service</span>
                  <span style={{ fontSize: "0.85rem", color: "#a8a29e", fontWeight: "normal" }}>Step 1 of 4</span>
                </h2>

                {/* Category Pills */}
                <div className={styles.categoryBar}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.categoryPill} ${selectedCategory === cat ? styles.categoryPillActive : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Services List */}
                <div className={styles.servicesGrid}>
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className={`${styles.serviceItem} ${selectedService?.id === service.id ? styles.serviceItemSelected : ""}`}
                      onClick={() => handleSelectService(service)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => e.key === "Enter" && handleSelectService(service)}
                    >
                      <div className={styles.serviceMeta}>
                        <h4>{service.name}</h4>
                        <p>{service.description || "Expert salon care with premium styling."}</p>
                      </div>
                      <div className={styles.servicePricing}>
                        <div className={styles.servicePrice}>{service.price}</div>
                        <div className={styles.serviceDuration}>{service.duration || "30 min"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Step 2: Select Specialist */}
            {currentStep === 2 && (
              <section className={styles.card}>
                <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(1)}>
                  ← Back to Services
                </button>
                <h2 className={styles.cardTitle}>
                  <span>Choose Specialist</span>
                  <span style={{ fontSize: "0.85rem", color: "#a8a29e", fontWeight: "normal" }}>Step 2 of 4</span>
                </h2>

                <div className={styles.specialistGrid}>
                  {staffList.map((staff) => (
                    <div
                      key={staff.id}
                      className={`${styles.specialistCard} ${selectedStaff?.id === staff.id ? styles.specialistCardSelected : ""}`}
                      onClick={() => handleSelectStaff(staff)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => e.key === "Enter" && handleSelectStaff(staff)}
                    >
                      <div className={styles.specialistAvatar}>
                        {staff.display_name.charAt(0)}
                      </div>
                      <div className={styles.specialistName}>{staff.display_name}</div>
                      <div className={styles.specialistRole}>{staff.role}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Step 3: Date & Time Slot */}
            {currentStep === 3 && (
              <section className={styles.card}>
                <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(2)}>
                  ← Back to Specialist
                </button>
                <h2 className={styles.cardTitle}>
                  <span>Select Date & Time</span>
                  <span style={{ fontSize: "0.85rem", color: "#a8a29e", fontWeight: "normal" }}>Step 3 of 4</span>
                </h2>

                {errorMessage && (
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
                    {errorMessage}
                  </div>
                )}

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
                      <div className={styles.dateDay}>{d.isToday ? "Today" : d.dayName}</div>
                      <div className={styles.dateNumber}>{d.dayNum}</div>
                      <div className={styles.dateMonth}>{d.monthName}</div>
                    </div>
                  ))}
                </div>

                {/* Slots Section */}
                <div className={styles.slotsSection}>
                  {loadingSlots ? (
                    <div className={styles.emptyState}>Loading available slots for {selectedDate}...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className={styles.emptyState}>
                      No available slots on this date. Please select another day.
                    </div>
                  ) : (
                    <>
                      {morningSlots.length > 0 && (
                        <div>
                          <div className={styles.slotPeriodTitle}>Morning Slots</div>
                          <div className={styles.slotsGrid}>
                            {morningSlots.map((slot) => (
                              <button
                                key={slot.isoString}
                                type="button"
                                className={`${styles.slotBtn} ${selectedSlot?.isoString === slot.isoString ? styles.slotBtnSelected : ""}`}
                                onClick={() => handleSelectSlot(slot)}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {afternoonSlots.length > 0 && (
                        <div>
                          <div className={styles.slotPeriodTitle}>Afternoon Slots</div>
                          <div className={styles.slotsGrid}>
                            {afternoonSlots.map((slot) => (
                              <button
                                key={slot.isoString}
                                type="button"
                                className={`${styles.slotBtn} ${selectedSlot?.isoString === slot.isoString ? styles.slotBtnSelected : ""}`}
                                onClick={() => handleSelectSlot(slot)}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {eveningSlots.length > 0 && (
                        <div>
                          <div className={styles.slotPeriodTitle}>Evening Slots</div>
                          <div className={styles.slotsGrid}>
                            {eveningSlots.map((slot) => (
                              <button
                                key={slot.isoString}
                                type="button"
                                className={`${styles.slotBtn} ${selectedSlot?.isoString === slot.isoString ? styles.slotBtnSelected : ""}`}
                                onClick={() => handleSelectSlot(slot)}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Step 4: Customer Details & Form */}
            {currentStep === 4 && (
              <section className={styles.card}>
                <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(3)}>
                  ← Back to Time Slots
                </button>
                <h2 className={styles.cardTitle}>
                  <span>Your Contact Details</span>
                  <span style={{ fontSize: "0.85rem", color: "#a8a29e", fontWeight: "normal" }}>Step 4 of 4</span>
                </h2>

                {errorMessage && (
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleConfirmBooking}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Ananya Sharma"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      className={styles.formInput}
                      placeholder="e.g. 9876543210"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="email">Email Address (Optional)</label>
                    <input
                      id="email"
                      type="email"
                      className={styles.formInput}
                      placeholder="e.g. ananya@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="notes">Special Requests / Notes</label>
                    <textarea
                      id="notes"
                      className={styles.formTextarea}
                      rows={3}
                      placeholder="Hair type, preferences, skin allergies, or specific questions..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.confirmBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Securing Appointment..." : "Confirm & Reserve Slot"}
                  </button>
                </form>
              </section>
            )}

            {/* Sidebar Summary */}
            <aside className={styles.summarySidebar}>
              <div className={styles.card}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", color: "#d4af37" }}>
                  Reservation Summary
                </h3>

                <div className={styles.summaryRow}>
                  <span style={{ color: "#a8a29e" }}>Service:</span>
                  <span style={{ fontWeight: 600 }}>{selectedService?.name || "None selected"}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span style={{ color: "#a8a29e" }}>Specialist:</span>
                  <span>{selectedStaff?.display_name || "Any available"}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span style={{ color: "#a8a29e" }}>Date:</span>
                  <span>{selectedDate || "Not chosen"}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span style={{ color: "#a8a29e" }}>Time:</span>
                  <span>{selectedSlot?.displayTime || "Not chosen"}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span style={{ color: "#a8a29e" }}>Estimated Duration:</span>
                  <span>{selectedService?.duration || "30 min"}</span>
                </div>

                <div className={styles.summaryRowTotal}>
                  <span>Total Due at Salon:</span>
                  <span>{selectedService?.price || "—"}</span>
                </div>

                <div className={styles.policyNotice}>
                  <strong>Salon Policy:</strong> No advance payment required. Free cancellation up to 2 hours before your appointment.
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Step 5: Success Celebration Screen */
          <div className={styles.card} style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>
                Appointment Confirmed!
              </h2>
              <p style={{ color: "#a8a29e", fontSize: "0.95rem" }}>
                Thank you, <strong>{customerName}</strong>. Your luxury appointment is reserved.
              </p>

              <div>
                <span className={styles.refBadge}>
                  {bookingConfirmation?.bookingReference || "AL-BK-CONFIRMED"}
                </span>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "12px", textAlign: "left", margin: "16px 0", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#a8a29e" }}>Service:</span>
                  <span style={{ fontWeight: 600 }}>{selectedService?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#a8a29e" }}>Specialist:</span>
                  <span>{selectedStaff?.display_name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#a8a29e" }}>Date & Time:</span>
                  <span>{selectedDate} at {selectedSlot?.displayTime}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#a8a29e" }}>Pay at Salon:</span>
                  <span style={{ color: "#d4af37", fontWeight: 700 }}>{selectedService?.price}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi, I just booked an appointment at your salon! Booking Reference: ${bookingConfirmation?.bookingReference || "AL-BK-CONFIRMED"}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.confirmBtn}
                  style={{ textDecoration: "none", display: "inline-block", width: "auto", padding: "12px 24px" }}
                >
                  Message Salon on WhatsApp
                </a>
                <Link href="/" className={styles.actionBtnSecondary}>
                  Return to Home
                </Link>
                <Link
                  href={`/book/manage?ref=${encodeURIComponent(bookingConfirmation?.bookingReference || "")}`}
                  className={styles.actionBtnSecondary}
                >
                  Manage / Reschedule
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedSlot(null);
                    setBookingConfirmation(null);
                  }}
                  className={styles.actionBtnSecondary}
                >
                  Book Another Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
