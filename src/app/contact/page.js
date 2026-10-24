"use client";

import { useState } from "react";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import styles from "./contact.module.css";

import { useEffect } from "react";
import { getPublishedContent, DEFAULT_CONTENT } from "@/lib/content";
import { useAuth } from "@/context/AuthContext";
import { getPhoneLink, getWhatsAppLink, getMailtoLink, getMapLink } from "@/lib/contact";

export default function ContactPage() {
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTENT.general);
  const [contactPage, setContactPage] = useState(DEFAULT_CONTENT.contact);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      const data = await getPublishedContent();
      if (data?.general) setContactInfo(data.general);
      if (data?.contact) setContactPage(data.contact);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.phone.trim() && !form.email.trim()) errs.phone = "Please provide a phone number or email.";
    if (!form.message.trim()) errs.message = "Please write your message.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId: user?.id || null,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", phone: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="section-label">Contact</span>
          <h1 className={styles.heroTitle}>{contactPage.title || "Get in Touch"}</h1>
          <p className={styles.heroDesc}>
            {contactPage.description || "Have a question or want to book a visit? We'd love to hear from you."}
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {/* Left: Contact Info */}
            <div className={styles.info}>
              <h2 className={styles.infoTitle}>Reach Us</h2>

              <div className={styles.infoList}>
                {contactInfo.phone && (
                  getPhoneLink(contactInfo.phone) ? (
                    <a href={getPhoneLink(contactInfo.phone)} className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlinePhone size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Phone</span>
                        <span className={styles.infoValue}>{contactInfo.phone}</span>
                      </div>
                    </a>
                  ) : (
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlinePhone size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Phone</span>
                        <span className={styles.infoValue}>{contactInfo.phone}</span>
                      </div>
                    </div>
                  )
                )}

                {contactInfo.whatsapp && (
                  getWhatsAppLink(contactInfo.whatsapp) ? (
                    <a href={getWhatsAppLink(contactInfo.whatsapp)} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                      <div className={styles.infoIcon} style={{ background: "rgba(37, 211, 102, 0.1)", color: "#25D366" }}><FaWhatsapp size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>WhatsApp</span>
                        <span className={styles.infoValue}>{contactInfo.whatsapp}</span>
                      </div>
                    </a>
                  ) : (
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon} style={{ background: "rgba(37, 211, 102, 0.1)", color: "#25D366" }}><FaWhatsapp size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>WhatsApp</span>
                        <span className={styles.infoValue}>{contactInfo.whatsapp}</span>
                      </div>
                    </div>
                  )
                )}

                {contactInfo.email && (
                  getMailtoLink(contactInfo.email) ? (
                    <a href={getMailtoLink(contactInfo.email)} className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlineMail size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{contactInfo.email}</span>
                      </div>
                    </a>
                  ) : (
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlineMail size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{contactInfo.email}</span>
                      </div>
                    </div>
                  )
                )}

                {contactInfo.address && (
                  getMapLink(contactInfo.mapLink) ? (
                    <a href={getMapLink(contactInfo.mapLink)} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlineLocationMarker size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Address</span>
                        <span className={styles.infoValue}>{contactInfo.address}</span>
                      </div>
                    </a>
                  ) : (
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><HiOutlineLocationMarker size={20} /></div>
                      <div>
                        <span className={styles.infoLabel}>Address</span>
                        <span className={styles.infoValue}>{contactInfo.address}</span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Opening Hours */}
              {contactInfo.hours && contactInfo.hours.length > 0 && (
                <div className={styles.hoursCard}>
                  <div className={styles.hoursHeader}>
                    <HiOutlineClock size={18} />
                    <h3 className={styles.hoursTitle}>Opening Hours</h3>
                  </div>
                  {contactInfo.hours.map((h, i) => (
                    <div key={i} className={styles.hoursRow}>
                      <span>{h.day}</span>
                      <span className={styles.hoursTime}>{h.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Social */}
              {(contactInfo.instagram || contactInfo.facebook) && (
                <div className={styles.socialRow}>
                  {contactInfo.instagram && contactInfo.instagram !== "#" && (
                    <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                      <FaInstagram size={18} />
                    </a>
                  )}
                  {contactInfo.facebook && contactInfo.facebook !== "#" && (
                    <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                      <FaFacebookF size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right: Enquiry Form */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <p className={styles.formDesc}>Fill in the form below and we&apos;ll get back to you as soon as possible.</p>

              {status === "success" && (
                <div className={styles.alert} role="alert">
                  <HiOutlineCheckCircle size={20} />
                  <p>Thank you! Your message has been sent. We&apos;ll get back to you soon.</p>
                </div>
              )}

              {status === "error" && (
                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                  <HiOutlineExclamationCircle size={20} />
                  <p>Something went wrong. Please try again or contact us directly.</p>
                </div>
              )}

              {status !== "success" && (
                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                  {/* Honeypot field for spam bots */}
                  <input
                    type="text"
                    name="_hp_company"
                    value={form._hp_company || ""}
                    onChange={handleChange("_hp_company")}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Your Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      className={`form-input ${errors.name ? styles.inputError : ""}`}
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange("name")}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className={styles.formRow}>
                    <div className="form-group">
                      <label htmlFor="contact-phone" className="form-label">Phone</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className={`form-input ${errors.phone ? styles.inputError : ""}`}
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={handleChange("phone")}
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-email" className="form-label">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        className={`form-input ${errors.email ? styles.inputError : ""}`}
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">Message *</label>
                    <textarea
                      id="contact-message"
                      className={`form-textarea ${errors.message ? styles.inputError : ""}`}
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={handleChange("message")}
                      rows={5}
                    />
                    {errors.message && <span className="form-error">{errors.message}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={status === "sending"}
                    style={{ width: "100%" }}
                  >
                    {status === "sending" ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
