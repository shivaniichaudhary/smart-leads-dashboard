import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    // Force spin up our virtual memory database instantly, ignoring any internet strings
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`Virtual Dev MongoDB Connected Successfully!`);
  } catch (error) {
    console.error(`Database Connection Error: ${error}`);
    process.exit(1);
  }
};