import { getDb } from '@/lib/mongodb';
import { DEFAULT_CMS_PAGES } from '@/lib/cms-defaults';

/**
 * Normalizes page slug for aliases (e.g. shipping -> shipping-returns)
 */
export function normalizePageSlug(slug) {
  if (slug === 'shipping') return 'shipping-returns';
  return slug;
}

/**
 * Retrieves database-backed CMS content for a given page slug,
 * falling back gracefully to code-defined default if no database document exists yet.
 */
export async function getCmsPage(rawSlug) {
  const slug = normalizePageSlug(rawSlug);
  try {
    const db = await getDb();
    const doc = await db.collection('cms_pages').findOne({ slug });
    if (doc) {
      if (doc.published === false) {
        // Document is a saved draft and NOT published to storefront
        return null;
      }
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

  // Graceful fallback to default page content
  const def = DEFAULT_CMS_PAGES[slug];
  if (def) {
    return {
      ...def,
      isDbDriven: false,
    };
  }

  return null;
}

