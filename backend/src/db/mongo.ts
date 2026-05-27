import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI || "";

let client: MongoClient;
let db: Db;

export async function getMongoDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  // Use stock_service database directly
  db = client.db("stock_service");
  console.log("✅ MongoDB connected: stock_service");
  return db;
}