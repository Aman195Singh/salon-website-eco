"use client";

import { useEffect, useState } from "react";
import { HiOutlineInbox, HiOutlineSearch } from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import styles from "./enquiries.module.css";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEnquiries(data || []);
    } catch (err) {
      console.error("Error fetching enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setEnquiries((prev) =>
        prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filtered = enquiries.filter((eq) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      eq.name?.toLowerCase().includes(q) ||
      eq.email?.toLowerCase().includes(q) ||
      eq.phone?.includes(q) ||
      eq.message?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Enquiries</h1>
      <p className={styles.pageDesc}>
        Manage contact form submissions from visitors.
      </p>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <HiOutlineSearch size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {["all", "New", "In Progress", "Resolved"].map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className={styles.loadingText}>Loading enquiries...</p>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <HiOutlineInbox size={40} />
          <p>No enquiries found.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((eq) => (
            <div key={eq.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardName}>{eq.name}</h3>
                  <span className={styles.cardDate}>{formatDate(eq.created_at)}</span>
                </div>
                <select
                  className={styles.statusSelect}
                  value={eq.status}
                  onChange={(e) => updateStatus(eq.id, e.target.value)}
                  aria-label={`Change status for ${eq.name}`}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className={styles.cardContact}>
                {eq.phone && <span>📞 {eq.phone}</span>}
                {eq.email && <span>✉️ {eq.email}</span>}
              </div>
              <p className={styles.cardMessage}>{eq.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
