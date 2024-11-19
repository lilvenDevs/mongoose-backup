import { CronJob } from "cron";
import { LocalizeProps, CycleType } from "../types/interfaces";
import timesConfig from "./times.config.json";
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync, writeFile } from "fs";

export async function MethodLocalize(this: any) {
    const { cycle }: LocalizeProps = this;

    if (cycle && typeof cycle !== "string") throw new Error("Cycle is not a string!");
    if (!isCycleType(cycle)) throw new Error("Cycle is not a valid type!");

    if (!this.connected) return this.emit("backupError", "You must connect to database first!");

    this.emit("started", {
        message: "Backup started.",
        time: this.formatter.format(new Date()),
    });

    const documents = await this.getDocuments();
    const job = new CronJob(timesConfig[cycle], async () => {
            if (!documents.length) return;

            const backupDir = "./.backup";
            if (!existsSync(backupDir)) {
                mkdirSync(backupDir);
            }
            const ddmmyyyy = new Date().toLocaleDateString("en-GB", { timeZone: this.location }).replace(/\//g, "-"); // dd-mm-yyyy
            const hhmmss = new Date().toLocaleTimeString("en-GB", { timeZone: this.location }).replace(/:/g, "-"); // hh-mm-ss

            const fileName = `${ddmmyyyy}_${hhmmss}`;

            for (const document of documents) {
                const doc = await this.getDocument(document.name);
                const documentDir = `${backupDir}/${fileName}`;

                if (!existsSync(documentDir)) {
                    mkdirSync(documentDir);
                }

                const writeFileOptions = this.readable ? JSON.stringify(doc, null, 4) : JSON.stringify(doc);

                writeFileSync(`${documentDir}/${document.name}.json`, writeFileOptions);
            }

            const dirs = readdirSync(backupDir);

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
                    time: this.formatter.format(new Date()),
                    total: dirsToDelete.length,
                    items: dirsToDelete,
                });

                for (const dir of dirsToDelete) {
                    try {
                        rmSync(`${backupDir}/${dir}`, { recursive: true, force: true });
                    } catch (err) {
                        this.emit("backupCleaningError", {
                            message: `Backup cleaning error on ${dir}: ${err.message}`,
                            time: this.formatter.format(new Date()),
                        });
                    }
                }
            }

            this.emit("backupDone", {
                message: `Backup is done.`,
                time: this.formatter.format(new Date()),
                total: documents.length,
                items: documents.length,
            });
        },
        null,
        true,
        this.location
    );

    job.start();
}

export function isCycleType(cycle: string): cycle is CycleType {
    return true;
}
