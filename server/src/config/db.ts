import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizarena';
    console.log(`Attempting to connect to MongoDB: ${connString}`);
    
    // Try to connect to default/local mongo with a 2-second timeout
    await mongoose.connect(connString, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Failed to connect to local database, starting MongoMemoryServer fallback...`);
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`MongoMemoryServer started at: ${uri}`);
      await mongoose.connect(uri);
      console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
    } catch (memError) {
      console.error(`Failed to start MongoMemoryServer: ${(memError as Error).message}`);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};
