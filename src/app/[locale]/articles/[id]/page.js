import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const locales = ['en', 'th', 'cn'];
  try {
    const articles = await prisma.article.findMany({ select: { id: true } });
    const paths = [];
    for (const locale of locales) {
      for (const article of articles) {
        paths.push({ locale, id: article.id });
      }
    }
    return paths;
  } catch (error) {
    console.error("Failed to generate static params for articles:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  let article = null;
  try {
    article = await prisma.article.findUnique({ where: { id } });
  } catch (error) {
    console.error("Failed to fetch article metadata:", error);
  }
  if (!article) return { title: 'Article Not Found' };
  
  return {
    title: `${article.title} | That Laundry Shop`,
    description: article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...',
  };
}

export default async function ArticleDetails({ params }) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });

    if (!article) {
      return (
        <div style={{ padding: "10rem 2rem", textAlign: "center", background: "white" }}>
          <h1>Article not found in database</h1>
          <p>ID requested: {id}</p>
        </div>
      );
    }

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...',
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "That Laundry Shop",
      "url": "https://www.thatlaundryshop.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.thatlaundryshop.com/images/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.thatlaundryshop.com/articles/${article.id}`
    }
  };

  return (
    <>
      <Script
        id={`schema-article-${article.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ background: "var(--background)", paddingTop: "8rem", paddingBottom: "2rem" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <Link href="/articles" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600", display: "inline-block", marginBottom: "1.5rem" }}>
            &larr; Back to Articles
          </Link>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary)", marginBottom: "1rem" }}>{article.title}</h1>
          <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Published on {formatDate(article.createdAt)}</p>
        </div>
      </div>
      <section style={{ padding: "4rem 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div 
            className="article-content"
            style={{ lineHeight: "1.8", color: "var(--text-color)", fontSize: "1.1rem" }}
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>
      </section>
    </>
  );
  } catch (error) {
    return (
      <div style={{ padding: "10rem 2rem", background: "white", color: "red", minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Rendering Error</h1>
          <p style={{ fontWeight: "bold" }}>Error message: {error.message}</p>
          <p>Stack Trace:</p>
          <pre style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px", overflowX: "auto", fontSize: "0.85rem" }}>
            {error.stack}
          </pre>
        </div>
      </div>
    );
  }
}
