"use client";

import React, { useState } from 'react';
import styles from './SEOArticles.module.css';
import Image from 'next/image';
import Link from 'next/link';

const getFirstImage = (html) => {
  if (!html) return "/assets/hero_laundry.webp";
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : "/assets/hero_laundry.webp";
};

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const ArticleCard = ({ id, title, content }) => {
  const imageUrl = getFirstImage(content);
  const plainText = stripHtml(content);

  return (
    <article className={styles.articleCard}>
      {imageUrl && (
        <div className={styles.cardImageContainer}>
          <Image src={imageUrl} alt={title} fill className={styles.cardImage} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={false} />
        </div>
      )}
      <h3 className={styles.articleTitle}>{title}</h3>
      <p className={styles.articleText}>
        {plainText.substring(0, 140)}...
      </p>
      <Link 
        href={`/articles/${id}`}
        className={styles.expandBtn} 
        style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        Read Full Article
      </Link>
    </article>
  );
};

export default function SEOArticles({ initialArticles = [] }) {
  if (initialArticles.length === 0) {
    return (
      <section className={styles.section} aria-label="News and Garment Care Articles">
        <div className="container">
          <p style={{ textAlign: "center", color: "var(--text-light)" }}>Check back soon for new articles!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="News and Garment Care Articles">
      <div className="container">
        <div className={styles.grid}>
          {initialArticles.map(article => (
            <ArticleCard 
              key={article.id} 
              id={article.id}
              title={article.title} 
              content={article.content} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
