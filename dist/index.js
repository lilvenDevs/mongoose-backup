var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MongooseBackup: () => BackupModule
});
module.exports = __toCommonJS(src_exports);

// src/lib/index.ts
var import_mongoose = __toESM(require("mongoose"));
var import_events = require("events");

// src/methods/Localize.ts
var import_cron = require("cron");

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
var import_fs = require("fs");
async function MethodLocalize() {
  const { cycle } = this;
  if (cycle && typeof cycle !== "string") throw new Error("Cycle is not a string!");
  if (!isCycleType(cycle)) throw new Error("Cycle is not a valid type!");
  if (!this.connected) return this.emit("backupError", "You must connect to database first!");
  this.emit("started", {
    message: "Backup started.",
    time: this.formatter.format(/* @__PURE__ */ new Date())
  });
  const documents = await this.getDocuments();
  const job = new import_cron.CronJob(
    times_config_default[cycle],
    async () => {
      if (!documents.length) return;
      const backupDir = "./.backup";
      if (!(0, import_fs.existsSync)(backupDir)) {
        (0, import_fs.mkdirSync)(backupDir);
      }
      const ddmmyyyy = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { timeZone: this.location }).replace(/\//g, "-");
      const hhmmss = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { timeZone: this.location }).replace(/:/g, "-");
      const fileName = `${ddmmyyyy}_${hhmmss}`;
      for (const document of documents) {
        const doc = await this.getDocument(document.name);
        const documentDir = `${backupDir}/${fileName}`;
        if (!(0, import_fs.existsSync)(documentDir)) {
          (0, import_fs.mkdirSync)(documentDir);
        }
        const writeFileOptions = this.readable ? JSON.stringify(doc, null, 4) : JSON.stringify(doc);
        (0, import_fs.writeFileSync)(`${documentDir}/${document.name}.json`, writeFileOptions);
      }
      const dirs = (0, import_fs.readdirSync)(backupDir);
      const dirDates = dirs.map((dir) => {
        const [datePart, timePart] = dir.split("_");
        const [day, month, year] = datePart.split("-");
        const [hour, minute, second] = timePart.split("-");
        const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        return { dir, time: new Date(isoDate).getTime() };
      });
      const sortedDirs = dirDates.sort((a, b) => a.time - b.time).map((item) => item.dir);
      if (sortedDirs.length > this.maximumBackup) {
        const dirsToDelete = sortedDirs.slice(0, sortedDirs.length - this.maximumBackup);
        this.emit("backupCleaning", {
          message: `Backup is deleting ${dirsToDelete.length} directories.`,
          time: this.formatter.format(/* @__PURE__ */ new Date()),
          total: dirsToDelete.length,
          items: dirsToDelete
        });
        for (const dir of dirsToDelete) {
          try {
            (0, import_fs.rmSync)(`${backupDir}/${dir}`, { recursive: true, force: true });
          } catch (err) {
            this.emit("backupCleaningError", {
              message: `Backup cleaning error on ${dir}: ${err.message}`,
              time: this.formatter.format(/* @__PURE__ */ new Date())
            });
          }
        }
      }
      this.emit("backupDone", {
        message: `Backup is done.`,
        time: this.formatter.format(/* @__PURE__ */ new Date()),
        total: documents.length,
        items: documents.length
      });
    },
    null,
    true,
    this.location
  );
  job.start();
}
function isCycleType(cycle) {
  return true;
}

// src/lib/index.ts
var BackupModule = class extends import_events.EventEmitter {
  connected = false;
  url;
  location;
  cycle;
  maximumBackup;
  readable;
  formatter;
  getDocuments;
  getDocument;
  constructor({ url, location = "Europe/Istanbul", cycle, maximumBackup, readable = false }) {
    super();
    if (typeof url !== "string") throw new Error("url is not defined or not a string!");
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
      second: "2-digit"
    });
    this.connectToDatabase();
    this.getDocuments = async () => {
      return import_mongoose.default.connection.db.listCollections().toArray();
    };
    this.getDocument = async (name) => {
      return import_mongoose.default.connection.db.collection(name).find().toArray();
    };
  }
  async connectToDatabase() {
    try {
      await import_mongoose.default.connect(this.url);
      this.connected = true;
      this.emit("connected", { url: this.url, location: this.location });
      setInterval(() => {
        this.emit("ping", {
          message: "Mongoose Backup is alive.",
          location: this.location,
          url: this.url,
          time: this.formatter.format(/* @__PURE__ */ new Date())
        });
      }, 6e4);
    } catch (err) {
      this.connected = false;
      throw new Error(err);
    }
    import_mongoose.default.connection.on("error", (err) => {
      this.connected = false;
      throw new Error(err);
    });
  }
  async Start() {
    return MethodLocalize.call(this);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongooseBackup
});
