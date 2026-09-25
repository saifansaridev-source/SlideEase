import { getDb } from '@/lib/mongodb';

/**
 * Retrieves database-backed CMS content for a given page slug,
 * falling back gracefully if no database document exists yet.
 */
export async function getCmsPage(slug) {
  try {
    const db = await getDb();
    const doc = await db.collection('cms_pages').findOne({ slug, published: { $ne: false } });
    if (doc) {
      return {
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        metaTitle: doc.metaTitle || doc.title,
        metaDesc: doc.metaDesc || '',
        updatedAt: doc.updatedAt,
        isDbDriven: true,
      };
    }
  } catch (err) {
    console.warn(`CMS retrieval error for slug "${slug}":`, err.message);
  }
  return null;
}
