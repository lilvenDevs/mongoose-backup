// src/lib/index.ts
import mongoose from "mongoose";
import { EventEmitter } from "events";

// src/methods/Localize.ts
import { CronJob } from "cron";

// src/methods/times.config.json
var times_config_default = {
  minutes: "* * * * *",
  hours: "0 * * * *",
  daily: "0 1 * * *",
  weekly: "0 0 * * 0",
  monthly: "0 0 1 * *",
  yearly: "0 0 1 1 *"
};

// src/methods/Localize.ts
import { existsSync, mkdirSync, readdirSync, writeFileSync, rm } from "fs";
async function MethodLocalize() {
  const { cycle } = this;
  if (cycle && typeof cycle !== "string") throw new Error("Cycle is not a string!");
  if (!isCycleType(cycle)) throw new Error("Cycle is not a valid type!");
  try {
    if (!this.connected) return this.emit("backupError", "You must connect to database first!");
    this.emit("started", {
      message: "Backup started.",
      time: /* @__PURE__ */ new Date()
    });
    const documents = await this.getDocuments();
    const job = new CronJob(times_config_default[cycle], async () => {
      if (!documents.length) return;
      documents.forEach(async (document, index) => {
        const doc = await this.getDocument(document.name);
        const fileName = `${(/* @__PURE__ */ new Date()).toLocaleDateString().replace(/\//g, "-")}_${(/* @__PURE__ */ new Date()).toLocaleTimeString().replace(/:/g, "-")}`;
        let startMs = (/* @__PURE__ */ new Date()).getTime();
        if (!existsSync(`./.backup`)) {
          mkdirSync(`./.backup`);
        }
        if (!existsSync(`./.backup/${fileName}`)) {
          mkdirSync(`./.backup/${fileName}`);
        }
        let writeFileOptions = this.readable ? JSON.stringify(doc, null, 4) : JSON.stringify(doc);
        writeFileSync(`./.backup/${fileName}/${document.name}.json`, writeFileOptions);
        let dirs = readdirSync(`./.backup`);
        let backupDirLength = dirs.length;
        if (backupDirLength > this.maximumBackup) {
          dirs = dirs.sort((a, b) => {
            const getFullDate = (date) => {
              let _date = a.split("_")[0].replace(/-/g, " ");
              let _time = a.split("_")[1].replace(/-/g, ":");
              return (/* @__PURE__ */ new Date(`${_date} ${_time}`)).getTime();
            };
            return getFullDate(b) - getFullDate(a);
          });
          dirs.forEach((dir, index2) => {
            if (index2 == backupDirLength - 1) {
              this.emit("backupCleaning", {
                message: `Backup is deleting ${backupDirLength - this.maximumBackup} directory.`,
                time: /* @__PURE__ */ new Date(),
                total: backupDirLength - this.maximumBackup,
                items: dirs.slice(this.maximumBackup)
              });
            } else {
              let files = readdirSync(`./.backup/${dir}`);
              if (files.length) {
                rm(
                  `./.backup/${dir}`,
                  { recursive: true, force: true },
                  (err) => {
                    if (err) {
                      this.emit("backupCleaningError", {
                        message: `Backup cleaning error on ${dir}: ${err.message}`,
                        time: /* @__PURE__ */ new Date()
                      });
                    }
                  }
                );
              }
            }
          });
        }
        if (index === documents.length - 1) {
          this.emit("backupDone", {
            message: `Backup is done in ${(/* @__PURE__ */ new Date()).getTime() - startMs}ms.`,
            time: /* @__PURE__ */ new Date(),
            total: documents.length,
            items: doc.length
          });
        }
      });
    }, null, true, this.location);
    job.start();
  } catch (error) {
    throw new Error(error);
  }
}
function isCycleType(cycle) {
  return true;
}

// src/lib/index.ts
var BackupModule = class extends EventEmitter {
  connected;
  url;
  location;
  cycle;
  maximumBackup;
  readable;
  getDocuments;
  getDocument;
  constructor({
    url,
    location = "Europe/Istanbul",
    cycle,
    maximumBackup,
    readable = false
  }) {
    super();
    if (!url || typeof url !== "string") throw new Error("url is not defined or not a string!");
    if (location && typeof location !== "string") throw new Error("location is not a string!");
    if (!maximumBackup || typeof maximumBackup !== "number") throw new Error("maximumBackup is not defined or not a number!");
    if (!cycle || typeof cycle !== "string") throw new Error("cycle is not defined or not a string!");
    if (!isCycleType(cycle)) throw new Error("cycle is not a valid type!");
    if (typeof readable !== "boolean") throw new Error("readable is not a boolean!");
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
          time: /* @__PURE__ */ new Date()
        });
      }, 6e4);
    });
    this.on("connected", () => {
      this.connected = true;
    });
    this.getDocuments = () => {
      return mongoose.connection.db.listCollections().toArray();
    };
    this.getDocument = (name) => {
      return mongoose.connection.db.collection(name).find().toArray();
    };
    return this;
  }
  async Start() {
    return MethodLocalize.call(this);
  }
};
export {
  BackupModule as MongooseBackup
};
