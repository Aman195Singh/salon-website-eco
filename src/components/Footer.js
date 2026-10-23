"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineClock,
} from "react-icons/hi";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

import { useState, useEffect } from "react";
import { getPublishedContent, DEFAULT_CONTENT } from "@/lib/content";

export default function Footer() {
  const pathname = usePathname();
  const [year, setYear] = useState("2026");
  const [salonInfo, setSalonInfo] = useState({
    name: DEFAULT_CONTENT.general.salonName,
    tagline: DEFAULT_CONTENT.general.tagline,
    phone: DEFAULT_CONTENT.general.phone,
    email: DEFAULT_CONTENT.general.email,
    address: DEFAULT_CONTENT.general.address,
    hours: "Mon – Sat: 10:00 AM – 8:00 PM",
    instagram: DEFAULT_CONTENT.general.instagram,
    facebook: DEFAULT_CONTENT.general.facebook,
    youtube: DEFAULT_CONTENT.general.youtube,
  });

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
    async function loadData() {
      const data = await getPublishedContent();
      if (data?.general) {
        const g = data.general;
        const hoursStr = g.hours
          ? g.hours.map((h) => `${h.day}: ${h.time}`).join(" | ")
          : "Mon – Sat: 10:00 AM – 8:00 PM";
        setSalonInfo({
          name: g.salonName || "Aura Luxe",
          tagline: g.tagline || "Premium Unisex Salon",
          phone: g.phone || "+91 98765 43210",
          email: g.email || "hello@salon.com",
          address: g.address || "123 Main Street",
          hours: hoursStr,
          instagram: g.instagram || "#",
          facebook: g.facebook || "#",
          youtube: g.youtube || "#",
        });
      }
    }
    loadData();
  }, []);

  /* Hide footer on dashboard pages */
  if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        {/* Col 1: Brand */}
        <div className={styles.col}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>✦</span>
            <span className={styles.brandName}>{salonInfo.name}</span>
          </div>
          <p className={styles.tagline}>{salonInfo.tagline}</p>
          <div className={styles.social}>
            <a href={salonInfo.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaInstagram size={18} />
            </a>
            <a href={salonInfo.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaFacebookF size={16} />
            </a>
            <a href={salonInfo.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <nav aria-label="Footer navigation">
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Col 3: Contact Info */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contact Us</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <HiOutlinePhone size={16} className={styles.contactIcon} />
              <a href={`tel:${salonInfo.phone.replace(/\s/g, "")}`}>{salonInfo.phone}</a>
            </li>
            <li className={styles.contactItem}>
              <HiOutlineMail size={16} className={styles.contactIcon} />
              <a href={`mailto:${salonInfo.email}`}>{salonInfo.email}</a>
            </li>
            <li className={styles.contactItem}>
              <HiOutlineLocationMarker size={16} className={styles.contactIcon} />
              <span>{salonInfo.address}</span>
            </li>
            <li className={styles.contactItem}>
              <HiOutlineClock size={16} className={styles.contactIcon} />
              <span>{salonInfo.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            © {year} {salonInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
