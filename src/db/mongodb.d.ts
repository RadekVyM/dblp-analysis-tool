import 'server-only'
import { MongoClient } from 'mongodb'

declare global {
    var mongoClientPromise: Promise<MongoClient>
}