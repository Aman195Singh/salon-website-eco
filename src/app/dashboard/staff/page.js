"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUserAdd,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCurrencyRupee,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlinePencilAlt,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import styles from "./staff.module.css";

const DAY_NAMES = [
  { dayNum: 1, name: "Monday" },
  { dayNum: 2, name: "Tuesday" },
  { dayNum: 3, name: "Wednesday" },
  { dayNum: 4, name: "Thursday" },
  { dayNum: 5, name: "Friday" },
  { dayNum: 6, name: "Saturday" },
  { dayNum: 0, name: "Sunday" },
];

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "directory" | "attendance" | "payroll" | "recruitment" | "shifts" | "leaves"
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // HR Data States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );

  const [candidates, setCandidates] = useState([]);

  // Selected specialist for shift editing
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [currentWorkingHours, setCurrentWorkingHours] = useState([]);
  const [currentBreaks, setCurrentBreaks] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Modals
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    displayName: "",
    fullName: "",
    role: "stylist",
    phone: "",
    email: "",
    bio: "",
    employmentStatus: "active",
    joiningDate: new Date().toISOString().split("T")[0],
    baseSalaryPaise: 2500000,
    commissionPercentage: 15.0,
    salaryType: "base_plus_commission",
    emergencyContactName: "",
    emergencyContactPhone: "",
    idProofType: "Aadhaar",
    idProofNumber: "",
    specializations: "",
    notes: "",
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState({
    staffId: "",
    workDate: new Date().toISOString().split("T")[0],
    status: "present",
    checkInTime: "10:00",
    checkOutTime: "20:00",
    notes: "",
  });

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollFormData, setPayrollFormData] = useState({
    staffId: "",
    staffName: "",
    payPeriod: new Date().toISOString().substring(0, 7),
    baseSalaryPaise: 0,
    commissionPaise: 0,
    bonusPaise: 0,
    deductionsPaise: 0,
    paymentStatus: "paid",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateFormData, setCandidateFormData] = useState({
    id: null,
    fullName: "",
    phone: "",
    email: "",
    roleApplied: "Senior Stylist",
    experienceYears: 3.0,
    expectedSalaryPaise: 2500000,
    status: "applied",
    interviewDate: "",
    portfolioLink: "",
    notes: "",
  });

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitFormData, setExitFormData] = useState({
    staffId: "",
    staffName: "",
    exitType: "resigned",
    exitDate: new Date().toISOString().split("T")[0],
    exitReason: "",
    exitNotes: "",
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeaveData, setNewLeaveData] = useState({
    staffId: "",
    startsAt: "",
    endsAt: "",
    reason: "",
  });

  // Fetch all staff
  async function fetchStaff() {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaffList(data.staff);
        if (!selectedStaffId && data.staff.length > 0) {
          setSelectedStaffId(data.staff[0].id);
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load staff directory." });
    } finally {
      setLoading(false);
    }
  }

  // Fetch Attendance for selected date
  async function fetchAttendance(date) {
    try {
      const res = await fetch(`/api/staff/hr/attendance?date=${date}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setAttendanceRecords(data.records);
      }
    } catch {
      console.warn("Could not fetch attendance records.");
    }
  }

  // Fetch Payroll for selected month
  async function fetchPayroll(month) {
    try {
      const res = await fetch(`/api/staff/hr/payroll?month=${month}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setPayrollRecords(data.records);
      }
    } catch {
      console.warn("Could not fetch payroll records.");
    }
  }

  // Fetch Recruitment candidates
  async function fetchRecruitment() {
    try {
      const res = await fetch("/api/staff/hr/recruitment");
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates)) {
        setCandidates(data.candidates);
      }
    } catch {
      console.warn("Could not fetch recruitment candidates.");
    }
  }

  useEffect(() => {
    fetchStaff();
    fetchAttendance(selectedAttendanceDate);
    fetchPayroll(selectedPayrollMonth);
    fetchRecruitment();
  }, []);

  // Sync working hours when selected specialist changes in Shift editor
  useEffect(() => {
    if (!selectedStaffId || staffList.length === 0) return;
    const specialist = staffList.find((s) => s.id === selectedStaffId);
    if (!specialist) return;

    const defaultHours = DAY_NAMES.map((d) => {
      const existing = specialist.working_hours?.find((wh) => wh.day_of_week === d.dayNum);
      return (
        existing || {
          day_of_week: d.dayNum,
          start_time: "10:00",
          end_time: "20:00",
          is_active: d.dayNum !== 0,
        }
      );
    });

    const defaultBreaks = DAY_NAMES.map((d) => {
      const existing = specialist.breaks?.find((b) => b.day_of_week === d.dayNum);
      return (
        existing || {
          day_of_week: d.dayNum,
          start_time: "13:00",
          end_time: "14:00",
          label: "Lunch Break",
        }
      );
    });

    setCurrentWorkingHours(defaultHours);
    setCurrentBreaks(defaultBreaks);
  }, [selectedStaffId, staffList]);

  // Open Add / Edit Staff Modal
  function handleOpenStaffModal(staff = null) {
    if (staff) {
      setEditingStaffId(staff.id);
      setStaffFormData({
        displayName: staff.display_name || "",
        fullName: staff.full_name || "",
        role: staff.role || "stylist",
        phone: staff.phone || "",
        email: staff.email || "",
        bio: staff.bio || "",
        employmentStatus: staff.employment_status || "active",
        joiningDate: staff.joining_date || new Date().toISOString().split("T")[0],
        baseSalaryPaise: staff.base_salary_paise || 2500000,
        commissionPercentage: staff.commission_percentage !== undefined ? staff.commission_percentage : 15.0,
        salaryType: staff.salary_type || "base_plus_commission",
        emergencyContactName: staff.emergency_contact_name || "",
        emergencyContactPhone: staff.emergency_contact_phone || "",
        idProofType: staff.id_proof_type || "Aadhaar",
        idProofNumber: staff.id_proof_number || "",
        specializations: Array.isArray(staff.specializations) ? staff.specializations.join(", ") : "",
        notes: staff.notes || "",
      });
    } else {
      setEditingStaffId(null);
      setStaffFormData({
        displayName: "",
        fullName: "",
        role: "stylist",
        phone: "",
        email: "",
        bio: "",
        employmentStatus: "active",
        joiningDate: new Date().toISOString().split("T")[0],
        baseSalaryPaise: 2500000,
        commissionPercentage: 15.0,
        salaryType: "base_plus_commission",
        emergencyContactName: "",
        emergencyContactPhone: "",
        idProofType: "Aadhaar",
        idProofNumber: "",
        specializations: "Hair Styling, Cuts",
        notes: "",
      });
    }
    setShowStaffModal(true);
  }

  // Save Staff (Add or Edit)
  async function handleSaveStaff(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        id: editingStaffId,
        displayName: staffFormData.displayName,
        fullName: staffFormData.fullName,
        role: staffFormData.role,
        phone: staffFormData.phone,
        email: staffFormData.email,
        bio: staffFormData.bio,
        isActive: staffFormData.employmentStatus === "active" || staffFormData.employmentStatus === "probation",
        employmentStatus: staffFormData.employmentStatus,
        joiningDate: staffFormData.joiningDate,
        baseSalaryPaise: staffFormData.baseSalaryPaise,
        commissionPercentage: staffFormData.commissionPercentage,
        salaryType: staffFormData.salaryType,
        emergencyContactName: staffFormData.emergencyContactName,
        emergencyContactPhone: staffFormData.emergencyContactPhone,
        idProofType: staffFormData.idProofType,
        idProofNumber: staffFormData.idProofNumber,
        specializations: staffFormData.specializations
          ? staffFormData.specializations.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        notes: staffFormData.notes,
      };

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: editingStaffId ? "Staff profile updated successfully." : "New staff member onboarded." });
        setShowStaffModal(false);
        fetchStaff();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to save staff profile." });
      }
    } catch {
      setFeedback({ type: "error", message: "An error occurred while saving staff profile." });
    } finally {
      setLoading(false);
    }
  }

  // Toggle active status
  async function handleToggleActive(staff) {
    try {
      const newStatus = !staff.is_active;
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: staff.id,
          displayName: staff.display_name,
          isActive: newStatus,
          employmentStatus: newStatus ? "active" : "on_leave",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: `${staff.display_name} is now ${newStatus ? "Active" : "Inactive"}.` });
        fetchStaff();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update staff status." });
    }
  }

  // Quick Attendance Mark
  async function handleQuickMarkAttendance(staffId, status) {
    try {
      const res = await fetch("/api/staff/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          workDate: selectedAttendanceDate,
          status,
          checkInTime: status === "present" ? "10:00" : status === "late" ? "10:30" : null,
          checkOutTime: status === "present" || status === "late" ? "20:00" : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Attendance marked successfully." });
        fetchAttendance(selectedAttendanceDate);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to mark attendance." });
    }
  }

  // Save Detailed Attendance
  async function handleSaveAttendance(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/staff/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceFormData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Attendance record updated." });
        setShowAttendanceModal(false);
        fetchAttendance(selectedAttendanceDate);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update attendance." });
    }
  }

  // Save Payroll / Mark Paid
  async function handleSavePayroll(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/staff/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payrollFormData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Payroll record saved." });
        setShowPayrollModal(false);
        fetchPayroll(selectedPayrollMonth);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to save payroll record." });
    }
  }

  // Candidate Stage Update
  async function handleUpdateCandidateStage(candidate, newStage) {
    try {
      const res = await fetch("/api/staff/hr/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: candidate.id,
          fullName: candidate.full_name,
          phone: candidate.phone,
          status: newStage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: `Candidate moved to ${newStage.toUpperCase()}.` });
        fetchRecruitment();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update candidate status." });
    }
  }

  // Save Candidate (New or Edit)
  async function handleSaveCandidate(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/staff/hr/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateFormData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Candidate saved to recruitment pipeline." });
        setShowCandidateModal(false);
        fetchRecruitment();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to save candidate." });
    }
  }

  // Delete Candidate
  async function handleDeleteCandidate(id) {
    if (!window.confirm("Are you sure you want to remove this applicant?")) return;
    try {
      const res = await fetch(`/api/staff/hr/recruitment?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Applicant removed." });
        fetchRecruitment();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to delete applicant." });
    }
  }

  // Open Exit / Attrition Modal
  function handleOpenExitModal(staff) {
    setExitFormData({
      staffId: staff.id,
      staffName: staff.display_name,
      exitType: "resigned",
      exitDate: new Date().toISOString().split("T")[0],
      exitReason: "Career advancement",
      exitNotes: "",
    });
    setShowExitModal(true);
  }

  // Process Exit / Termination
  async function handleProcessExit(e) {
    e.preventDefault();
    if (!window.confirm(`Confirm marking ${exitFormData.staffName} as ${exitFormData.exitType.toUpperCase()}? This will disable future booking shifts.`)) {
      return;
    }
    try {
      const res = await fetch("/api/staff/hr/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exitFormData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: data.message });
        setShowExitModal(false);
        fetchStaff();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to process staff exit." });
    }
  }

  // Save Schedule Working Hours
  async function handleSaveSchedule() {
    try {
      setSavingSchedule(true);
      const res = await fetch("/api/staff/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaffId,
          workingHours: currentWorkingHours,
          breaks: currentBreaks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Weekly shift hours and breaks saved." });
        fetchStaff();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to save schedule." });
      }
    } catch {
      setFeedback({ type: "error", message: "An error occurred while saving schedule." });
    } finally {
      setSavingSchedule(false);
    }
  }

  // Schedule Leave / Time-off
  async function handleAddLeave(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/staff/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: newLeaveData.staffId,
          startsAt: `${newLeaveData.startsAt}T00:00:00Z`,
          endsAt: `${newLeaveData.endsAt}T23:59:59Z`,
          reason: newLeaveData.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Absence scheduled successfully." });
        setShowLeaveModal(false);
        setNewLeaveData({ staffId: "", startsAt: "", endsAt: "", reason: "" });
        fetchStaff();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to schedule absence." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to schedule absence." });
    }
  }

  // Delete Leave
  async function handleDeleteLeave(leaveId) {
    if (!window.confirm("Remove this scheduled absence?")) return;
    try {
      const res = await fetch(`/api/staff/time-off?id=${leaveId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Absence removed." });
        fetchStaff();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to remove absence." });
    }
  }

  // Metrics Calculations
  const activeStaffCount = staffList.filter((s) => s.is_active && s.employment_status !== "resigned" && s.employment_status !== "terminated").length;
  const presentCount = attendanceRecords.filter((a) => a.status === "present" || a.status === "late").length;
  const attendanceRate = staffList.length > 0 ? Math.round((presentCount / staffList.length) * 100) : 100;
  const totalMonthlyPayroll = payrollRecords.reduce((acc, p) => acc + (p.net_payout_paise || 0), 0) / 100;
  const activeHiringCount = candidates.filter((c) => c.status !== "hired" && c.status !== "rejected").length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>Staff & Salon HR Suite</h1>
          <p>Complete workforce management: Recruitment, shifts, daily attendance, payroll & salon commissions</p>
        </div>
        <button
          className={styles.btnAddStaff}
          onClick={() => handleOpenStaffModal()}
          aria-label="Onboard New Staff Specialist"
        >
          <HiOutlineUserAdd size={18} />
          <span>Onboard Specialist</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {feedback.message && (
        <div className={feedback.type === "success" ? styles.alertSuccess : styles.alertError}>
          {feedback.message}
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 HR Overview & Insights
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "directory" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("directory")}
        >
          👥 Staff Directory & 360° Profiles ({staffList.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "attendance" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          🕒 Daily Attendance & Roster
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "payroll" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("payroll")}
        >
          💰 Salary & Commissions
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "recruitment" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("recruitment")}
        >
          🎯 Recruitment Pipeline ({activeHiringCount})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "shifts" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("shifts")}
        >
          📅 Weekly Shifts & Breaks
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "leaves" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          🏖️ Leaves & Absences
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HR OVERVIEW & ANALYTICS                                 */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Active Specialists</div>
              <div className={styles.metricValue}>{activeStaffCount}</div>
              <div className={styles.metricSub}>Ready for appointments</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Today&apos;s Attendance</div>
              <div className={styles.metricValue}>{attendanceRate}%</div>
              <div className={styles.metricSub}>{presentCount} of {staffList.length} staff checked in</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Est. Monthly Payroll</div>
              <div className={styles.metricValue}>₹{totalMonthlyPayroll.toLocaleString("en-IN")}</div>
              <div className={styles.metricSub}>Base pay + service commissions</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Active Vacancies</div>
              <div className={styles.metricValue}>{activeHiringCount}</div>
              <div className={styles.metricSub}>Candidates in screening/interview</div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <h3 style={{ margin: 0, color: "var(--color-text, #2C2419)", fontSize: "1.1rem" }}>
                Top Performing Stylists this Month
              </h3>
              <button
                className={styles.tabBtn}
                style={{ padding: "6px 12px", border: "1px solid var(--color-border, #E8E0D4)", borderRadius: "6px" }}
                onClick={() => setActiveTab("payroll")}
              >
                View Full Payroll & Commissions →
              </button>
            </div>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Specialist</th>
                  <th>Role</th>
                  <th>Services Done</th>
                  <th>Base Pay</th>
                  <th>Commission Earned</th>
                  <th>Net Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((p) => {
                  const staffObj = staffList.find((s) => s.id === p.staff_id);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{staffObj?.display_name || p.staff?.display_name || "Specialist"}</td>
                      <td style={{ color: "var(--color-primary, #8B6F4E)", textTransform: "capitalize", fontWeight: 600 }}>
                        {(staffObj?.role || "stylist").replace("_", " ")}
                      </td>
                      <td>{p.services_count || 0} clients</td>
                      <td>₹{(p.base_salary_paise / 100).toLocaleString("en-IN")}</td>
                      <td style={{ color: "#166534", fontWeight: 700 }}>
                        +₹{(p.commission_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--color-text, #2C2419)" }}>
                        ₹{(p.net_payout_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${p.payment_status === "paid" ? styles.badgePaid : styles.badgePending}`}>
                          {p.payment_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: STAFF DIRECTORY & 360° PROFILES                         */}
      {/* ============================================================== */}
      {activeTab === "directory" && (
        <div className={styles.staffGrid}>
          {staffList.map((specialist) => (
            <div key={specialist.id} className={styles.staffCard}>
              <div className={styles.staffCardHeader}>
                <div className={styles.avatarCircle}>
                  {specialist.display_name?.charAt(0) || "S"}
                </div>
                <div className={styles.staffHeaderInfo}>
                  <div className={styles.staffNameArea}>
                    <h3 className={styles.staffDisplayName}>{specialist.display_name}</h3>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span className={`${styles.roleBadge} ${specialist.role === "senior_stylist" ? styles.roleSenior : styles.roleStylist}`}>
                        {specialist.role?.replace("_", " ")}
                      </span>
                      <span
                        className={`${styles.badge} ${
                          specialist.employment_status === "active"
                            ? styles.badgeActive
                            : specialist.employment_status === "probation"
                            ? styles.badgeProbation
                            : specialist.employment_status === "resigned"
                            ? styles.badgeResigned
                            : specialist.employment_status === "terminated"
                            ? styles.badgeTerminated
                            : styles.badgeOnLeave
                        }`}
                      >
                        {specialist.employment_status || "Active"}
                      </span>
                    </div>
                  </div>
                  <p className={styles.staffFullName}>{specialist.full_name}</p>
                </div>
              </div>

              {/* Specialization Tags */}
              {specialist.specializations && specialist.specializations.length > 0 && (
                <div className={styles.tagList}>
                  {specialist.specializations.map((spec, idx) => (
                    <span key={idx} className={styles.tagChip}>
                      ✦ {spec}
                    </span>
                  ))}
                </div>
              )}

              {specialist.bio && <p className={styles.staffBio}>{specialist.bio}</p>}

              {/* Compensation & HR Details */}
              <div style={{ background: "var(--color-bg-alt, #F5F0E8)", border: "1px solid var(--color-border-light, #F0EBE3)", borderRadius: "8px", padding: "10px", margin: "12px 0", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "var(--color-text-secondary, #6B5D4F)" }}>Base Salary:</span>
                  <span style={{ color: "var(--color-text, #2C2419)", fontWeight: 700 }}>
                    ₹{((specialist.base_salary_paise || 0) / 100).toLocaleString("en-IN")}/mo
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "var(--color-text-secondary, #6B5D4F)" }}>Service Commission:</span>
                  <span style={{ color: "var(--color-primary, #8B6F4E)", fontWeight: 700 }}>
                    {specialist.commission_percentage || 0}% per booking
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-secondary, #6B5D4F)" }}>Joined Date:</span>
                  <span style={{ color: "var(--color-text, #2C2419)", fontWeight: 500 }}>{specialist.joining_date || "—"}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className={styles.contactGroup}>
                {specialist.phone && (
                  <div className={styles.contactItem}>
                    <HiOutlinePhone size={14} />
                    <span>{specialist.phone}</span>
                  </div>
                )}
                {specialist.email && (
                  <div className={styles.contactItem}>
                    <HiOutlineMail size={14} />
                    <span>{specialist.email}</span>
                  </div>
                )}
                {specialist.emergency_contact_phone && (
                  <div className={styles.contactItem} style={{ color: "#f59e0b" }}>
                    <span>🚨 Contact: {specialist.emergency_contact_name} ({specialist.emergency_contact_phone})</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.staffActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => handleOpenStaffModal(specialist)}
                  aria-label="Edit Profile"
                >
                  <HiOutlinePencilAlt size={15} />
                  <span>Edit Profile</span>
                </button>

                <button
                  className={specialist.is_active ? styles.btnDeactivate : styles.btnActivate}
                  onClick={() => handleToggleActive(specialist)}
                >
                  {specialist.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  className={styles.btnExitStaff}
                  onClick={() => handleOpenExitModal(specialist)}
                  title="Record Resignation or Termination"
                >
                  Exit / Attrition
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DAILY ATTENDANCE & ROSTER                               */}
      {/* ============================================================== */}
      {activeTab === "attendance" && (
        <div className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div className={styles.toolbarControls}>
              <label style={{ fontSize: "0.88rem", color: "#a8a29e" }}>Select Working Date:</label>
              <input
                type="date"
                className={styles.datePickerInput}
                value={selectedAttendanceDate}
                onChange={(e) => {
                  setSelectedAttendanceDate(e.target.value);
                  fetchAttendance(e.target.value);
                }}
              />
            </div>
            <div style={{ color: "#a8a29e", fontSize: "0.85rem" }}>
              Quick action: Tap P (Present), L (Late), or A (Absent) to record instant attendance.
            </div>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Specialist</th>
                <th>Role</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Quick Actions</th>
                <th>Notes</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => {
                const record = attendanceRecords.find((a) => a.staff_id === staff.id);
                const currentStatus = record?.status || "present";
                return (
                  <tr key={staff.id}>
                    <td style={{ fontWeight: 600 }}>{staff.display_name}</td>
                    <td style={{ color: "var(--color-primary, #8B6F4E)", textTransform: "capitalize", fontWeight: 600 }}>
                      {staff.role?.replace("_", " ")}
                    </td>
                    <td>{record?.check_in_time || "—"}</td>
                    <td>{record?.check_out_time || "—"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          currentStatus === "present"
                            ? styles.badgePresent
                            : currentStatus === "late"
                            ? styles.badgeLate
                            : currentStatus === "half_day"
                            ? styles.badgeHalfDay
                            : currentStatus === "on_leave"
                            ? styles.badgeOnLeave
                            : styles.badgeAbsent
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.quickStatusGroup}>
                        <button
                          className={`${styles.btnStatusAction} ${styles.btnMarkPresent}`}
                          onClick={() => handleQuickMarkAttendance(staff.id, "present")}
                          title="Mark Present"
                        >
                          P
                        </button>
                        <button
                          className={`${styles.btnStatusAction} ${styles.btnMarkLate}`}
                          onClick={() => handleQuickMarkAttendance(staff.id, "late")}
                          title="Mark Late"
                        >
                          L
                        </button>
                        <button
                          className={`${styles.btnStatusAction} ${styles.btnMarkAbsent}`}
                          onClick={() => handleQuickMarkAttendance(staff.id, "absent")}
                          title="Mark Absent"
                        >
                          A
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "#a8a29e", fontSize: "0.82rem" }}>
                      {record?.notes || "—"}
                    </td>
                    <td>
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                        onClick={() => {
                          setAttendanceFormData({
                            staffId: staff.id,
                            workDate: selectedAttendanceDate,
                            status: record?.status || "present",
                            checkInTime: record?.check_in_time || "10:00",
                            checkOutTime: record?.check_out_time || "20:00",
                            notes: record?.notes || "",
                          });
                          setShowAttendanceModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SALARY & COMMISSION (PAYROLL)                           */}
      {/* ============================================================== */}
      {activeTab === "payroll" && (
        <div className={styles.tableCard}>
          <div className={styles.tableToolbar}>
            <div className={styles.toolbarControls}>
              <label style={{ fontSize: "0.88rem", color: "#a8a29e" }}>Pay Period Month:</label>
              <input
                type="month"
                className={styles.datePickerInput}
                value={selectedPayrollMonth}
                onChange={(e) => {
                  setSelectedPayrollMonth(e.target.value);
                  fetchPayroll(e.target.value);
                }}
              />
            </div>
            <div style={{ color: "var(--color-primary, #8B6F4E)", fontWeight: 700, fontSize: "1.05rem" }}>
              Total Month Outflow: ₹{totalMonthlyPayroll.toLocaleString("en-IN")}
            </div>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Specialist</th>
                <th>Base Pay</th>
                <th>Services & Commission</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Payment Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((p) => {
                const staffObj = staffList.find((s) => s.id === p.staff_id);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{staffObj?.display_name || p.staff?.display_name || "Specialist"}</td>
                    <td>₹{(p.base_salary_paise / 100).toLocaleString("en-IN")}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#166534" }}>
                        +₹{(p.commission_paise / 100).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #6B5D4F)" }}>
                        {p.services_count || 0} services @ {staffObj?.commission_percentage || 15}%
                      </div>
                    </td>
                    <td style={{ color: "#166534", fontWeight: 600 }}>+₹{(p.bonus_paise / 100).toLocaleString("en-IN")}</td>
                    <td style={{ color: "#991B1B", fontWeight: 600 }}>-₹{(p.deductions_paise / 100).toLocaleString("en-IN")}</td>
                    <td style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text, #2C2419)" }}>
                      ₹{(p.net_payout_paise / 100).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${p.payment_status === "paid" ? styles.badgePaid : styles.badgePending}`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td style={{ textTransform: "capitalize", fontSize: "0.82rem" }}>
                      {p.payment_method?.replace("_", " ") || "Bank Transfer"}
                    </td>
                    <td>
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: "5px 12px", fontSize: "0.8rem" }}
                        onClick={() => {
                          setPayrollFormData({
                            staffId: p.staff_id,
                            staffName: staffObj?.display_name || "Specialist",
                            payPeriod: p.pay_period,
                            baseSalaryPaise: p.base_salary_paise,
                            commissionPaise: p.commission_paise,
                            bonusPaise: p.bonus_paise,
                            deductionsPaise: p.deductions_paise,
                            paymentStatus: p.payment_status,
                            paymentMethod: p.payment_method || "bank_transfer",
                            notes: p.notes || "",
                          });
                          setShowPayrollModal(true);
                        }}
                      >
                        {p.payment_status === "paid" ? "View / Edit" : "Process Payout"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: RECRUITMENT & HIRING PIPELINE                           */}
      {/* ============================================================== */}
      {activeTab === "recruitment" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "var(--color-text, #2C2419)", fontSize: "1.1rem" }}>Hiring & Candidate Pipeline</h3>
            <button
              className={styles.btnAddStaff}
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={() => {
                setCandidateFormData({
                  id: null,
                  fullName: "",
                  phone: "",
                  email: "",
                  roleApplied: "Senior Stylist",
                  experienceYears: 3.0,
                  expectedSalaryPaise: 2500000,
                  status: "applied",
                  interviewDate: "",
                  portfolioLink: "",
                  notes: "",
                });
                setShowCandidateModal(true);
              }}
            >
              + Add New Applicant
            </button>
          </div>

          <div className={styles.kanbanGrid}>
            {/* Column 1: Applied */}
            <div className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <h4 className={styles.columnTitle}>📥 Applied</h4>
                <span className={styles.candidateCount}>
                  {candidates.filter((c) => c.status === "applied").length}
                </span>
              </div>
              {candidates
                .filter((c) => c.status === "applied")
                .map((cand) => (
                  <div key={cand.id} className={styles.candidateCard}>
                    <h5 className={styles.candidateName}>{cand.full_name}</h5>
                    <div className={styles.candidateRole}>{cand.role_applied}</div>
                    <div className={styles.candidateDetail}>📞 {cand.phone}</div>
                    <div className={styles.candidateDetail}>⏳ Exp: {cand.experience_years} years</div>
                    <div className={styles.candidateDetail}>💰 Exp. Pay: ₹{(cand.expected_salary_paise / 100).toLocaleString("en-IN")}</div>
                    {cand.portfolio_link && (
                      <div className={styles.candidateDetail}>
                        🔗 <a href={cand.portfolio_link} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary, #8B6F4E)", fontWeight: 600 }}>Portfolio</a>
                      </div>
                    )}
                    <div className={styles.candidateActions}>
                      <button
                        className={styles.btnStageChange}
                        onClick={() => handleUpdateCandidateStage(cand, "interviewing")}
                      >
                        Schedule Interview →
                      </button>
                      <button
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                        onClick={() => handleDeleteCandidate(cand.id)}
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Column 2: Interviewing */}
            <div className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <h4 className={styles.columnTitle}>🗓️ Interviewing</h4>
                <span className={styles.candidateCount}>
                  {candidates.filter((c) => c.status === "interviewing").length}
                </span>
              </div>
              {candidates
                .filter((c) => c.status === "interviewing")
                .map((cand) => (
                  <div key={cand.id} className={styles.candidateCard}>
                    <h5 className={styles.candidateName}>{cand.full_name}</h5>
                    <div className={styles.candidateRole}>{cand.role_applied}</div>
                    <div className={styles.candidateDetail}>📞 {cand.phone}</div>
                    {cand.interview_date && (
                      <div className={styles.candidateDetail} style={{ color: "#facc15" }}>
                        🗓️ Interview: {new Date(cand.interview_date).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    )}
                    <p style={{ fontSize: "0.8rem", color: "#a8a29e", margin: "6px 0" }}>{cand.notes}</p>
                    <div className={styles.candidateActions}>
                      <button
                        className={styles.btnStageChange}
                        onClick={() => handleUpdateCandidateStage(cand, "offered")}
                      >
                        Make Offer →
                      </button>
                      <button
                        className={styles.btnStageChange}
                        style={{ color: "#f87171" }}
                        onClick={() => handleUpdateCandidateStage(cand, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Column 3: Offered */}
            <div className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <h4 className={styles.columnTitle}>🤝 Offered</h4>
                <span className={styles.candidateCount}>
                  {candidates.filter((c) => c.status === "offered").length}
                </span>
              </div>
              {candidates
                .filter((c) => c.status === "offered")
                .map((cand) => (
                  <div key={cand.id} className={styles.candidateCard}>
                    <h5 className={styles.candidateName}>{cand.full_name}</h5>
                    <div className={styles.candidateRole}>{cand.role_applied}</div>
                    <div className={styles.candidateDetail}>📞 {cand.phone}</div>
                    <p style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700, margin: "6px 0" }}>Offer Sent</p>
                    <div className={styles.candidateActions}>
                      <button
                        className={styles.btnSubmit}
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                        onClick={() => {
                          handleOpenStaffModal({
                            display_name: cand.full_name.split(" ")[0],
                            full_name: cand.full_name,
                            role: "stylist",
                            phone: cand.phone,
                            email: cand.email,
                            base_salary_paise: cand.expected_salary_paise,
                          });
                        }}
                      >
                        ✦ Onboard to Staff
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Column 4: Hired / Archived */}
            <div className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <h4 className={styles.columnTitle}>✅ Hired / Archived</h4>
                <span className={styles.candidateCount}>
                  {candidates.filter((c) => c.status === "hired" || c.status === "rejected").length}
                </span>
              </div>
              {candidates
                .filter((c) => c.status === "hired" || c.status === "rejected")
                .map((cand) => (
                  <div key={cand.id} className={styles.candidateCard} style={{ opacity: 0.75 }}>
                    <h5 className={styles.candidateName}>{cand.full_name}</h5>
                    <div className={styles.candidateRole}>{cand.role_applied}</div>
                    <span className={`${styles.badge} ${cand.status === "hired" ? styles.badgePaid : styles.badgeTerminated}`}>
                      {cand.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: WEEKLY SHIFTS & BREAKS                                  */}
      {/* ============================================================== */}
      {activeTab === "shifts" && (
        <div>
          {/* Specialist Selector */}
          <div className={styles.specialistSelector}>
            <label className={styles.selectorLabel}>Select Specialist to Configure Shifts:</label>
            <div className={styles.selectorPills}>
              {staffList.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.selectorPill} ${selectedStaffId === s.id ? styles.selectorPillActive : ""}`}
                  onClick={() => setSelectedStaffId(s.id)}
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Shift Grid */}
          <div className={styles.scheduleGrid}>
            {DAY_NAMES.map((d) => {
              const wh = currentWorkingHours.find((h) => h.day_of_week === d.dayNum) || {
                start_time: "10:00",
                end_time: "20:00",
                is_active: false,
              };
              const brk = currentBreaks.find((b) => b.day_of_week === d.dayNum) || {
                start_time: "13:00",
                end_time: "14:00",
                label: "Lunch Break",
              };

              return (
                <div key={d.dayNum} className={`${styles.dayCard} ${!wh.is_active ? styles.dayCardInactive : ""}`}>
                  <div className={styles.dayCardHeader}>
                    <span className={styles.dayName}>{d.name}</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={wh.is_active}
                        onChange={(e) => {
                          const updated = currentWorkingHours.map((h) =>
                            h.day_of_week === d.dayNum ? { ...h, is_active: e.target.checked } : h
                          );
                          setCurrentWorkingHours(updated);
                        }}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  {wh.is_active ? (
                    <div className={styles.shiftDetails}>
                      <div className={styles.timeRow}>
                        <HiOutlineClock size={16} />
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={wh.start_time?.substring(0, 5) || "10:00"}
                          onChange={(e) => {
                            const updated = currentWorkingHours.map((h) =>
                              h.day_of_week === d.dayNum ? { ...h, start_time: e.target.value } : h
                            );
                            setCurrentWorkingHours(updated);
                          }}
                        />
                        <span className={styles.toText}>to</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={wh.end_time?.substring(0, 5) || "20:00"}
                          onChange={(e) => {
                            const updated = currentWorkingHours.map((h) =>
                              h.day_of_week === d.dayNum ? { ...h, end_time: e.target.value } : h
                            );
                            setCurrentWorkingHours(updated);
                          }}
                        />
                      </div>

                      <div className={styles.breakSection}>
                        <span className={styles.breakLabel}>☕ {brk.label || "Break"}:</span>
                        <div className={styles.timeRow}>
                          <input
                            type="time"
                            className={styles.timeInputSmall}
                            value={brk.start_time?.substring(0, 5) || "13:00"}
                            onChange={(e) => {
                              const updated = currentBreaks.map((b) =>
                                b.day_of_week === d.dayNum ? { ...b, start_time: e.target.value } : b
                              );
                              setCurrentBreaks(updated);
                            }}
                          />
                          <span className={styles.toText}>-</span>
                          <input
                            type="time"
                            className={styles.timeInputSmall}
                            value={brk.end_time?.substring(0, 5) || "14:00"}
                            onChange={(e) => {
                              const updated = currentBreaks.map((b) =>
                                b.day_of_week === d.dayNum ? { ...b, end_time: e.target.value } : b
                              );
                              setCurrentBreaks(updated);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.dayOffBadge}>Day Off</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <button
              className={styles.btnSubmit}
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
            >
              {savingSchedule ? "Saving Shifts..." : "Save Working Hours & Shifts"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: LEAVES & TIME OFF                                       */}
      {/* ============================================================== */}
      {activeTab === "leaves" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", color: "var(--color-text, #2C2419)" }}>Scheduled Time Off & Absences</h3>
              <p style={{ margin: 0, color: "var(--color-text-secondary, #6B5D4F)", fontSize: "0.88rem" }}>
                Specialists will be automatically blocked from client booking on scheduled leave dates.
              </p>
            </div>
            <button
              className={styles.btnAddStaff}
              onClick={() => setShowLeaveModal(true)}
            >
              <HiOutlineCalendar size={18} />
              <span>Schedule Absence</span>
            </button>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Starts At</th>
                  <th>Ends At</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffList.flatMap((s) => (s.time_off || []).map((t) => ({ ...t, staffName: s.display_name }))).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#a8a29e" }}>
                      No scheduled leaves or planned absences currently active.
                    </td>
                  </tr>
                ) : (
                  staffList.flatMap((s) => (s.time_off || []).map((t) => ({ ...t, staffName: s.display_name }))).map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.staffName}</td>
                      <td>{new Date(l.starts_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td>{new Date(l.ends_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td>{l.reason || "Personal Leave"}</td>
                      <td>
                        <button
                          style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                          onClick={() => handleDeleteLeave(l.id)}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT STAFF SPECIALIST (WITH FULL HR PROFILE)   */}
      {/* ============================================================== */}
      {showStaffModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: "700px" }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingStaffId ? "Edit Staff Specialist & HR Profile" : "Onboard New Salon Specialist"}
              </h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowStaffModal(false)}
                aria-label="Close modal"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="displayName">
                    Display Name (Client Visible) *
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    className={styles.formInput}
                    required
                    value={staffFormData.displayName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, displayName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="fullName">
                    Full Legal Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className={styles.formInput}
                    required
                    value={staffFormData.fullName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="role">
                    Role Category
                  </label>
                  <select
                    id="role"
                    className={styles.formSelect}
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  >
                    <option value="senior_stylist">Senior Stylist / Master Specialist</option>
                    <option value="stylist">Stylist / Aesthetician</option>
                    <option value="assistant">Salon Assistant</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="employmentStatus">
                    Employment Status
                  </label>
                  <select
                    id="employmentStatus"
                    className={styles.formSelect}
                    value={staffFormData.employmentStatus}
                    onChange={(e) => setStaffFormData({ ...staffFormData, employmentStatus: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="probation">Probation (3 Months)</option>
                    <option value="on_leave">On Extended Leave</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="baseSalary">
                    Monthly Base Salary (₹)
                  </label>
                  <input
                    id="baseSalary"
                    type="number"
                    className={styles.formInput}
                    value={staffFormData.baseSalaryPaise / 100}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, baseSalaryPaise: (parseInt(e.target.value, 10) || 0) * 100 })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="commission">
                    Service Commission (%)
                  </label>
                  <input
                    id="commission"
                    type="number"
                    step="0.5"
                    className={styles.formInput}
                    value={staffFormData.commissionPercentage}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, commissionPercentage: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="specializations">
                  Specializations (Comma separated)
                </label>
                <input
                  id="specializations"
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Balayage, Hydra Facial, Keratin Treatment, Fades"
                  value={staffFormData.specializations}
                  onChange={(e) => setStaffFormData({ ...staffFormData, specializations: e.target.value })}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.formInput}
                    required
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={styles.formInput}
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="emergencyName">
                    Emergency Contact Name & Relation
                  </label>
                  <input
                    id="emergencyName"
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Ramesh Sharma (Spouse)"
                    value={staffFormData.emergencyContactName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, emergencyContactName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="emergencyPhone">
                    Emergency Phone
                  </label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    className={styles.formInput}
                    value={staffFormData.emergencyContactPhone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="bio">
                  Stylist Bio & Client Introduction
                </label>
                <textarea
                  id="bio"
                  rows={2}
                  className={styles.formTextarea}
                  value={staffFormData.bio}
                  onChange={(e) => setStaffFormData({ ...staffFormData, bio: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  {editingStaffId ? "Update Staff Profile" : "Complete Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT ATTENDANCE                                       */}
      {/* ============================================================== */}
      {showAttendanceModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Update Attendance Record</h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowAttendanceModal(false)}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAttendance}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Attendance Status</label>
                <select
                  className={styles.formSelect}
                  value={attendanceFormData.status}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, status: e.target.value })}
                >
                  <option value="present">Present (On Time)</option>
                  <option value="late">Late Arrival</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On Scheduled Leave</option>
                </select>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Check-In Time</label>
                  <input
                    type="time"
                    className={styles.formInput}
                    value={attendanceFormData.checkInTime || ""}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, checkInTime: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Check-Out Time</label>
                  <input
                    type="time"
                    className={styles.formInput}
                    value={attendanceFormData.checkOutTime || ""}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Daily Operational Notes</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Left early due to dental appointment"
                  value={attendanceFormData.notes}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, notes: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowAttendanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: PAYROLL & COMMISSION PAYOUT                           */}
      {/* ============================================================== */}
      {showPayrollModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Process Payout: {payrollFormData.staffName}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowPayrollModal(false)}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePayroll}>
              <div style={{ background: "rgba(212,175,55,0.08)", padding: "12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid rgba(212,175,55,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>Base Salary:</span>
                  <b>₹{(payrollFormData.baseSalaryPaise / 100).toLocaleString("en-IN")}</b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>Earned Commission:</span>
                  <b style={{ color: "#166534" }}>+₹{(payrollFormData.commissionPaise / 100).toLocaleString("en-IN")}</b>
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bonus / Tips (₹)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={payrollFormData.bonusPaise / 100}
                    onChange={(e) =>
                      setPayrollFormData({ ...payrollFormData, bonusPaise: (parseInt(e.target.value, 10) || 0) * 100 })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deductions (₹)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={payrollFormData.deductionsPaise / 100}
                    onChange={(e) =>
                      setPayrollFormData({ ...payrollFormData, deductionsPaise: (parseInt(e.target.value, 10) || 0) * 100 })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Payment Status</label>
                  <select
                    className={styles.formSelect}
                    value={payrollFormData.paymentStatus}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, paymentStatus: e.target.value })}
                  >
                    <option value="paid">Paid (Mark Disbursed)</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Payment Method</label>
                  <select
                    className={styles.formSelect}
                    value={payrollFormData.paymentMethod}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, paymentMethod: e.target.value })}
                  >
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="upi">UPI / Instant Pay</option>
                    <option value="cash">Cash Voucher</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Remarks / Pay Slip Note</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. October 2026 Salary + Diwali Festival Bonus"
                  value={payrollFormData.notes}
                  onChange={(e) => setPayrollFormData({ ...payrollFormData, notes: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowPayrollModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Confirm & Save Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD CANDIDATE (RECRUITMENT)                          */}
      {/* ============================================================== */}
      {showCandidateModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Job Applicant</h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowCandidateModal(false)}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCandidate}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Candidate Name *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  value={candidateFormData.fullName}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, fullName: e.target.value })}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role Applied For *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    placeholder="e.g. Senior Colorist, Aesthetician"
                    value={candidateFormData.roleApplied}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, roleApplied: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    className={styles.formInput}
                    value={candidateFormData.experienceYears}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, experienceYears: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number *</label>
                  <input
                    type="tel"
                    className={styles.formInput}
                    required
                    value={candidateFormData.phone}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected Salary (₹/month)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={candidateFormData.expectedSalaryPaise / 100}
                    onChange={(e) =>
                      setCandidateFormData({ ...candidateFormData, expectedSalaryPaise: (parseInt(e.target.value, 10) || 0) * 100 })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Portfolio / Instagram Link</label>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="https://instagram.com/work_samples"
                  value={candidateFormData.portfolioLink}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, portfolioLink: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Interview Notes & Assessment</label>
                <textarea
                  rows={2}
                  className={styles.formTextarea}
                  placeholder="Trade test observations, communication skill, haircut quality..."
                  value={candidateFormData.notes}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, notes: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowCandidateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ATTRITION & EXIT MANAGEMENT                           */}
      {/* ============================================================== */}
      {showExitModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: "#f87171" }}>
                Process Exit: {exitFormData.staffName}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowExitModal(false)}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleProcessExit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Exit Classification *</label>
                <select
                  className={styles.formSelect}
                  value={exitFormData.exitType}
                  onChange={(e) => setExitFormData({ ...exitFormData, exitType: e.target.value })}
                >
                  <option value="resigned">Voluntary Resignation (Notice Served)</option>
                  <option value="terminated">Involuntary Termination</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Working Date *</label>
                <input
                  type="date"
                  className={styles.formInput}
                  required
                  value={exitFormData.exitDate}
                  onChange={(e) => setExitFormData({ ...exitFormData, exitDate: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Primary Reason for Exit *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  placeholder="e.g. Relocating, Higher studies, Better offer, Performance"
                  value={exitFormData.exitReason}
                  onChange={(e) => setExitFormData({ ...exitFormData, exitReason: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Exit Interview & Handover Notes</label>
                <textarea
                  rows={3}
                  className={styles.formTextarea}
                  placeholder="Tool handover, client list transfer, feedback on salon operations..."
                  value={exitFormData.exitNotes}
                  onChange={(e) => setExitFormData({ ...exitFormData, exitNotes: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowExitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnExitStaff} style={{ padding: "9px 20px" }}>
                  Confirm Staff Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: SCHEDULE ABSENCE (LEAVES)                             */}
      {/* ============================================================== */}
      {showLeaveModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Schedule Specialist Absence</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowLeaveModal(false)}
                aria-label="Close modal"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLeave}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="leaveStaffId">
                  Team Member *
                </label>
                <select
                  id="leaveStaffId"
                  className={styles.formSelect}
                  required
                  value={newLeaveData.staffId}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, staffId: e.target.value })}
                >
                  <option value="">Select a team member</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="startsAt">
                  Start Date *
                </label>
                <input
                  id="startsAt"
                  type="date"
                  className={styles.formInput}
                  required
                  value={newLeaveData.startsAt}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, startsAt: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="endsAt">
                  End Date *
                </label>
                <input
                  id="endsAt"
                  type="date"
                  className={styles.formInput}
                  required
                  value={newLeaveData.endsAt}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, endsAt: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="reason">
                  Reason for Absence
                </label>
                <input
                  id="reason"
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Annual Vacation, Medical, Personal"
                  value={newLeaveData.reason}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, reason: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Schedule Absence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
