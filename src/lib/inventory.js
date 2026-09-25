import { ObjectId } from 'mongodb';

/**
 * Atomically deducts inventory for an array of items with footwear size tracking.
 * If any product/size has insufficient stock, reverts any deductions made in the current batch
 * and throws a descriptive Error.
 *
 * @param {import('mongodb').Db} db
 * @param {Array<{ productId: string, size: string, quantity: number, name?: string }>} items
 * @returns {Promise<Array<{ productId: string, size: string, quantity: number }>>} deducted items
 */
export async function deductInventory(db, items) {
  if (!items || !items.length) return [];

  const deductedLog = [];

  try {
    for (const item of items) {
      const rawId = item.productId || item.id;
      const sizeStr = item.size ? String(item.size).trim() : null;
      const qty = parseInt(item.quantity || item.qty || 1, 10);

      if (!rawId || !sizeStr || qty <= 0) {
        throw new Error(`Invalid item specification for inventory deduction: ${JSON.stringify(item)}`);
      }

      // Build product filter
      const idFilter = ObjectId.isValid(rawId)
        ? { $or: [{ _id: new ObjectId(rawId) }, { id: String(rawId) }] }
        : { id: String(rawId) };

      // Filter requires stock to be at least qty
      // Checks sizeStock.<sizeStr> >= qty OR (if sizeStock doesn't exist, checks stockQty >= qty)
      const query = {
        ...idFilter,
        $or: [
          { [`sizeStock.${sizeStr}`]: { $gte: qty } },
          { sizeStock: { $exists: false }, stockQty: { $gte: qty } }
        ]
      };

      const update = {
        $inc: {
          [`sizeStock.${sizeStr}`]: -qty,
          stockQty: -qty
        }
      };

      const result = await db.collection('products').updateOne(query, update);

      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        // Stock deduction failed — out of stock or size not found
        throw new Error(
          `Insufficient stock for "${item.name || rawId}" in Size UK ${sizeStr}. Quantity requested: ${qty}.`
        );
      }

      deductedLog.push({ productId: rawId, size: sizeStr, quantity: qty });
    }

    return deductedLog;
  } catch (error) {
    // Rollback any successfully deducted items in this transaction/batch
    if (deductedLog.length > 0) {
      console.warn('Rolling back inventory deductions due to failure:', error.message);
      await restoreInventory(db, deductedLog);
    }
    throw error;
  }
}

/**
 * Restores inventory for items (e.g., cancelled orders, failed payments, or return processing).
 *
 * @param {import('mongodb').Db} db
 * @param {Array<{ productId: string, size: string, quantity: number }>} items
 */
export async function restoreInventory(db, items) {
  if (!items || !items.length) return;

  for (const item of items) {
    try {
      const rawId = item.productId || item.id;
      const sizeStr = item.size ? String(item.size).trim() : null;
      const qty = parseInt(item.quantity || item.qty || 1, 10);

      if (!rawId || qty <= 0) continue;

      const idFilter = ObjectId.isValid(rawId)
        ? { $or: [{ _id: new ObjectId(rawId) }, { id: String(rawId) }] }
        : { id: String(rawId) };

      const update = {
        $inc: {
          stockQty: qty
        }
      };

      if (sizeStr) {
        update.$inc[`sizeStock.${sizeStr}`] = qty;
      }

      await db.collection('products').updateOne(idFilter, update);
    } catch (err) {
      console.error(`Failed to restore inventory for item ${item.productId}:`, err.message);
    }
  }
}
