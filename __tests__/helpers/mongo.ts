import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { start } from "repl";

let mongo: MongoMemoryServer | null = null;

export function withMongo() {
  beforeAll(async () => {
    await startMongo();
  });

  afterEach(async () => {
    await clearMongo();
  });

  afterAll(async () => {
    await stopMongo();
  });
}

export async function startMongo() {
  if (!mongo) {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.MONGO_URI = uri;
    await mongoose.connect(uri);
  }
}

export async function clearMongo() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function stopMongo() {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
