import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES, isConnectionError } from '@/lib/dbFallback';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CATEGORIES = [
  { name: "Men's Collection", slug: 'mens', desc: 'Premium slides, loafers and slip-ons for men.', parent: null, displayOrder: 1 },
  { name: "Women's Collection", slug: 'womens', desc: 'Handcrafted juttis, flats, sandals and mules.', parent: null, displayOrder: 2 },
  { name: 'Artisan Loafers', slug: 'mens-loafers', desc: 'Premium artisan loafers and slip-ons for men.', parent: 'mens', displayOrder: 1, typeMapping: 'loafers' },
  { name: 'Ergonomic Slides', slug: 'mens-slides', desc: 'Contoured footbed ergonomic everyday slides.', parent: 'mens', displayOrder: 2, typeMapping: 'slides' },
  { name: 'Strappy Sandals', slug: 'mens-sandals', desc: 'Comfort cross and strappy sandals.', parent: 'mens', displayOrder: 3, typeMapping: 'sandals' },
  { name: 'Casual Footwear', slug: 'mens-casual', desc: 'Relaxed everyday casual footwear for men.', parent: 'mens', displayOrder: 4, typeMapping: 'casual' },
  { name: 'Kutch Juttis & Mojris', slug: 'womens-juttis', desc: 'Handcrafted heritage mirror-work juttis.', parent: 'womens', displayOrder: 1, typeMapping: 'sandals' },
  { name: 'Ikat Slip-on Loafers', slug: 'womens-loafers', desc: 'Pochampally ikat woven loafers.', parent: 'womens', displayOrder: 2, typeMapping: 'loafers' },
  { name: 'Paisley Comfort Sandals', slug: 'womens-sandals', desc: 'Handcrafted paisley comfort sandals and flats.', parent: 'womens', displayOrder: 3, typeMapping: 'sandals' },
  { name: 'Floral Cork Slides', slug: 'womens-slides', desc: 'Natural cork footbed floral and mandala slides.', parent: 'womens', displayOrder: 4, typeMapping: 'slides' },
];

