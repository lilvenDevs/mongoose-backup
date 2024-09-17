import mongoose from "mongoose";
import { EventEmitter } from "events";
import { BackupModuleProps, CycleType } from "../types/interfaces";
import { isCycleType, MethodLocalize } from "../methods/Localize";

export class BackupModule extends EventEmitter {
  connected: boolean;
  url: string;
  location?: string;
  cycle: CycleType;
  maximumBackup: number;
  readable?: boolean;
  getDocuments: Function;
  getDocument: Function;
  constructor({
    url,
    location = "Europe/Istanbul",
    cycle,
    maximumBackup,
    readable = false,
  }: BackupModuleProps) {
    super();

    if (!url || typeof url !== "string") throw new Error("url is not defined or not a string!");
    if (location && typeof location !== "string") throw new Error("location is not a string!");
    if (!maximumBackup || typeof maximumBackup !== "number") throw new Error("maximumBackup is not defined or not a number!");
    if (!cycle || typeof cycle !== "string") throw new Error("cycle is not defined or not a string!");
    if (!isCycleType(cycle)) throw new Error("cycle is not a valid type!");
    if(typeof readable !== "boolean") throw new Error("readable is not a boolean!");

    if (!url || !cycle || !maximumBackup) throw new Error("You must define url, cycle and maximumBackup!");

    this.connected = false;
    this.url = url;
    this.location = location || "Europe/Istanbul";
    this.maximumBackup = maximumBackup || Infinity;
    this.cycle = cycle;
    this.readable = readable;

    mongoose.connect(this.url).catch((err) => {
      this.connected = false;
      throw new Error(err);
    });

    mongoose.connection.on("error", (err) => {
      this.connected = false;
      throw new Error(err);
    });

    mongoose.connection.on("connected", () => {
      this.emit("connected", { url, location });
      setInterval(() => {
        this.emit("ping", {
          message: "Mongoose Backup is alive.",
          location: this.location || "Europe/Istanbul",
          url: this.url || "Empty",
          time: new Date(),
        });
      }, 60000);
    });

    this.on("connected", () => {
      this.connected = true;
    });

    this.getDocuments = () => {
      return mongoose.connection.db.listCollections().toArray();
    };

    this.getDocument = (name: string) => {
      return mongoose.connection.db.collection(name).find().toArray();
    };

    return this;
  }

  async Start() {
    return MethodLocalize.call(this);
  }
}
