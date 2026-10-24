"use client";

import { useState, useEffect } from "react";
import {
  HiOutlinePencilAlt,
  HiOutlineEye,
  HiOutlineDeviceMobile,
  HiOutlineDesktopComputer,
  HiOutlineCheck,
  HiOutlineCloudUpload,
  HiOutlineBookmark,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlinePlus,
} from "react-icons/hi";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaYoutube,
  FaSnapchatGhost,
  FaTwitter,
  FaTiktok,
  FaPinterest,
  FaLinkedinIn,
  FaGlobe,
} from "react-icons/fa";
import {
  getCMSContent,
  saveDraftContent,
  publishContent,
  DEFAULT_CONTENT,
} from "@/lib/content";
import { useAuth } from "@/context/AuthContext";
import styles from "./edit.module.css";

function renderPreviewSocialIcon(platform) {
  switch (platform) {
    case "instagram": return <FaInstagram size={15} />;
    case "facebook": return <FaFacebookF size={14} />;
    case "whatsapp": return <FaWhatsapp size={15} />;
    case "youtube": return <FaYoutube size={15} />;
    case "snapchat": return <FaSnapchatGhost size={15} />;
    case "twitter": return <FaTwitter size={14} />;
    case "tiktok": return <FaTiktok size={14} />;
    case "pinterest": return <FaPinterest size={14} />;
    case "linkedin": return <FaLinkedinIn size={14} />;
    default: return <FaGlobe size={14} />;
  }
}

