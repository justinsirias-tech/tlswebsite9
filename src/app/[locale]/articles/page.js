import SEOArticles from "../../../components/SEOArticles";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News & Garment Care Articles | That Laundry Shop",
  description: "Read our latest news, updates, and comprehensive articles on premium garment care and dry cleaning services.",
};

export default async function ArticlesPage() {
  let articles = [];
  try {
    articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to load articles:", error);
  }

  return (
    <>
      <div style={{ background: "var(--background)", paddingTop: "8rem", paddingBottom: "2rem", textAlign: "center" }}>
        <div className="container">
          <h1 style={{ fontSize: "3rem", color: "var(--primary)" }}>News & Garment Care Articles</h1>
          <p style={{ color: "var(--text-light)", fontSize: "1.2rem", marginTop: "1rem" }}>Stay up to date with our latest announcements, luxury fabric insights, and expert care tips.</p>
        </div>
      </div>
      <SEOArticles initialArticles={articles} />
    </>
  );
}
