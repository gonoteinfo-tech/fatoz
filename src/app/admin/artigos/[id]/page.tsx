import { prisma } from "@/lib/db";
import { ArticleEditor } from "@/components/article-editor";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/artigos" className="text-sm text-slate-500 hover:underline">
          ← Voltar para artigos
        </Link>
        {article.status === "PUBLISHED" && (
          <Link href={`/noticia/${article.slug}`} target="_blank" className="text-sm font-medium text-brand-600 hover:underline">
            Ver no site ↗
          </Link>
        )}
      </div>
      <h1 className="mb-6 text-2xl font-extrabold">Editar artigo</h1>
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          imageUrl: article.imageUrl,
          category: article.category,
          tags: article.tags,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          keywords: article.keywords,
          status: article.status,
        }}
      />
    </div>
  );
}