export default function EditWebsitePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("general");
  const [mobileTab, setMobileTab] = useState("editor"); // 'editor' | 'preview'
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'mobile'

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [initialContent, setInitialContent] = useState(DEFAULT_CONTENT);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasDrafts, setHasDrafts] = useState(false);
  const [lastPublished, setLastPublished] = useState(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load content from Supabase or fallback
  useEffect(() => {
    async function loadData() {
      const res = await getCMSContent();
      setContent(res.content);
      setInitialContent(res.content);
      setHasDrafts(res.hasDrafts);
      setLastPublished(res.lastPublishedAt);
    }
    loadData();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const isDifferent =
      JSON.stringify(content) !== JSON.stringify(initialContent);
    setHasUnsavedChanges(isDifferent);
  }, [content, initialContent]);

  // Handle field change
  const handleChange = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle nested hours change
  const handleHoursChange = (index, key, value) => {
    setContent((prev) => {
      const newHours = [...(prev.general?.hours || [])];
      if (newHours[index]) {
        newHours[index] = { ...newHours[index], [key]: value };
      }
      return {
        ...prev,
        general: { ...prev.general, hours: newHours },
      };
    });
  };

  // Handle about paragraph change
  const handleParagraphChange = (index, value) => {
    setContent((prev) => {
      const newParas = [...(prev.about?.storyParagraphs || [])];
      newParas[index] = value;
      return {
        ...prev,
        about: { ...prev.about, storyParagraphs: newParas },
      };
    });
  };

  // Handle social media links (synced across general and contact sections)
  const handleAddSocialLink = () => {
    setContent((prev) => {
      const current = prev.general?.socialLinks || prev.contact?.socialLinks || [];
      const updated = [...current, { platform: "instagram", url: "" }];
      return {
        ...prev,
        general: { ...prev.general, socialLinks: updated },
        contact: { ...prev.contact, socialLinks: updated },
      };
    });
  };

  const handleSocialLinkChange = (index, key, value) => {
    setContent((prev) => {
      const current = [...(prev.general?.socialLinks || prev.contact?.socialLinks || [])];
      if (current[index]) {
        current[index] = { ...current[index], [key]: value };
      }
      return {
        ...prev,
        general: { ...prev.general, socialLinks: current },
        contact: { ...prev.contact, socialLinks: current },
      };
    });
  };

  const handleRemoveSocialLink = (index) => {
    setContent((prev) => {
      const current = [...(prev.general?.socialLinks || prev.contact?.socialLinks || [])];
      current.splice(index, 1);
      return {
        ...prev,
        general: { ...prev.general, socialLinks: current },
        contact: { ...prev.contact, socialLinks: current },
      };
    });
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    setAlert(null);
    try {
      // Save all modified sections
      for (const section of Object.keys(content)) {
        await saveDraftContent(section, content[section], user?.id);
      }
      setInitialContent(content);
      setHasDrafts(true);
      setAlert({
        type: "success",
        message: "Draft saved successfully! These changes are NOT public yet.",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Failed to save draft. Please check your connection or database.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    setPublishing(true);
    setAlert(null);
    setShowConfirmModal(false);
    try {
      await publishContent(content, user?.id);
      setInitialContent(content);
      setHasDrafts(false);
      setLastPublished(new Date().toISOString());
      setAlert({
        type: "success",
        message: "🎉 Published live! Your changes are now visible to all website visitors.",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Failed to publish content. Please check permissions.",
      });
    } finally {
      setPublishing(false);
    }
  };

  // Discard edits
  const handleDiscard = () => {
    if (
      confirm("Are you sure you want to discard your unsaved edits?")
    ) {
      setContent(initialContent);
      setAlert({ type: "success", message: "Edits reverted." });
    }
  };

  const socialList = content.general?.socialLinks || content.contact?.socialLinks || [];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Website Content Editor</h1>
          <p className={styles.subtitle}>
            Update salon details and page copy with real-time live preview.
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* Status Badge */}
          {hasUnsavedChanges ? (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
              <span className={styles.statusDot} /> Unsaved Edits
            </span>
          ) : hasDrafts ? (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
              <span className={styles.statusDot} /> Draft Saved (Unpublished)
            </span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
              <span className={styles.statusDot} /> Published Live
            </span>
          )}

          {hasUnsavedChanges && (
            <button
              className={styles.btnSecondary}
              onClick={handleDiscard}
              disabled={saving || publishing}
            >
              <HiOutlineRefresh size={16} /> Discard
            </button>
          )}

          <button
            className={styles.btnSecondary}
            onClick={handleSaveDraft}
            disabled={saving || publishing || !hasUnsavedChanges}
          >
            <HiOutlineBookmark size={16} />
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            className={styles.btnPrimary}
            onClick={() => setShowConfirmModal(true)}
            disabled={saving || publishing}
          >
            <HiOutlineCloudUpload size={16} />
            {publishing ? "Publishing..." : "Publish Changes"}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={
            alert.type === "success" ? styles.alertSuccess : styles.alertError
          }
        >
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className={styles.sectionTabs}>
        <button
          className={`${styles.sectionTab} ${
            activeSection === "general" ? styles.sectionTabActive : ""
          }`}
          onClick={() => setActiveSection("general")}
        >
          <HiOutlineInformationCircle size={16} /> General & Contact Details
        </button>
        <button
          className={`${styles.sectionTab} ${
            activeSection === "home" ? styles.sectionTabActive : ""
          }`}
          onClick={() => setActiveSection("home")}
        >
          <HiOutlineSparkles size={16} /> Home Page Hero
        </button>
        <button
          className={`${styles.sectionTab} ${
            activeSection === "about" ? styles.sectionTabActive : ""
          }`}
          onClick={() => setActiveSection("about")}
        >
          <HiOutlinePencilAlt size={16} /> About Page Story
        </button>
        <button
          className={`${styles.sectionTab} ${
            activeSection === "contact" ? styles.sectionTabActive : ""
          }`}
          onClick={() => setActiveSection("contact")}
        >
          <HiOutlineLocationMarker size={16} /> Contact Page Headings
        </button>
      </div>

      {/* Mobile Tab Switcher */}
      <div className={styles.viewSwitcher}>
        <button
          className={`${styles.viewSwitchBtn} ${
            mobileTab === "editor" ? styles.viewSwitchBtnActive : ""
          }`}
          onClick={() => setMobileTab("editor")}
        >
          <HiOutlinePencilAlt size={16} /> Form Editor
        </button>
        <button
          className={`${styles.viewSwitchBtn} ${
            mobileTab === "preview" ? styles.viewSwitchBtnActive : ""
          }`}
          onClick={() => setMobileTab("preview")}
        >
          <HiOutlineEye size={16} /> Live Preview
        </button>
      </div>

      {/* Workspace Grid */}
      <div className={styles.workspace}>
        {/* Left: Form Controls */}
        <div
          className={`${styles.editorPanel} ${
            mobileTab !== "editor" ? styles.hideOnMobile : ""
          }`}
        >
          <div className={styles.editorHeader}>
            <h3>
              {activeSection === "general" && "Salon Business Info"}
              {activeSection === "home" && "Home Hero Section"}
              {activeSection === "about" && "About Story Content"}
              {activeSection === "contact" && "Contact Intro"}
            </h3>
            <span className={styles.helperText}>Predefined safe fields</span>
          </div>

          <div className={styles.editorContent}>
            {/* 1. GENERAL INFO */}
            {activeSection === "general" && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Salon Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.general?.salonName || ""}
                    onChange={(e) =>
                      handleChange("general", "salonName", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Tagline</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.general?.tagline || ""}
                    onChange={(e) =>
                      handleChange("general", "tagline", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.general?.phone || ""}
                    onChange={(e) =>
                      handleChange("general", "phone", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>WhatsApp Number</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.general?.whatsapp || ""}
                    onChange={(e) =>
                      handleChange("general", "whatsapp", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={content.general?.email || ""}
                    onChange={(e) =>
                      handleChange("general", "email", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Physical Address</label>
                  <textarea
                    className={styles.textarea}
                    value={content.general?.address || ""}
                    onChange={(e) =>
                      handleChange("general", "address", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Google Maps Link</label>
                  <input
                    type="url"
                    className={styles.input}
                    placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                    value={content.general?.mapLink || ""}
                    onChange={(e) =>
                      handleChange("general", "mapLink", e.target.value)
                    }
                  />
                  <span className={styles.helperText}>
                    Paste your salon&apos;s Google Maps share link. Tapping the address on Contact page or Footer will open your location.
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Opening Hours</label>
                  {content.general?.hours?.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <input
                        type="text"
                        className={styles.input}
                        style={{ flex: 1 }}
                        value={h.day}
                        onChange={(e) =>
                          handleHoursChange(i, "day", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className={styles.input}
                        style={{ flex: 1 }}
                        value={h.time}
                        onChange={(e) =>
                          handleHoursChange(i, "time", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Social Media Accounts</label>
                  <span className={styles.helperText} style={{ marginBottom: "8px", display: "block" }}>
                    Add links to your social profiles (Instagram, YouTube, WhatsApp, Facebook, Snapchat, Twitter / X, TikTok, Pinterest, LinkedIn, Other / Website). They will appear on your Contact page and in the Footer.
                  </span>

                  {(!socialList || socialList.length === 0) ? (
                    <p className={styles.socialEmptyText}>No social media links added yet. Click &quot;+ Add Social Link&quot; below.</p>
                  ) : (
                    socialList.map((item, index) => (
                      <div key={index} className={styles.socialRowEditor}>
                        <select
                          className={styles.socialSelect}
                          value={item.platform || "instagram"}
                          onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                        >
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="facebook">Facebook</option>
                          <option value="snapchat">Snapchat</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="tiktok">TikTok</option>
                          <option value="pinterest">Pinterest</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="website">Other / Website</option>
                        </select>
                        <input
                          type="text"
                          className={`${styles.input} ${styles.socialInput}`}
                          placeholder={
                            item.platform === "whatsapp"
                              ? "Phone number or https://wa.me/..."
                              : "https://... (profile or channel link)"
                          }
                          value={item.url || ""}
                          onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.socialDeleteBtn}
                          onClick={() => handleRemoveSocialLink(index)}
                          title="Remove social link"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    className={styles.socialAddBtn}
                    onClick={handleAddSocialLink}
                  >
                    <HiOutlinePlus size={14} /> Add Social Link
                  </button>
                </div>
              </>
            )}

            {/* 2. HOME PAGE HERO */}
            {activeSection === "home" && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Hero Badge / Tagline</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.home?.heroTagline || ""}
                    onChange={(e) =>
                      handleChange("home", "heroTagline", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Headline Main Part</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.home?.heroTitle || ""}
                    onChange={(e) =>
                      handleChange("home", "heroTitle", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Headline Accent Word (Gold)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.home?.heroAccent || ""}
                    onChange={(e) =>
                      handleChange("home", "heroAccent", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Hero Description Paragraph</label>
                  <textarea
                    className={styles.textarea}
                    value={content.home?.heroDescription || ""}
                    onChange={(e) =>
                      handleChange("home", "heroDescription", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Primary CTA Button Text</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.home?.heroCta || ""}
                    onChange={(e) =>
                      handleChange("home", "heroCta", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Secondary CTA Button Text</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.home?.heroCtaSecondary || ""}
                    onChange={(e) =>
                      handleChange("home", "heroCtaSecondary", e.target.value)
                    }
                  />
                </div>
              </>
            )}

            {/* 3. ABOUT STORY */}
            {activeSection === "about" && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>About Page Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.about?.title || ""}
                    onChange={(e) =>
                      handleChange("about", "title", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Short Introduction</label>
                  <textarea
                    className={styles.textarea}
                    value={content.about?.description || ""}
                    onChange={(e) =>
                      handleChange("about", "description", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Story Paragraph 1</label>
                  <textarea
                    className={styles.textarea}
                    value={content.about?.storyParagraphs?.[0] || ""}
                    onChange={(e) => handleParagraphChange(0, e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Story Paragraph 2</label>
                  <textarea
                    className={styles.textarea}
                    value={content.about?.storyParagraphs?.[1] || ""}
                    onChange={(e) => handleParagraphChange(1, e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Story Paragraph 3</label>
                  <textarea
                    className={styles.textarea}
                    value={content.about?.storyParagraphs?.[2] || ""}
                    onChange={(e) => handleParagraphChange(2, e.target.value)}
                  />
                </div>
              </>
            )}

            {/* 4. CONTACT INTRO */}
            {activeSection === "contact" && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Contact Page Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={content.contact?.title || ""}
                    onChange={(e) =>
                      handleChange("contact", "title", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Contact Description</label>
                  <textarea
                    className={styles.textarea}
                    value={content.contact?.description || ""}
                    onChange={(e) =>
                      handleChange("contact", "description", e.target.value)
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Social Media Links</label>
                  <span className={styles.helperText} style={{ marginBottom: "8px", display: "block" }}>
                    Add accounts (Instagram, Facebook, WhatsApp, YouTube, Snapchat, etc.). They will appear on the Contact page.
                  </span>

                  {(!content.contact?.socialLinks || content.contact.socialLinks.length === 0) ? (
                    <p className={styles.socialEmptyText}>No social media links added yet. Click &quot;+ Add Social Link&quot; below.</p>
                  ) : (
                    content.contact.socialLinks.map((item, index) => (
                      <div key={index} className={styles.socialRowEditor}>
                        <select
                          className={styles.socialSelect}
                          value={item.platform || "instagram"}
                          onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="youtube">YouTube</option>
                          <option value="snapchat">Snapchat</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="tiktok">TikTok</option>
                          <option value="pinterest">Pinterest</option>
                          <option value="website">Other / Website</option>
                        </select>
                        <input
                          type="text"
                          className={`${styles.input} ${styles.socialInput}`}
                          placeholder={
                            item.platform === "whatsapp"
                              ? "Phone number or https://wa.me/..."
                              : "https://..."
                          }
                          value={item.url || ""}
                          onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.socialDeleteBtn}
                          onClick={() => handleRemoveSocialLink(index)}
                          title="Remove social link"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    className={styles.socialAddBtn}
                    onClick={handleAddSocialLink}
                  >
                    <HiOutlinePlus size={14} /> Add Social Link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Real-time Live Preview */}
        <div
          className={`${styles.previewPanel} ${
            mobileTab !== "preview" ? styles.hideOnMobile : ""
          }`}
        >
          <div className={styles.previewHeader}>
            <div className={styles.previewTitle}>
              <HiOutlineEye size={16} /> Live Preview (Updates in real-time)
            </div>

            <div className={styles.deviceControls}>
              <button
                className={`${styles.deviceBtn} ${
                  previewDevice === "desktop" ? styles.deviceBtnActive : ""
                }`}
                onClick={() => setPreviewDevice("desktop")}
                title="Desktop View"
              >
                <HiOutlineDesktopComputer size={18} />
              </button>
              <button
                className={`${styles.deviceBtn} ${
                  previewDevice === "mobile" ? styles.deviceBtnActive : ""
                }`}
                onClick={() => setPreviewDevice("mobile")}
                title="Mobile View"
              >
                <HiOutlineDeviceMobile size={18} />
              </button>
            </div>
          </div>

          <div className={styles.previewBody}>
            <div
              className={`${styles.previewViewport} ${
                previewDevice === "mobile" ? styles.previewViewportMobile : ""
              }`}
            >
              {/* Preview Content based on active section */}
              {activeSection === "general" && (
                <div style={{ padding: "32px 24px" }}>
                  <div
                    style={{
                      borderBottom: "1px solid var(--color-border-light)",
                      paddingBottom: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        color: "var(--color-primary)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      {content.general?.tagline || "Tagline"}
                    </span>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "var(--color-text-primary)",
                        marginTop: "4px",
                      }}
                    >
                      {content.general?.salonName || "Salon Name"}
                    </h2>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <HiOutlinePhone
                        size={20}
                        color="var(--color-primary)"
                        style={{ marginTop: "2px" }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          CONTACT
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {content.general?.phone}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          WhatsApp: {content.general?.whatsapp}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {content.general?.email}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <HiOutlineLocationMarker
                        size={20}
                        color="var(--color-primary)"
                        style={{ marginTop: "2px" }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          LOCATION
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {content.general?.address}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <HiOutlineClock
                        size={20}
                        color="var(--color-primary)"
                        style={{ marginTop: "2px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          BUSINESS HOURS
                        </div>
                        {content.general?.hours?.map((h, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "13px",
                              marginTop: "4px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            <span>{h.day}</span>
                            <span style={{ fontWeight: "600" }}>{h.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {content.general?.mapLink && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--color-primary)", marginTop: "12px" }}>
                        <span>📍</span>
                        <span>Google Maps Location Linked</span>
                      </div>
                    )}

                    {socialList && socialList.filter(l => l.url?.trim()).length > 0 && (
                      <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--color-border-light)" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                          SOCIAL PROFILES
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {socialList.filter(l => l.url?.trim()).map((l, i) => (
                            <div
                              key={i}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--color-background-alt)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--color-primary)",
                                border: "1px solid var(--color-border-light)",
                              }}
                              title={l.platform}
                            >
                              {renderPreviewSocialIcon(l.platform)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "home" && (
                <div
                  style={{
                    padding: "48px 24px",
                    background:
                      "linear-gradient(135deg, #1a1a24 0%, #232332 100%)",
                    color: "#ffffff",
                    textAlign: "center",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 14px",
                      borderRadius: "999px",
                      background: "rgba(184, 134, 11, 0.2)",
                      border: "1px solid rgba(184, 134, 11, 0.4)",
                      fontSize: "12px",
                      color: "#ffd700",
                      marginBottom: "16px",
                      fontWeight: "600",
                    }}
                  >
                    ✨ {content.home?.heroTagline}
                  </div>
                  <h1
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      lineHeight: "1.2",
                      marginBottom: "14px",
                    }}
                  >
                    {content.home?.heroTitle}{" "}
                    <span style={{ color: "#ffd700" }}>
                      {content.home?.heroAccent}
                    </span>
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.8)",
                      maxWidth: "460px",
                      margin: "0 auto 24px",
                      lineHeight: "1.6",
                    }}
                  >
                    {content.home?.heroDescription}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      style={{
                        padding: "10px 20px",
                        background:
                          "linear-gradient(135deg, #b8860b, #d4af37)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      {content.home?.heroCta}
                    </button>
                    <button
                      style={{
                        padding: "10px 20px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      {content.home?.heroCtaSecondary}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === "about" && (
                <div style={{ padding: "32px 24px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "var(--color-primary)",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    ABOUT US
                  </span>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "var(--color-text-primary)",
                      marginTop: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    {content.about?.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                      marginBottom: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    {content.about?.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {content.about?.storyParagraphs?.map((p, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.7",
                          color: "var(--color-text-primary)",
                          background: "var(--color-background-alt)",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          borderLeft: "3px solid var(--color-primary)",
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "contact" && (
                <div style={{ padding: "32px 24px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "var(--color-primary)",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    CONTACT
                  </span>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "var(--color-text-primary)",
                      marginTop: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    {content.contact?.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {content.contact?.description}
                  </p>

                  {content.contact?.socialLinks && content.contact.socialLinks.filter(l => l.url?.trim()).length > 0 && (
                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border-light)" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "10px" }}>
                        SOCIAL MEDIA PROFILES
                      </span>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {content.contact.socialLinks.filter(l => l.url?.trim()).map((l, i) => (
                          <div
                            key={i}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "var(--color-background-alt)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-primary)",
                              border: "1px solid var(--color-border-light)",
                              fontSize: "14px",
                            }}
                            title={l.platform}
                          >
                            {renderPreviewSocialIcon(l.platform)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Publishing */}
      {showConfirmModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Publish Changes Live?</h3>
            <p className={styles.modalDesc}>
              This will immediately update the live public website for all
              visitors. Any drafts will be promoted to the live published state.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handlePublish}
                disabled={publishing}
              >
                <HiOutlineCheck size={16} /> Yes, Publish Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
