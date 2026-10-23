"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HiOutlineChartBar,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineInbox,
  HiOutlineGlobeAlt,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import styles from "./analytics.module.css";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalViews: 0,
    ctaClicks: 0,
    enquirySubmissions: 0,
    topPages: [],
    dailyViews: [],
    referrers: [],
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - range);
      const sinceISO = since.toISOString();

      // Fetch all events in the range
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("event_type, page_path, referrer, created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allEvents = events || [];

      // Total page views
      const pageViews = allEvents.filter((e) => e.event_type === "page_view");
      const totalViews = pageViews.length;

      // CTA clicks
      const ctaClicks = allEvents.filter(
        (e) => e.event_type === "cta_click"
      ).length;

      // Enquiry submissions
      const enquirySubmissions = allEvents.filter(
        (e) => e.event_type === "enquiry_submit"
      ).length;

      // Top pages — count views per page_path
      const pageCounts = {};
      pageViews.forEach((e) => {
        const path = e.page_path || "(unknown)";
        pageCounts[path] = (pageCounts[path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Daily page views — group by date
      const dailyCounts = {};
      pageViews.forEach((e) => {
        const day = e.created_at.substring(0, 10); // "YYYY-MM-DD"
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      // Fill all days in the range (even 0-view days)
      const dailyViews = [];
      const cursor = new Date(since);
      const today = new Date();
      while (cursor <= today) {
        const key = cursor.toISOString().substring(0, 10);
        dailyViews.push({ date: key, count: dailyCounts[key] || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      // Referrers — group by source
      const refCounts = {};
      pageViews.forEach((e) => {
        let source = "Direct / Unknown";
        if (e.referrer) {
          try {
            source = new URL(e.referrer).hostname;
          } catch {
            source = e.referrer.substring(0, 50);
          }
        }
        refCounts[source] = (refCounts[source] || 0) + 1;
      });
      const referrers = Object.entries(refCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setData({
        totalViews,
        ctaClicks,
        enquirySubmissions,
        topPages,
        dailyViews,
        referrers,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Find the max value in dailyViews for scaling bars
  const maxDaily = Math.max(...data.dailyViews.map((d) => d.count), 1);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>
            Website traffic, visitor insights, and engagement metrics.
          </p>
        </div>
        <div className={styles.rangeSelector}>
          <HiOutlineCalendar size={16} />
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.rangeBtn} ${
                range === opt.value ? styles.rangeBtnActive : ""
              }`}
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <HiOutlineEye size={22} />
              </div>
              <div>
                <span className={styles.statValue}>{data.totalViews}</span>
                <span className={styles.statLabel}>Page Views</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                <HiOutlineCursorClick size={22} />
              </div>
              <div>
                <span className={styles.statValue}>{data.ctaClicks}</span>
                <span className={styles.statLabel}>CTA Clicks</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <HiOutlineInbox size={22} />
              </div>
              <div>
                <span className={styles.statValue}>
                  {data.enquirySubmissions}
                </span>
                <span className={styles.statLabel}>Enquiry Submissions</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                <HiOutlineGlobeAlt size={22} />
              </div>
              <div>
                <span className={styles.statValue}>
                  {data.referrers.length}
                </span>
                <span className={styles.statLabel}>Traffic Sources</span>
              </div>
            </div>
          </div>

          {/* Page Views Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>
                <HiOutlineChartBar size={18} /> Page Views Over Time
              </h2>
            </div>

            {data.dailyViews.length === 0 ? (
              <div className={styles.emptyChart}>
                <p>No page view data in this period.</p>
              </div>
            ) : (
              <div className={styles.chartContainer}>
                <div className={styles.barChart}>
                  {data.dailyViews.map((day, i) => (
                    <div key={day.date} className={styles.barGroup}>
                      <div className={styles.barTooltip}>
                        {day.count} view{day.count !== 1 ? "s" : ""}
                      </div>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${Math.max(
                            (day.count / maxDaily) * 100,
                            2
                          )}%`,
                        }}
                      />
                      {/* Show label every few bars depending on range */}
                      {(range <= 7 ||
                        (range <= 30 && i % 3 === 0) ||
                        (range > 30 && i % 7 === 0)) && (
                        <span className={styles.barLabel}>
                          {formatDate(day.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Two column: Top Pages + Traffic Sources */}
          <div className={styles.twoCol}>
            {/* Top Pages */}
            <div className={styles.listCard}>
              <h2 className={styles.listTitle}>Most Viewed Pages</h2>
              {data.topPages.length === 0 ? (
                <p className={styles.emptyText}>No page data yet.</p>
              ) : (
                <div className={styles.listItems}>
                  {data.topPages.map((p, i) => (
                    <div key={p.page} className={styles.listRow}>
                      <span className={styles.listRank}>{i + 1}</span>
                      <span className={styles.listPage}>{p.page}</span>
                      <div className={styles.listBarWrapper}>
                        <div
                          className={styles.listBar}
                          style={{
                            width: `${
                              (p.count /
                                (data.topPages[0]?.count || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className={styles.listCount}>{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic Sources */}
            <div className={styles.listCard}>
              <h2 className={styles.listTitle}>Traffic Sources</h2>
              {data.referrers.length === 0 ? (
                <p className={styles.emptyText}>No referrer data yet.</p>
              ) : (
                <div className={styles.listItems}>
                  {data.referrers.map((r, i) => (
                    <div key={r.source} className={styles.listRow}>
                      <span className={styles.listRank}>{i + 1}</span>
                      <span className={styles.listPage}>{r.source}</span>
                      <div className={styles.listBarWrapper}>
                        <div
                          className={styles.listBar}
                          style={{
                            width: `${
                              (r.count /
                                (data.referrers[0]?.count || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className={styles.listCount}>{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Limitations Notice */}
          <div className={styles.notice}>
            <HiOutlineInformationCircle size={18} />
            <div>
              <strong>Analytics Limitations</strong>
              <p>
                These counts are first-party, privacy-friendly metrics with no
                cookies. They may undercount due to ad blockers, multiple tabs,
                or bot traffic. &ldquo;Page Views&rdquo; counts every page load
                (including repeat visits by the same visitor). CTA clicks are
                only tracked when the tracking code fires successfully.
                Referrer data may be empty if the browser strips it. Dashboard
                and login pages are excluded from tracking.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
