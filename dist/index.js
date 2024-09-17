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
  try {
    if (!this.connected) return this.emit("backupError", "You must connect to database first!");
    this.emit("started", {
      message: "Backup started.",
      time: /* @__PURE__ */ new Date()
    });
    const documents = await this.getDocuments();
    const job = new import_cron.CronJob(times_config_default[cycle], async () => {
      if (!documents.length) return;
      documents.forEach(async (document, index) => {
        const doc = await this.getDocument(document.name);
        const fileName = `${(/* @__PURE__ */ new Date()).toLocaleDateString().replace(/\//g, "-")}_${(/* @__PURE__ */ new Date()).toLocaleTimeString().replace(/:/g, "-")}`;
        let startMs = (/* @__PURE__ */ new Date()).getTime();
        if (!(0, import_fs.existsSync)(`./.backup`)) {
          (0, import_fs.mkdirSync)(`./.backup`);
        }
        if (!(0, import_fs.existsSync)(`./.backup/${fileName}`)) {
          (0, import_fs.mkdirSync)(`./.backup/${fileName}`);
        }
        let writeFileOptions = this.readable ? JSON.stringify(doc, null, 4) : JSON.stringify(doc);
        (0, import_fs.writeFileSync)(`./.backup/${fileName}/${document.name}.json`, writeFileOptions);
        let dirs = (0, import_fs.readdirSync)(`./.backup`);
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
              let files = (0, import_fs.readdirSync)(`./.backup/${dir}`);
              if (files.length) {
                (0, import_fs.rm)(
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
var BackupModule = class extends import_events.EventEmitter {
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
    import_mongoose.default.connect(this.url).catch((err) => {
      this.connected = false;
      throw new Error(err);
    });
    import_mongoose.default.connection.on("error", (err) => {
      this.connected = false;
      throw new Error(err);
    });
    import_mongoose.default.connection.on("connected", () => {
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
      return import_mongoose.default.connection.db.listCollections().toArray();
    };
    this.getDocument = (name) => {
      return import_mongoose.default.connection.db.collection(name).find().toArray();
    };
    return this;
  }
  async Start() {
    return MethodLocalize.call(this);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongooseBackup
});
