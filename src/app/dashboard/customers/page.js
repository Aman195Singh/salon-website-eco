"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineX,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import styles from "./customers.module.css";

const INITIAL_DEMO_CUSTOMERS = [
  {
    id: "cust-1",
    full_name: "Aman Singh",
    phone: "9876543210",
    email: "aman@example.com",
    notes: "First time haircut appointment. Prefers high fade haircut.",
    total_appointments: 3,
    last_visit: "2026-10-25",
    is_vip: true,
  },
  {
    id: "cust-2",
    full_name: "Kavita Rao",
    phone: "9812345678",
    email: "kavita.rao@example.com",
    notes: "Prefers organic skin products. Regular bridal customer.",
    total_appointments: 5,
    last_visit: "2026-10-25",
    is_vip: true,
  },
  {
    id: "cust-3",
    full_name: "Vikram Malhotra",
    phone: "9988776655",
    email: "vikram.m@example.com",
    notes: "Beard styling & royal hot towel shave.",
    total_appointments: 1,
    last_visit: "2026-10-24",
    is_vip: false,
  },
  {
    id: "cust-4",
    full_name: "Pooja Sharma",
    phone: "9844332211",
    email: "pooja.s@example.com",
    notes: "Hair spa and keratin treatment enquiry.",
    total_appointments: 2,
    last_visit: "2026-10-22",
    is_vip: false,
  },
];

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState(INITIAL_DEMO_CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'vip' | 'new'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Fetch actual customers from database if available
  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Merge with appointment count if available
          const formatted = data.map((c) => ({
            id: c.id,
            full_name: c.full_name,
            phone: c.phone,
            email: c.email || "",
            notes: c.notes || "",
            total_appointments: 1,
            last_visit: c.updated_at ? c.updated_at.split("T")[0] : "Recent",
            is_vip: false,
          }));
          setCustomers(formatted);
        }
      } catch {
        // Fallback demo data
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (filterType === "vip") return c.total_appointments >= 3 || c.is_vip;
      if (filterType === "new") return c.total_appointments === 1;
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Metrics
  const totalCount = customers.length;
  const vipCount = customers.filter((c) => c.total_appointments >= 3 || c.is_vip).length;
  const newThisMonth = customers.filter((c) => c.total_appointments === 1).length;

  const handleOpenModal = (cust = null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setFormData({
        fullName: cust.full_name,
        phone: cust.phone,
        email: cust.email || "",
        notes: cust.notes || "",
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                notes: formData.notes,
              }
            : c
        )
      );
    } else {
      const newCust = {
        id: `cust-${Date.now()}`,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        total_appointments: 1,
        last_visit: new Date().toISOString().split("T")[0],
        is_vip: false,
      };
      setCustomers((prev) => [newCust, ...prev]);
    }
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>Customer Management</h1>
          <p>Manage client profiles, booking frequency, personal preferences, and contact history.</p>
        </div>
        <button className={styles.btnAddClient} onClick={() => handleOpenModal()}>
          <HiOutlineUserAdd size={18} />
          <span>+ Add Client Record</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Registered Clients</div>
          <div className={styles.metricValue}>{totalCount}</div>
          <div className={styles.metricSub}>Recorded in salon directory</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>VIP & Repeat Clients</div>
          <div className={styles.metricValue}>{vipCount}</div>
          <div className={styles.metricSub}>2+ completed appointments</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>New Clients This Month</div>
          <div className={styles.metricValue}>{newThisMonth}</div>
          <div className={styles.metricSub}>First visit recorded in October</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by client name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterPill} ${filterType === "all" ? styles.filterPillActive : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Clients ({customers.length})
          </button>
          <button
            className={`${styles.filterPill} ${filterType === "vip" ? styles.filterPillActive : ""}`}
            onClick={() => setFilterType("vip")}
          >
            VIP & Repeat ({vipCount})
          </button>
          <button
            className={`${styles.filterPill} ${filterType === "new" ? styles.filterPillActive : ""}`}
            onClick={() => setFilterType("new")}
          >
            New Clients ({newThisMonth})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className={styles.tableCard}>
        {filteredCustomers.length === 0 ? (
          <div className={styles.emptyState}>No customers found matching your search.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Details</th>
                <th>Visits</th>
                <th>Last Visit</th>
                <th>Styling Notes & Preferences</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => {
                const initial = cust.full_name?.charAt(0).toUpperCase() || "C";
                const isVip = cust.total_appointments >= 3 || cust.is_vip;
                return (
                  <tr key={cust.id}>
                    <td>
                      <div className={styles.clientInfo}>
                        <div className={styles.avatar}>{initial}</div>
                        <div>
                          <div className={styles.clientName}>
                            {cust.full_name}
                            {isVip && <span className={styles.badgeVip}>VIP</span>}
                            {cust.total_appointments === 1 && <span className={styles.badgeNew}>NEW</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>📞 {cust.phone}</div>
                      {cust.email && <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>✉️ {cust.email}</div>}
                      <div className={styles.contactLinks}>
                        <a
                          href={`https://wa.me/91${cust.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.linkAction}
                        >
                          WhatsApp
                        </a>
                        <span>•</span>
                        <a href={`tel:${cust.phone}`} className={styles.linkAction}>
                          Call
                        </a>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{cust.total_appointments} visits</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{cust.last_visit}</td>
                    <td>
                      <div className={styles.notesCell}>
                        {cust.notes ? cust.notes : "No custom notes recorded."}
                      </div>
                    </td>
                    <td>
                      <button className={styles.btnAction} onClick={() => handleOpenModal(cust)}>
                        Edit Notes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedCustomer ? "Edit Client Notes" : "Add New Client"}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  required
                  className={styles.formInput}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address (Optional)</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Preferences, Allergies & Notes</label>
                <textarea
                  rows={3}
                  className={styles.formTextarea}
                  placeholder="e.g. Sensitive scalp, prefers herbal oils, tea with milk"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
