import { Collection, Db, MongoClient, WithId } from "mongodb";
import { CompleteableFuture } from "../futures/CompletableFuture";
import { Singleton } from "src/container/Singleton";

@Singleton
export default class MongoConnector {
    private database: CompleteableFuture<Db>;

    public constructor() {
        this.connect()
        this.database = new CompleteableFuture<Db>();
    }

    public async connect(): Promise<void> {
        const uri = process.env.DB_CONN_STRING;

        if (!uri) {
            throw new Error("MongoDB URI is not defined in environment variables.");
        }

        const client = new MongoClient(uri);
        try {
            await client.connect();
            this.database.complete(client.db(process.env.DB_NAME));
            console.log("Connected to MongoDB successfully.");
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            throw error;
        }

        if (!this.database) {
            throw new Error("Failed to select the database.");
        }

        process.on('SIGINT', async () => {
            await client.close();
            process.exit(0);
        });
    }

    public getDatabase(): CompleteableFuture<Db> {
        return this.database;
    }
}