"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineViewGrid,
  HiOutlineAdjustments,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineCalendar,
  HiOutlineCube,
  HiOutlineX,
} from "react-icons/hi";
import styles from "./operations.module.css";

// Default Morning Opening Checklist Items
const DEFAULT_OPENING_CHECKLIST = [
  { id: "op-1", text: "Salon lighting, air conditioning, and ambient music initialized", done: true },
  { id: "op-2", text: "Stylist stations sanitized and tool sterilizer (UV box) verified", done: true },
  { id: "op-3", text: "Clean towels, fresh salon capes, and disposable neck strips restocked", done: true },
  { id: "op-4", text: "Reception booking terminal online & appointments calendar synchronized", done: true },
  { id: "op-5", text: "Cash drawer float verified and digital UPI payment QR codes displayed", done: false },
  { id: "op-6", text: "Client beverage station and refreshment stock checked", done: false },
];

// Default Evening Closing Checklist Items
const DEFAULT_CLOSING_CHECKLIST = [
  { id: "cl-1", text: "All cutting and styling tools cleaned, disinfected, and safely stored", done: false },
  { id: "cl-2", text: "Hair wash basins, traps, and shampoo backbar sanitized", done: false },
  { id: "cl-3", text: "Day's cash register tally and digital UPI settlement reconciled", done: false },
  { id: "cl-4", text: "Linen and soiled salon towels gathered in laundry hamper", done: false },
  { id: "cl-5", text: "Waste bins emptied and salon floor swept and mopped", done: false },
  { id: "cl-6", text: "All hair dryers, straighteners, and water heaters switched off", done: false },
  { id: "cl-7", text: "Main salon entrance locked and security alarm armed", done: false },
];

// Default Service Stations
const DEFAULT_STATIONS = [
  {
    id: "st-1",
    name: "Hair Styling Station A",
    type: "Styling & Cutting",
    specialist: "Priya Sharma",
    status: "ready",
    equipment: "Ceramic blow dryer, styling shears & sanitizing jar ready",
  },
  {
    id: "st-2",
    name: "Hair Styling Station B",
    type: "Styling & Color",
    specialist: "Rajesh Verma",
    status: "in_use",
    equipment: "Hot tools active, color mixing scale sanitized",
  },
  {
    id: "st-3",
    name: "Facial & Skin Suite",
    type: "Skincare & Spa",
    specialist: "Ananya Patel",
    status: "ready",
    equipment: "Facial steamer, warm towels, and organic skincare pack ready",
  },
  {
    id: "st-4",
    name: "Barber & Grooming Lounge",
    type: "Men's Grooming",
    specialist: "First Available Stylist",
    status: "ready",
    equipment: "Hot towel warmer online, blade sterilizer verified",
  },
];

// Default Operational Maintenance Tasks
const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Order L'Oreal Mythic Oil and Serie Expert Shampoo restock",
    category: "Supplies",
    priority: "high",
    dueDate: "2026-10-26",
    assignedTo: "Owner / Inventory Manager",
    completed: false,
  },
  {
    id: "task-2",
    title: "Service washing station #2 mixer tap water pressure",
    category: "Maintenance",
    priority: "medium",
    dueDate: "2026-10-27",
    assignedTo: "Plumbing Technician",
    completed: false,
  },
  {
    id: "task-3",
    title: "Quarterly inspection of UV tool sterilizers and autoclaves",
    category: "Hygiene",
    priority: "high",
    dueDate: "2026-10-28",
    assignedTo: "Priya Sharma",
    completed: true,
  },
  {
    id: "task-4",
    title: "Audit linen inventory and order 50 additional microfiber towels",
    category: "General",
    priority: "routine",
    dueDate: "2026-10-30",
    assignedTo: "Rajesh Verma",
    completed: false,
  },
];

