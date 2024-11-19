import mongoose from "mongoose";
import { EventEmitter } from "events";
import { BackupModuleProps, CycleType } from "../types/interfaces";
import { isCycleType, MethodLocalize } from "../methods/Localize";

export class BackupModule extends EventEmitter {
    connected: boolean = false;
    url: string;
    location: string;
    cycle: CycleType;
    maximumBackup: number;
    readable: boolean;
    formatter: Intl.DateTimeFormat;
    getDocuments: () => Promise<any>;
    getDocument: (name: string) => Promise<any[]>;

    constructor({ url, location = "Europe/Istanbul", cycle, maximumBackup, readable = false }: BackupModuleProps) {
        super();

        if (typeof url !== "string")throw new Error("url is not defined or not a string!");
        if (typeof location !== "string") throw new Error("location is not a string!");
        if (typeof maximumBackup !== "number") throw new Error("maximumBackup is not defined or not a number!");
        if (typeof cycle !== "string" || !isCycleType(cycle)) throw new Error("cycle is not defined or not a valid type!");
        if (typeof readable !== "boolean") throw new Error("readable is not a boolean!");

        this.url = url;
        this.location = location;
        this.maximumBackup = maximumBackup;
        this.cycle = cycle;
        this.readable = readable;

        this.formatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: this.location,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        this.connectToDatabase();

        this.getDocuments = async () => {
            return mongoose.connection.db.listCollections().toArray();
        };

        this.getDocument = async (name: string) => {
            return mongoose.connection.db.collection(name).find().toArray();
        };
    }

    private async connectToDatabase() {
        try {
            await mongoose.connect(this.url);
            this.connected = true;
            this.emit("connected", { url: this.url, location: this.location });
            setInterval(() => {
                this.emit("ping", {
                    message: "Mongoose Backup is alive.",
                    location: this.location,
                    url: this.url,
                    time: this.formatter.format(new Date()),
                });
            }, 60000);
        } catch (err) {
            this.connected = false;
            throw new Error(err);
        }

        mongoose.connection.on("error", (err) => {
            this.connected = false;
            throw new Error(err);
        });
    }

    async Start() {
        return MethodLocalize.call(this);
    }
}
