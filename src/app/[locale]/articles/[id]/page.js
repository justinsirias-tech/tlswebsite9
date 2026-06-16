import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { title: 'Article Not Found' };
  
  return {
    title: `${article.title} | That Laundry Shop`,
    description: article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...',
  };
}

export default async function ArticleDetails({ params }) {
  const { id } = await params;
  let article = null;
  try {
    article = await prisma.article.findUnique({ where: { id } });
  } catch(e) {
    console.error(e);
  }

  if (!article) return notFound();

  return (
    <>
      <Header />
      <div style={{ background: "var(--background)", paddingTop: "8rem", paddingBottom: "2rem" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <Link href="/articles" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600", display: "inline-block", marginBottom: "1.5rem" }}>
            &larr; Back to Articles
          </Link>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary)", marginBottom: "1rem" }}>{article.title}</h1>
          <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Published on {new Date(article.createdAt).toLocaleDateString()}</p>
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
      <Footer />
    </>
  );
}
