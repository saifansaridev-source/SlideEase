import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
// Configure TLS options safely
const options = {};
if (process.env.MONGODB_ALLOW_INVALID_CERTS === 'true') {
  options.tlsAllowInvalidCertificates = true;
}

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the authoritative database instance using configured MONGODB_DB or default.
 */
export async function getDb() {
  const c = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'startupbiz';
  return c.db(dbName);
}

export default clientPromise;
