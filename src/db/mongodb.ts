import 'server-only'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('The MONGODB_URI environment variable is not defined');
}

let cached: { connection: null | typeof mongoose, promise: null | Promise<typeof mongoose> } = { connection: null, promise: null };
const options = {
    bufferCommands: false,
};

async function connectDb() {
    if (process.env.NODE_ENV === 'development') {
        if (cached.connection) {
            return cached.connection;
        }
    
        if (!cached.promise) {
            cached.promise = mongoose.connect(MONGODB_URI!, options);
        }
    
        try {
            return cached.connection = await cached.promise;
        } catch (e) {
            cached.promise = null;
            throw e;
        }
    }
    else {
        try {
            return await mongoose.connect(MONGODB_URI!, options);
        } catch (e) {
            throw e;
        }
    }
}

export default connectDb