export default function OperationManagementPage() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'checklists' | 'stations' | 'tasks' | 'settings' | 'inventory'
  const [emergencyPause, setEmergencyPause] = useState(false);

  // Checklists State
  const [openingChecklist, setOpeningChecklist] = useState(DEFAULT_OPENING_CHECKLIST);
  const [closingChecklist, setClosingChecklist] = useState(DEFAULT_CLOSING_CHECKLIST);

  // Operational Tasks State
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all' | 'pending' | 'completed'
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    category: "Maintenance",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    assignedTo: "Owner",
  });

  // Load saved checklist and tasks from localStorage
  useEffect(() => {
    try {
      const todayKey = new Date().toISOString().split("T")[0];
      const savedOpening = localStorage.getItem(`salon_op_opening_${todayKey}`);
      if (savedOpening) setOpeningChecklist(JSON.parse(savedOpening));

      const savedClosing = localStorage.getItem(`salon_op_closing_${todayKey}`);
      if (savedClosing) setClosingChecklist(JSON.parse(savedClosing));

      const savedTasks = localStorage.getItem("salon_op_tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedEmergency = localStorage.getItem("salon_emergency_pause");
      if (savedEmergency) setEmergencyPause(savedEmergency === "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save changes to localStorage
  const handleToggleOpening = (id) => {
    const todayKey = new Date().toISOString().split("T")[0];
    setOpeningChecklist((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
      try {
        localStorage.setItem(`salon_op_opening_${todayKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleClosing = (id) => {
    const todayKey = new Date().toISOString().split("T")[0];
    setClosingChecklist((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
      try {
        localStorage.setItem(`salon_op_closing_${todayKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleTask = (id) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      try {
        localStorage.setItem("salon_op_tasks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("salon_op_tasks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskFormData.title.trim(),
      category: taskFormData.category,
      priority: taskFormData.priority,
      dueDate: taskFormData.dueDate,
      assignedTo: taskFormData.assignedTo || "Owner",
      completed: false,
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      try {
        localStorage.setItem("salon_op_tasks", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setShowTaskModal(false);
    setTaskFormData({
      title: "",
      category: "Maintenance",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: "Owner",
    });
  };

  const handleToggleEmergencyPause = () => {
    const nextVal = !emergencyPause;
    setEmergencyPause(nextVal);
    try {
      localStorage.setItem("salon_emergency_pause", String(nextVal));
    } catch {}
  };

  // Metrics
  const openingDone = openingChecklist.filter((i) => i.done).length;
  const openingTotal = openingChecklist.length;
  const openingPct = Math.round((openingDone / openingTotal) * 100);

  const closingDone = closingChecklist.filter((i) => i.done).length;
  const closingTotal = closingChecklist.length;
  const closingPct = Math.round((closingDone / closingTotal) * 100);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskFilter === "pending") return !t.completed;
      if (taskFilter === "completed") return t.completed;
      return true;
    });
  }, [tasks, taskFilter]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>Salon Operation Management</h1>
          <p>Central operations hub: Daily opening/closing checklists, service station readiness, operational task backlog, and salon policies.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/staff/appointments" className={styles.btnSecondaryAction}>
            <HiOutlineCalendar size={18} />
            <span>Chair-Side Stylist View</span>
          </Link>
          <button className={styles.btnPrimaryAction} onClick={() => setShowTaskModal(true)}>
            <HiOutlinePlus size={18} />
            <span>+ Add Operational Task</span>
          </button>
        </div>
      </div>

      {/* Secondary Navigation Tabs Bar */}
      <nav className={styles.tabsBar} aria-label="Operations sub-navigation">
        <button
          className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <HiOutlineClipboardCheck size={18} />
          <span>Operations Overview</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "checklists" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("checklists")}
        >
          <HiOutlineCheckCircle size={18} />
          <span>Daily Checklists ({openingDone}/{openingTotal})</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "stations" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("stations")}
        >
          <HiOutlineViewGrid size={18} />
          <span>Service Stations (4)</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "tasks" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          <HiOutlineClock size={18} />
          <span>Operational Tasks ({pendingTasksCount})</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "settings" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <HiOutlineAdjustments size={18} />
          <span>Salon Policies & Rules</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "inventory" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          <HiOutlineCube size={18} />
          <span>Inventory & Supplies</span>
          <span className={styles.plannedBadge}>Roadmap</span>
        </button>
      </nav>

      {/* TAB 1: OPERATIONS OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Status Banner */}
          <div className={styles.statusBanner}>
            <div className={styles.statusIndicator}>
              <div
                className={styles.statusDot}
                style={{ background: emergencyPause ? "#DC2626" : "#16A34A" }}
              />
              <div>
                <div className={styles.statusTitle}>
                  {emergencyPause ? "⚠️ Salon Online Booking Paused (Emergency Freeze Active)" : "🟢 Salon Open & Operating Normally"}
                </div>
                <div className={styles.statusSubtitle}>
                  Business Hours: 10:00 AM – 8:00 PM IST • India Standard Time (`Asia/Kolkata`)
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleEmergencyPause}
              className={styles.btnSecondaryAction}
              style={{
                color: emergencyPause ? "#16A34A" : "#B91C1C",
                borderColor: emergencyPause ? "#16A34A" : "#FECACA",
                background: emergencyPause ? "#F0FDF4" : "#FEF2F2",
              }}
            >
              {emergencyPause ? "Resume Online Booking" : "Pause Booking (Maintenance / Emergency)"}
            </button>
          </div>

          {/* Operational Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Service Stations</div>
              <div className={styles.metricValue}>4 Active</div>
              <div className={styles.metricSub}>All styling chairs & spa suites online</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Opening Readiness</div>
              <div className={styles.metricValue}>{openingPct}%</div>
              <div className={styles.metricSub}>{openingDone} of {openingTotal} morning checks completed</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Maintenance Backlog</div>
              <div className={styles.metricValue}>{pendingTasksCount} Pending</div>
              <div className={styles.metricSub}>Equipment & hygiene action items</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Closing Readiness</div>
              <div className={styles.metricValue}>{closingPct}%</div>
              <div className={styles.metricSub}>{closingDone} of {closingTotal} end-of-day checks done</div>
            </div>
          </div>

          {/* Quick Checklists Preview */}
          <div className={styles.checklistGrid}>
            <div className={styles.checklistCard}>
              <div className={styles.checklistHeader}>
                <h3 className={styles.checklistTitle}>Morning Opening Protocol</h3>
                <span className={styles.checklistBadge}>{openingDone}/{openingTotal} Done</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: `${openingPct}%` }} />
              </div>
              <div className={styles.checkList}>
                {openingChecklist.slice(0, 4).map((item) => (
                  <label key={item.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={item.done}
                      onChange={() => handleToggleOpening(item.id)}
                    />
                    <span className={`${styles.itemLabel} ${item.done ? styles.itemLabelDone : ""}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: "16px", textAlign: "right" }}>
                <button
                  className={styles.btnSecondaryAction}
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                  onClick={() => setActiveTab("checklists")}
                >
                  View Full Checklist →
                </button>
              </div>
            </div>

            <div className={styles.checklistCard}>
              <div className={styles.checklistHeader}>
                <h3 className={styles.checklistTitle}>Physical Service Stations</h3>
                <span className={styles.checklistBadge}>4 Stations</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {DEFAULT_STATIONS.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "var(--color-bg-alt, #F5F0E8)",
                      borderRadius: "8px",
                      fontSize: "0.86rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--color-text, #2C2419)" }}>{st.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #6B5D4F)" }}>
                        Stylist: {st.specialist}
                      </div>
                    </div>
                    <span className={st.status === "ready" ? styles.badgeReady : styles.badgeInUse}>
                      {st.status === "ready" ? "READY" : "IN USE"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "16px", textAlign: "right" }}>
                <button
                  className={styles.btnSecondaryAction}
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                  onClick={() => setActiveTab("stations")}
                >
                  Manage All Stations →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY CHECKLISTS */}
      {activeTab === "checklists" && (
        <div>
          <div style={{ marginBottom: "16px", color: "var(--color-text-secondary, #6B5D4F)", fontSize: "0.92rem" }}>
            Checklists automatically track operational readiness for today. Changes are saved locally on this browser.
          </div>
          <div className={styles.checklistGrid}>
            {/* Opening Checklist */}
            <div className={styles.checklistCard}>
              <div className={styles.checklistHeader}>
                <div>
                  <h3 className={styles.checklistTitle}>☀️ Morning Opening Protocol</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    Target completion: 9:30 AM – 10:00 AM
                  </div>
                </div>
                <span className={styles.checklistBadge}>{openingDone}/{openingTotal} ({openingPct}%)</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: `${openingPct}%` }} />
              </div>
              <div className={styles.checkList}>
                {openingChecklist.map((item) => (
                  <label key={item.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={item.done}
                      onChange={() => handleToggleOpening(item.id)}
                    />
                    <span className={`${styles.itemLabel} ${item.done ? styles.itemLabelDone : ""}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Closing Checklist */}
            <div className={styles.checklistCard}>
              <div className={styles.checklistHeader}>
                <div>
                  <h3 className={styles.checklistTitle}>🌙 Evening Closing Protocol</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    Target completion: 8:00 PM – 8:30 PM
                  </div>
                </div>
                <span className={styles.checklistBadge}>{closingDone}/{closingTotal} ({closingPct}%)</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${closingPct}%`, background: "#4A6B8A" }}
                />
              </div>
              <div className={styles.checkList}>
                {closingChecklist.map((item) => (
                  <label key={item.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={item.done}
                      onChange={() => handleToggleClosing(item.id)}
                    />
                    <span className={`${styles.itemLabel} ${item.done ? styles.itemLabelDone : ""}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE STATIONS */}
      {activeTab === "stations" && (
        <div>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ margin: 0, color: "var(--color-text-secondary, #6B5D4F)", fontSize: "0.95rem" }}>
              Salon floor stations and equipment allocation. Stylists can manage check-ins directly via the Chair-Side portal.
            </p>
            <Link href="/staff/appointments" className={styles.btnSecondaryAction}>
              Open Stylist View (/staff/appointments) →
            </Link>
          </div>

          <div className={styles.stationGrid}>
            {DEFAULT_STATIONS.map((st) => (
              <div key={st.id} className={styles.stationCard}>
                <div className={styles.stationHeader}>
                  <div>
                    <div className={styles.stationName}>{st.name}</div>
                    <div className={styles.stationType}>{st.type}</div>
                  </div>
                  <span className={st.status === "ready" ? styles.badgeReady : styles.badgeInUse}>
                    {st.status === "ready" ? "READY" : "IN SERVICE"}
                  </span>
                </div>
                <div className={styles.stationDetails}>
                  <div><b>Assigned Stylist:</b> {st.specialist}</div>
                  <div style={{ marginTop: "6px" }}><b>Equipment:</b> {st.equipment}</div>
                </div>
                <div className={styles.stationFooter}>
                  <span>Sanitization: Verified</span>
                  <span style={{ color: "var(--color-primary, #8B6F4E)", fontWeight: 600 }}>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPERATIONAL TASK LIST */}
      {activeTab === "tasks" && (
        <div className={styles.taskContainer}>
          <div className={styles.taskToolbar}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className={`${styles.tabBtn} ${taskFilter === "all" ? styles.tabBtnActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.84rem" }}
                onClick={() => setTaskFilter("all")}
              >
                All Tasks ({tasks.length})
              </button>
              <button
                className={`${styles.tabBtn} ${taskFilter === "pending" ? styles.tabBtnActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.84rem" }}
                onClick={() => setTaskFilter("pending")}
              >
                Pending ({pendingTasksCount})
              </button>
              <button
                className={`${styles.tabBtn} ${taskFilter === "completed" ? styles.tabBtnActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.84rem" }}
                onClick={() => setTaskFilter("completed")}
              >
                Completed ({tasks.length - pendingTasksCount})
              </button>
            </div>
            <button className={styles.btnPrimaryAction} onClick={() => setShowTaskModal(true)}>
              <HiOutlinePlus size={16} /> Add Task
            </button>
          </div>

          <div className={styles.taskList}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)" }}>
                No operational tasks found in this view.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div key={t.id} className={styles.taskItem}>
                  <div className={styles.taskLeft}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={t.completed}
                      onChange={() => handleToggleTask(t.id)}
                    />
                    <div>
                      <div className={`${styles.taskTitle} ${t.completed ? styles.taskTitleDone : ""}`}>
                        {t.title}
                      </div>
                      <div className={styles.taskMeta}>
                        Due: {t.dueDate} • Assigned: {t.assignedTo} • Category: {t.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className={
                        t.priority === "high"
                          ? styles.priorityHigh
                          : t.priority === "medium"
                          ? styles.priorityMedium
                          : styles.priorityRoutine
                      }
                    >
                      {t.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      style={{ background: "none", border: "none", color: "#B44141", cursor: "pointer", padding: "4px" }}
                      title="Delete Task"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: OPERATIONAL SETTINGS & POLICIES */}
      {activeTab === "settings" && (
        <div className={styles.settingsGrid}>
          <div className={styles.settingsCard}>
            <div className={styles.settingsCardTitle}>
              <HiOutlineAdjustments size={20} color="var(--color-primary, #8B6F4E)" />
              <span>Booking & Policy Constraints</span>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Online Booking Notice Window</div>
                <div className={styles.settingSub}>Minimum advance cutoff before service starts</div>
              </div>
              <div className={styles.settingValue}>2 Hours</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Customer Self-Cancellation Cutoff</div>
                <div className={styles.settingSub}>Lockout threshold for self-service cancellation</div>
              </div>
              <div className={styles.settingValue}>4 Hours</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Maximum Advance Reservation</div>
                <div className={styles.settingSub}>Furthest future date clients can book online</div>
              </div>
              <div className={styles.settingValue}>30 Days</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Slot Calculation Granularity</div>
                <div className={styles.settingSub}>Step interval for generated booking time slots</div>
              </div>
              <div className={styles.settingValue}>15 Minutes</div>
            </div>
          </div>

          <div className={styles.settingsCard}>
            <div className={styles.settingsCardTitle}>
              <HiOutlineClock size={20} color="var(--color-primary, #8B6F4E)" />
              <span>Salon Operating Schedule</span>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Monday – Saturday</div>
                <div className={styles.settingSub}>Core operational salon business hours</div>
              </div>
              <div className={styles.settingValue}>10:00 AM – 8:00 PM</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Sunday</div>
                <div className={styles.settingSub}>Weekend salon operating hours</div>
              </div>
              <div className={styles.settingValue}>11:00 AM – 6:00 PM</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Operational Timezone</div>
                <div className={styles.settingSub}>Authoritative scheduling server timezone</div>
              </div>
              <div className={styles.settingValue}>Asia/Kolkata (IST)</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Buffer Between Appointments</div>
                <div className={styles.settingSub}>Station sanitization & prep buffer</div>
              </div>
              <div className={styles.settingValue}>10 Minutes</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INVENTORY & SUPPLIES (ROADMAP PREVIEW) */}
      {activeTab === "inventory" && (
        <div className={styles.roadmapCard}>
          <div className={styles.roadmapIcon}>📦</div>
          <h2 className={styles.roadmapTitle}>Inventory & Salon Supplies Management</h2>
          <span className={styles.plannedBadge} style={{ marginBottom: "16px", display: "inline-block" }}>
            Scheduled for V2 Phase 2 Roadmap
          </span>
          <p className={styles.roadmapDescription}>
            Per the approved release boundaries in <code>PRD-V2.md §1.3</code> and <code>VERSION_ROADMAP.md</code>, inventory control, backbar usage tracking, and automated vendor purchase orders are scheduled for Phase 2.
          </p>
          <div style={{ background: "var(--color-bg-alt, #F5F0E8)", borderRadius: "10px", padding: "20px", textAlign: "left" }}>
            <h4 style={{ margin: "0 0 10px", color: "var(--color-text, #2C2419)" }}>
              Planned Capabilities in Phase 2:
            </h4>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Module Focus</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Professional Backbar Products</td>
                  <td>Shampoos, conditioners, peroxide & hair color consumption logging per service</td>
                  <td><span className={styles.plannedBadge}>Phase 2</span></td>
                </tr>
                <tr>
                  <td>Retail Salon Inventory</td>
                  <td>Take-home serums, waxes, beard oils, and retail sale logging</td>
                  <td><span className={styles.plannedBadge}>Phase 2</span></td>
                </tr>
                <tr>
                  <td>Low-Stock Reorder Alerts</td>
                  <td>Automated notification when stock drops below safety threshold</td>
                  <td><span className={styles.plannedBadge}>Phase 2</span></td>
                </tr>
                <tr>
                  <td>Vendor & Supplier Directory</td>
                  <td>Wholesale supplier contacts and purchase order history</td>
                  <td><span className={styles.plannedBadge}>Phase 2</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add Operational Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Task Title / Action Item</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g. Sterilize hot towel machine, order L'Oreal developer"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select
                    className={styles.formSelect}
                    value={taskFormData.category}
                    onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value })}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Hygiene">Hygiene & Sanitization</option>
                    <option value="Supplies">Supplies & Stock</option>
                    <option value="General">General Operations</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Priority</label>
                  <select
                    className={styles.formSelect}
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Due Date</label>
                  <input
                    type="date"
                    required
                    className={styles.formInput}
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Assigned Specialist</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Priya Sharma or Owner"
                    value={taskFormData.assignedTo}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Create Operational Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
