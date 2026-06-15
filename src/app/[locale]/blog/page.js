import styles from "./page.module.css";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Articles & Care Tips | That Laundry Shop",
  description: "Read our latest articles on premium garment care, fabric science, and maintaining your wardrobe.",
  alternates: {
    canonical: "https://www.thatlaundryshop.com/blog",
  }
};

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      title: "The Science of Silk: How to Maintain Delicate Fabrics",
      excerpt: "Silk requires an incredibly specific pH balance during cleaning. Discover how our European machinery perfectly preserves the sheen and structural integrity of your finest silk garments.",
      date: "May 12, 2026",
      icon: "fa-gem"
    },
    {
      id: 2,
      title: "Why Eco-Friendly Solvents Outperform Traditional Dry Cleaning",
      excerpt: "We've abandoned perchloroethylene (PERC) for advanced hydrocarbon solvents. Here is why this switch is better for your skin, your clothes, and the environment.",
      date: "April 28, 2026",
      icon: "fa-leaf"
    },
    {
      id: 3,
      title: "The Art of the Perfect Press: What Goes into Our Ironing Service",
      excerpt: "Ironing is more than applying heat. It involves steam regulation, fabric tensioning, and artisan techniques. Learn what makes our pressing service the gold standard.",
      date: "April 10, 2026",
      icon: "fa-temperature-arrow-up"
    }
  ];

  // Schema for Blog List
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "That Laundry Shop Garment Care Blog",
    "url": "https://www.thatlaundryshop.com/blog",
    "blogPost": articles.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "datePublished": article.date,
      "description": article.excerpt
    }))
  };

  return (
    <>
      <Script
        id="schema-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>Garment Care Journal</h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
            Insights, tips, and the science behind preserving your luxury wardrobe.
          </p>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)" }}>
        <div className="container">
          <div className={styles.blogGrid}>
            
            {articles.map(article => (
              <article key={article.id} className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.blogImagePlaceholder}>
                    <i className={`fa-solid ${article.icon}`}></i>
                  </div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>{article.date}</span>
                  <h2 className={styles.blogTitle}>{article.title}</h2>
                  <p className={styles.blogExcerpt}>{article.excerpt}</p>
                  <Link href={`/blog/${article.id}`} className={styles.readMore}>
                    Read Article <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>
    </>
  );
}
