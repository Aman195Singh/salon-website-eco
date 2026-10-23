"use client";

import { useState } from "react";
import { HiOutlineX, HiOutlinePhotograph } from "react-icons/hi";
import styles from "./gallery.module.css";

const GALLERY_IMAGES = [
  {
    id: 1,
    src: "/images/hero-salon.jpg",
    alt: "Salon Interior & Styling Stations",
    caption: "Our modern luxury salon space",
    category: "Salon",
  },
  {
    id: 2,
    src: "/images/about-salon.jpg",
    alt: "Master Hair Styling",
    caption: "Precision cuts and blow dry styling",
    category: "Hair",
  },
  {
    id: 3,
    src: "/images/gallery-bridal.jpg",
    alt: "Indian Bridal Makeup & Styling",
    caption: "Radiant, timeless bridal transformations",
    category: "Bridal",
  },
  {
    id: 4,
    src: "/images/gallery-grooming.jpg",
    alt: "Men's Haircut & Beard Grooming",
    caption: "Sharp beard trimming and classic men's cuts",
    category: "Grooming",
  },
  {
    id: 5,
    src: "/images/gallery-facial.jpg",
    alt: "Rejuvenating Spa Facial Treatment",
    caption: "Deep cleansing and hydrating skin care",
    category: "Skin",
  },
  {
    id: 6,
    src: "/images/gallery-nails.jpg",
    alt: "Gold Foil Nail Art & Manicure",
    caption: "Elegant nail art with delicate gold leaf",
    category: "Nails",
  },
];

export default function GalleryPage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="section-label">Gallery</span>
          <h1 className={styles.heroTitle}>Our Work & Craft</h1>
          <p className={styles.heroDesc}>
            A glimpse of our salon, our artistry, and the transformations we create for our clients every day.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {GALLERY_IMAGES.map((img) => (
              <button
                key={img.id}
                className={styles.gridItem}
                onClick={() => setSelected(img)}
                aria-label={`View: ${img.alt}`}
              >
                <img src={img.src} alt={img.alt} className={styles.galleryImg} />
                <div className={styles.gridOverlay}>
                  <span className={styles.caption}>{img.caption}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className={styles.lightbox}
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.alt}
        >
          <button
            className={styles.closeBtn}
            onClick={() => setSelected(null)}
            aria-label="Close image preview"
          >
            <HiOutlineX size={28} />
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.src}
              alt={selected.alt}
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: "var(--radius-lg)",
                objectFit: "contain",
              }}
            />
            <p className={styles.lightboxCaption}>{selected.caption}</p>
          </div>
        </div>
      )}
    </>
  );
}