// GET: Retrieve all categories with product counts
export async function GET() {
  try {
    const db = await getDb();
    
    const count = await db.collection('categories').countDocuments();
    if (count === 0) {
      await db.collection('categories').insertMany(DEFAULT_CATEGORIES);
    }
    
    const categories = await db.collection('categories')
      .find({})
      .sort({ displayOrder: 1, name: 1 })
      .toArray();

    // Attach product counts for each category
    const products = await db.collection('products').find({}, { projection: { category: 1, type: 1, subcategory: 1 } }).toArray();
    const categoriesWithCount = categories.map(cat => {
      const prodCount = products.filter(p => 
        p.category === cat.slug || 
        p.subcategory === cat.slug ||
        (cat.typeMapping && p.category === cat.parent && p.type === cat.typeMapping)
      ).length;
      return {
        ...cat,
        productCount: prodCount,
      };
    });

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock categories fallback data.", error.message);
      return NextResponse.json({ success: true, data: MOCK_CATEGORIES, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new category
export async function POST(request) {
  try {
    const { name, slug, desc, parent, displayOrder, image } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category Name is required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    const rawSlug = slug && slug.trim() ? slug : name;
    const formattedSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (!formattedSlug) {
      return NextResponse.json({ success: false, error: 'Invalid Category Slug' }, { status: 400 });
    }

    // Check if slug already exists
    const existingSlug = await db.collection('categories').findOne({ slug: formattedSlug });
    if (existingSlug) {
      return NextResponse.json({ success: false, error: `A category with slug "${formattedSlug}" already exists.` }, { status: 400 });
    }

    // Verify parent exists if provided
    let parentSlug = null;
    if (parent && parent.trim() && parent !== '') {
      const parentCat = await db.collection('categories').findOne({ slug: parent.trim() });
      if (!parentCat) {
        return NextResponse.json({ success: false, error: `Parent category "${parent}" does not exist.` }, { status: 400 });
      }
      parentSlug = parentCat.slug;
    }
    
    const newCategory = {
      name: name.trim(),
      slug: formattedSlug,
      desc: desc ? desc.trim() : '',
      image: image ? image.trim() : '',
      parent: parentSlug,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('categories').insertOne(newCategory);
    return NextResponse.json({ success: true, data: { ...newCategory, _id: result.insertedId } });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing category
export async function PUT(request) {
  try {
    const { id, oldSlug, name, slug, desc, parent, displayOrder, isActive, image } = await request.json();
    
    if (!id && !oldSlug) {
      return NextResponse.json({ success: false, error: 'Category ID or slug is required for update' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category Name is required' }, { status: 400 });
    }

    const db = await getDb();

    // Find category to update
    let query = {};
    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else if (oldSlug) {
      query.slug = oldSlug;
    }

    const currentCat = await db.collection('categories').findOne(query);
    if (!currentCat) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const newSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') : currentCat.slug;
    
    // Check if new slug conflicts with another category
    if (newSlug !== currentCat.slug) {
      const slugConflict = await db.collection('categories').findOne({ 
        slug: newSlug, 
        _id: { $ne: currentCat._id } 
      });
      if (slugConflict) {
        return NextResponse.json({ success: false, error: `Slug "${newSlug}" is already taken by another category.` }, { status: 400 });
      }
    }

    // Parent validation & circular reference check
    let parentSlug = null;
    if (parent && parent.trim() && parent !== '') {
      const cleanParent = parent.trim();
      
      // Self reference check
      if (cleanParent === currentCat.slug || cleanParent === newSlug) {
        return NextResponse.json({ success: false, error: 'A category cannot be its own parent.' }, { status: 400 });
      }

      // Circular dependency check: ensure parent is not a descendant
      const allCats = await db.collection('categories').find({}).toArray();
      const getDescendants = (rootSlug) => {
        const descendants = new Set();
        const traverse = (s) => {
          allCats.filter(c => c.parent === s).forEach(child => {
            descendants.add(child.slug);
            traverse(child.slug);
          });
        };
        traverse(rootSlug);
        return descendants;
      };

      const descendants = getDescendants(currentCat.slug);
      if (descendants.has(cleanParent)) {
        return NextResponse.json({ 
          success: false, 
          error: `Circular hierarchy detected: cannot set parent to "${cleanParent}" because it is a subcategory of this category.` 
        }, { status: 400 });
      }

      parentSlug = cleanParent;
    }

    // Update document
    const updateData = {
      name: name.trim(),
      slug: newSlug,
      desc: desc !== undefined ? desc.trim() : currentCat.desc,
      image: image !== undefined ? image.trim() : (currentCat.image || ''),
      parent: parentSlug,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : (currentCat.displayOrder || 10),
      isActive: typeof isActive === 'boolean' ? isActive : true,
      updatedAt: new Date(),
    };

    await db.collection('categories').updateOne({ _id: currentCat._id }, { $set: updateData });

    // If slug changed, update all child categories and product references
    if (newSlug !== currentCat.slug) {
      await db.collection('categories').updateMany(
        { parent: currentCat.slug },
        { $set: { parent: newSlug } }
      );
      await db.collection('products').updateMany(
        { category: currentCat.slug },
        { $set: { category: newSlug } }
      );
      await db.collection('products').updateMany(
        { subcategory: currentCat.slug },
        { $set: { subcategory: newSlug } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category updated successfully',
      data: { ...currentCat, ...updateData }
    });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Safely remove a category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const force = searchParams.get('force') === 'true';
    const reassignTo = searchParams.get('reassignTo');
    
    if (!slug && !id) {
      return NextResponse.json({ success: false, error: 'Category slug or ID parameter is required' }, { status: 400 });
    }

    const db = await getDb();

    // Check if category exists
    let query = {};
    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else if (slug) {
      query.slug = slug;
    }

    const category = await db.collection('categories').findOne(query);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Protect system core root categories
    if (category.slug === 'mens' || category.slug === 'womens') {
      return NextResponse.json({ 
        success: false, 
        error: 'System standard root categories ("Men\'s Collection" and "Women\'s Collection") cannot be deleted as they define the store core architecture.' 
      }, { status: 403 });
    }

    // Check if any products are associated with this category
    const associatedProductsCount = await db.collection('products').countDocuments({
      $or: [
        { category: category.slug },
        { subcategory: category.slug },
        ...(category.typeMapping ? [{ category: category.parent, type: category.typeMapping }] : [])
      ]
    });

    if (associatedProductsCount > 0 && !force && !reassignTo) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete category: ${associatedProductsCount} product(s) are currently assigned to this category. Please reassign or confirm reassignment before deleting.`,
        productCount: associatedProductsCount,
        requiresReassignment: true,
        categoryName: category.name,
        categorySlug: category.slug,
        parent: category.parent
      }, { status: 409 });
    }

    // Safe product reassignment: NEVER delete products!
    // Safely reassign associated products so they are preserved
    if (associatedProductsCount > 0) {
      const targetCategory = (reassignTo && reassignTo.trim()) 
        ? reassignTo.trim() 
        : (category.parent || 'mens');

      // Update products where category was this deleted category
      await db.collection('products').updateMany(
        { category: category.slug },
        { $set: { category: targetCategory, updatedAt: new Date() } }
      );

      // Unset subcategory for products where subcategory was this deleted category
      await db.collection('products').updateMany(
        { subcategory: category.slug },
        { $set: { subcategory: null, updatedAt: new Date() } }
      );
    }
    
    // Check if child categories exist
    const childCats = await db.collection('categories').find({ parent: category.slug }).toArray();
    
    // Perform delete
    const result = await db.collection('categories').deleteOne({ _id: category._id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Category not found or already deleted' }, { status: 404 });
    }
    
    // Reassign child categories to deleted category's parent (or null) so they are never orphaned
    if (childCats.length > 0) {
      await db.collection('categories').updateMany(
        { parent: category.slug }, 
        { $set: { parent: category.parent || null, updatedAt: new Date() } }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Category "${category.name}" deleted successfully.${
        associatedProductsCount > 0 
          ? ` ${associatedProductsCount} product(s) safely preserved and reassigned.` 
          : ''
      }${
        childCats.length > 0 
          ? ` ${childCats.length} nested sub-category(ies) moved up to parent.` 
          : ''
      }` 
    });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
