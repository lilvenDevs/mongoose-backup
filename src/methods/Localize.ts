import { CronJob } from "cron";
import { LocalizeProps, CycleType } from "../types/interfaces";
import timesConfig from "./times.config.json";
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from "fs";
import { formatDate } from "./formatDate";

<<<<<<< HEAD
export async function MethodLocalize(this: any) {
=======
export async function LocalizeMongo(this: any) {
>>>>>>> 6a1eabf (Multi Provider Support)
  const { cycle }: LocalizeProps = this;

  if (cycle && typeof cycle !== "string") throw new Error("Cycle is not a string!");
  if (!isCycleType(cycle)) throw new Error("Cycle is not a valid type!");

  if (!this.connected) return this.emit("backupError", "You must connect to database first!");

  this.emit("started", {
    message: "Backup started.",
    time: formatDate(new Date()),
  });

  const documents = await this.getDocuments();
  const job = new CronJob(timesConfig[cycle], async () => {
    if (!documents.length) return;

    const backupDir = './.backup';
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir);
    }

    for (const document of documents) {
      const doc = await this.getDocument(document.name);
      const fileName = `${new Date().toLocaleDateString().replace(/\//g, "-")}_${new Date().toLocaleTimeString('en-GB').replace(/:/g, "-")}`;
      const documentDir = `${backupDir}/${fileName}`;

      if (!existsSync(documentDir)) {
        mkdirSync(documentDir);
      }

      const writeFileOptions = this.readable ? JSON.stringify(doc, null, 4) : JSON.stringify(doc);
      writeFileSync(`${documentDir}/${document.name}.json`, writeFileOptions);
    }

    const dirs = readdirSync(backupDir);
    if (dirs.length > this.maximumBackup) {
      const sortedDirs = dirs.sort((a, b) => {
        const getFullDate = (date: string) => {
          const [datePart, timePart] = date.split("_");
          return new Date(`${datePart.replace(/-/g, " ")} ${timePart.replace(/-/g, ":")}`).getTime();
        };
        return getFullDate(b) - getFullDate(a);
      });

      const dirsToDelete = sortedDirs.slice(this.maximumBackup);
      this.emit("backupCleaning", {
        message: `Backup is deleting ${dirsToDelete.length} directories.`,
        time: formatDate(new Date()),
        total: dirsToDelete.length,
        items: dirsToDelete,
      });

      for (const dir of dirsToDelete) {
        try {
          rmSync(`${backupDir}/${dir}`, { recursive: true, force: true });
        } catch (err) {
          this.emit("backupCleaningError", {
            message: `Backup cleaning error on ${dir}: ${err.message}`,
            time: formatDate(new Date()),
          });
        }
      }
    }

    this.emit("backupDone", {
      message: `Backup is done.`,
      time: formatDate(new Date()),
      total: documents.length,
      items: documents.length,
    });
  }, null, true, this.location);

  job.start();
}

export function isCycleType(cycle: any): cycle is CycleType {
  return true;
}
