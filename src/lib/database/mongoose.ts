import { connect, Mongoose } from 'mongoose';

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const MONGODB_URL: string = process.env.MONGODB_URL;

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');

  cached.promise =
    cached.promise || connect(MONGODB_URL, { db: 'imaginify', bufferCommands: false });

  cached.promise = Promise.resolve(cached.promise);

  return cached.conn;
};
