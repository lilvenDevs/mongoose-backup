import { CronJob } from "cron";
import { LocalizeProps, CycleType } from "../types/interfaces";
import timesConfig from "./times.config.json";
import {existsSync, mkdirSync, readdirSync, writeFileSync, rm } from "fs";

export async function MethodLocalize(this: any) {
  const { cycle }: LocalizeProps = this;
  
  if (cycle && typeof cycle !== "string") throw new Error("Cycle is not a string!");
  if (!isCycleType(cycle)) throw new Error("Cycle is not a valid type!");
  try {
    if (!this.connected) return this.emit("backupError", "You must connect to database first!");

    this.emit("started", {
      message: "Backup started.",
      time: new Date(),
    });

    const documents = await this.getDocuments();
    const job = new CronJob(timesConfig[cycle], async () => {
      if(!documents.length) return;
      documents.forEach(async (document: any, index: number) => {
        const doc = await this.getDocument(document.name);
        const fileName = `${new Date().toLocaleDateString().replace(/\//g, "-")}_${new Date().toLocaleTimeString().replace(/:/g, "-")}`;

        let startMs = new Date().getTime();

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
            const getFullDate = (date: string) => {
              let _date = a.split("_")[0].replace(/-/g, " ");
              let _time = a.split("_")[1].replace(/-/g, ":");
              return new Date(`${_date} ${_time}`).getTime();
            };

            return getFullDate(b) - getFullDate(a);
          });

          dirs.forEach((dir, index) => {
            if (index == backupDirLength - 1) {
              this.emit("backupCleaning", {
                message: `Backup is deleting ${backupDirLength - this.maximumBackup} directory.`,
                time: new Date(),
                total: backupDirLength - this.maximumBackup,
                items: dirs.slice(this.maximumBackup),
              });
            } else {
              let files = readdirSync(`./.backup/${dir}`);
              if (files.length) {
                rm(`./.backup/${dir}`, { recursive: true, force: true }, (err) => {
                    if (err) {
                      this.emit("backupCleaningError", {
                        message: `Backup cleaning error on ${dir}: ${err.message}`,
                        time: new Date(),
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
            message: `Backup is done in ${new Date().getTime() - startMs}ms.`,
            time: new Date(),
            total: documents.length,
            items: doc.length,
          });
        }
      });
    }, null, true, this.location);

    job.start();
  } catch (error) {
    throw new Error(error);
  }
}

export function isCycleType(cycle: any): cycle is CycleType {
  return true;
}
