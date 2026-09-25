import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DEFAULT_SHIPPING_SETTINGS = {
  freeShippingThreshold: 999,
  shippingFlatRate: 79,
  expressDeliveryCharge: 149,
  codCharge: 49,
  taxRate: 18,
  cgstRate: 9,
  sgstRate: 9,
  taxIncludedInPrice: true,
  codEnabled: true,
  expressEnabled: true,
  freeShippingEnabled: true,
};

/**
 * Calculates authoritative order totals and item details from the database.
 * The browser client is NEVER trusted for pricing, discounts, shipping, tax, or totals.
 *
 * @param {Object} params
 * @param {Array} params.items - Array of items: [{ id / productId, size, quantity }]
 * @param {string} [params.couponCode] - Optional coupon code
 * @param {string} [params.shippingMethod] - 'standard' | 'express'
 * @param {boolean} [params.isCod] - Whether Cash on Delivery is chosen
 * @param {boolean} [params.giftWrap] - Whether gift wrapping was requested
 * @param {string} [params.b2g1FreeProductId] - Optional user-selected 3rd free footwear product id for B2G1
 * @param {string} [params.b2g1FreeSize] - Size for the free footwear item
 * @returns {Promise<Object>} Authoritative pricing breakdown
 */
export async function calculateAuthoritativePricing({
  items = [],
  couponCode = null,
  shippingMethod = 'standard',
  isCod = false,
  giftWrap = false,
  b2g1FreeProductId = null,
  b2g1FreeSize = null,
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  const db = await getDb();

  // 1. Fetch Shipping and Tax Settings
  let settings = DEFAULT_SHIPPING_SETTINGS;
  try {
    const settingsDoc = await db.collection('settings').findOne({ key: 'shipping_tax' });
    if (settingsDoc) {
      const { _id, key, ...rest } = settingsDoc;
      settings = { ...DEFAULT_SHIPPING_SETTINGS, ...rest };
    }
  } catch (err) {
    console.warn('Could not load shipping/tax settings, using production defaults', err.message);
  }

  // 2. Validate Items and Fetch authoritative DB products
  const validatedItems = [];
  let subtotal = 0;
  let totalMrp = 0;

  for (const item of items) {
    const rawId = item.productId || item.id;
    if (!rawId) {
      throw new Error('Item missing productId or id.');
    }

    const qty = parseInt(item.quantity || item.qty || 1, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for item ${rawId}`);
    }

    const sizeStr = item.size ? String(item.size).trim() : null;
    if (!sizeStr) {
      throw new Error(`Footwear size must be specified for product ${rawId}`);
    }

    // Query product by id or _id
    let product = null;
    if (ObjectId.isValid(rawId)) {
      product = await db.collection('products').findOne({ _id: new ObjectId(rawId) });
    }
    if (!product) {
      product = await db.collection('products').findOne({ id: rawId });
    }
    if (!product) {
      throw new Error(`Product "${rawId}" not found in authoritative catalog.`);
    }

    // Check size stock
    const availableSizeStock = product.sizeStock && typeof product.sizeStock[sizeStr] === 'number'
      ? product.sizeStock[sizeStr]
      : (product.stockQty !== undefined ? product.stockQty : 50);

    if (availableSizeStock < qty) {
      throw new Error(`Insufficient stock for "${product.name}" in Size UK ${sizeStr}. Only ${availableSizeStock} available.`);
    }

    const unitPrice = parseFloat(product.price);
    const unitMrp = parseFloat(product.originalPrice || product.mrp || product.price);

    const lineTotal = unitPrice * qty;
    const lineMrpTotal = unitMrp * qty;

    subtotal += lineTotal;
    totalMrp += lineMrpTotal;

    validatedItems.push({
      _id: product._id ? product._id.toString() : null,
      id: product.id || product._id.toString(),
      name: product.name,
      slug: product.slug || product.id,
      category: product.category,
      type: product.type || 'Footwear',
      image: product.image || (Array.isArray(product.images) ? product.images[0] : ''),
      size: sizeStr,
      quantity: qty,
      unitPrice,
      unitMrp,
      lineTotal,
      lineMrpTotal,
      color: product.color || item.color || '',
      material: product.material || '',
      sku: product.sku || `${product.id}-${sizeStr}`.toUpperCase(),
    });
  }

  // 3. Footwear B2G1 (Buy 2 Get 1) Promotion Logic
  let b2g1Discount = 0;
  let b2g1Applied = false;
  let freeItemInfo = null;

  // Count qualifying paid footwear items
  const totalFootwearUnits = validatedItems.reduce((sum, item) => sum + item.quantity, 0);

  // If customer has 2 or more eligible paid items, they qualify for 1 free footwear item in the B2G1 promotion
  if (totalFootwearUnits >= 2 && b2g1FreeProductId && b2g1FreeSize) {
    let freeProd = null;
    if (ObjectId.isValid(b2g1FreeProductId)) {
      freeProd = await db.collection('products').findOne({ _id: new ObjectId(b2g1FreeProductId) });
    }
    if (!freeProd) {
      freeProd = await db.collection('products').findOne({ id: b2g1FreeProductId });
    }

    if (freeProd) {
      const freeSizeStr = String(b2g1FreeSize).trim();
      const freeAvailableStock = freeProd.sizeStock && typeof freeProd.sizeStock[freeSizeStr] === 'number'
        ? freeProd.sizeStock[freeSizeStr]
        : 10;

      if (freeAvailableStock > 0) {
        b2g1Applied = true;
        const freeVal = parseFloat(freeProd.price);
        b2g1Discount = freeVal; // 100% off for the third free footwear item

        freeItemInfo = {
          _id: freeProd._id ? freeProd._id.toString() : null,
          id: freeProd.id || freeProd._id.toString(),
          name: freeProd.name,
          category: freeProd.category,
          size: freeSizeStr,
          quantity: 1,
          unitPrice: 0,
          originalPrice: freeVal,
          isFreeB2G1Item: true,
          image: freeProd.image,
          color: freeProd.color,
          sku: `${freeProd.id}-${freeSizeStr}-B2G1`.toUpperCase(),
        };

        // Add free item to validatedItems
        validatedItems.push(freeItemInfo);
      }
    }
  }

  // 4. Authoritative Coupon Validation
  let couponDiscount = 0;
  let couponDetails = null;

  if (couponCode && typeof couponCode === 'string') {
    const cleanCode = couponCode.trim().toUpperCase();
    const couponDoc = await db.collection('coupons').findOne({ code: cleanCode });

    if (!couponDoc) {
      throw new Error(`Coupon "${cleanCode}" is invalid or does not exist.`);
    }

    if (!couponDoc.active) {
      throw new Error(`Coupon "${cleanCode}" is inactive or expired.`);
    }

    if (couponDoc.endDate && new Date(couponDoc.endDate) < new Date()) {
      throw new Error(`Coupon "${cleanCode}" has expired.`);
    }

    const minOrderRequired = parseFloat(couponDoc.minOrder || 0);
    if (subtotal < minOrderRequired) {
      throw new Error(`Coupon "${cleanCode}" requires a minimum order subtotal of ₹${minOrderRequired}.`);
    }

    if (couponDoc.usageLimit && (couponDoc.usedCount || 0) >= couponDoc.usageLimit) {
      throw new Error(`Coupon "${cleanCode}" usage limit has been reached.`);
    }

    // Calculate discount value
    const rawDisc = parseFloat(couponDoc.discount || 0);
    if (rawDisc > 0 && rawDisc <= 1) {
      // Percentage as decimal e.g. 0.10 for 10%
      couponDiscount = Math.round(subtotal * rawDisc);
    } else if (rawDisc > 1 && rawDisc <= 100 && couponDoc.type !== 'fixed') {
      // Percentage as integer e.g. 10 for 10%
      couponDiscount = Math.round(subtotal * (rawDisc / 100));
    } else {
      // Fixed amount discount
      couponDiscount = Math.min(rawDisc, subtotal);
    }

    // Apply max discount cap if configured
    if (couponDoc.maxDiscount && couponDiscount > couponDoc.maxDiscount) {
      couponDiscount = couponDoc.maxDiscount;
    }

    couponDetails = {
      code: cleanCode,
      discount: couponDiscount,
      type: couponDoc.type || 'percentage',
      minOrder: minOrderRequired,
    };
  }

  const totalDiscount = couponDiscount + b2g1Discount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

  // 5. Shipping Fee Calculation
  let shippingFee = 0;
  if (shippingMethod === 'express' && settings.expressEnabled) {
    shippingFee = settings.expressDeliveryCharge || 149;
  } else {
    if (settings.freeShippingEnabled && discountedSubtotal >= settings.freeShippingThreshold) {
      shippingFee = 0;
    } else {
      shippingFee = settings.shippingFlatRate || 79;
    }
  }

  // 6. Gift Wrap Fee
  const giftWrapFee = giftWrap ? 99 : 0;

  // 7. COD Fee
  let codFee = 0;
  if (isCod) {
    if (!settings.codEnabled) {
      throw new Error('Cash on Delivery is currently disabled.');
    }
    codFee = settings.codCharge || 49;
  }

  // 8. Tax Calculation
  // In India footwear is typically GST 18% (or 5%/12% depending on slab, default configured as 18%)
  const taxRate = settings.taxRate || 18;
  let taxAmount = 0;
  let cgst = 0;
  let sgst = 0;

  if (settings.taxIncludedInPrice) {
    // Tax is inclusive: Tax = Subtotal - (Subtotal / (1 + Rate / 100))
    taxAmount = Math.round(discountedSubtotal - (discountedSubtotal / (1 + taxRate / 100)));
    cgst = Math.round(taxAmount / 2);
    sgst = taxAmount - cgst;
  } else {
    // Tax is exclusive
    taxAmount = Math.round(discountedSubtotal * (taxRate / 100));
    cgst = Math.round(taxAmount / 2);
    sgst = taxAmount - cgst;
  }

  // 9. Authoritative Payable Total
  const finalPayableTotal = Math.max(
    0,
    discountedSubtotal + shippingFee + giftWrapFee + codFee + (settings.taxIncludedInPrice ? 0 : taxAmount)
  );

  return {
    items: validatedItems,
    pricing: {
      subtotal,
      totalMrp,
      mrpSavings: Math.max(0, totalMrp - subtotal),
      discount: totalDiscount,
      couponDiscount,
      b2g1Discount,
      shipping: shippingFee,
      giftWrap: giftWrapFee,
      codFee,
      tax: taxAmount,
      cgst,
      sgst,
      taxIncludedInPrice: settings.taxIncludedInPrice,
      total: finalPayableTotal,
      currency: 'INR',
    },
    coupon: couponDetails,
    b2g1: {
      applied: b2g1Applied,
      discount: b2g1Discount,
      freeItem: freeItemInfo,
    },
    shippingSettings: {
      method: shippingMethod,
      freeShippingThreshold: settings.freeShippingThreshold,
      isFreeShipping: shippingFee === 0 && shippingMethod !== 'express',
    },
    timestamp: new Date().toISOString(),
  };
}
