<<<<<<< HEAD
import { MongooseBackup, EventInterface } from "../src/index";
=======
import { MongooseBackup, BackupClient,EventInterface } from "../src/index";
>>>>>>> 6a1eabf (Multi Provider Support)
import "dotenv/config";

const Backup = new MongooseBackup({
  url: process.env.TEST_URL || '', // Your MongoDB URL
  location: "Europe/Istanbul", // Timezone location default is Europe/Istanbul
  cycle: 'minutes', // minutes, hours, daily, weekly, monthly, yearly
  maximumBackup: 3, // If you want to delete old backups, set this to a number. Default is Infinity.
  readable: true, // If you want to readable backup files, set this to true. Default is false.
});
<<<<<<< HEAD
=======
const client = new BackupClient({
  provider:  Backup
})
>>>>>>> 6a1eabf (Multi Provider Support)

Backup.on('connected', (data: EventInterface) => {
   console.log(`[MongooseBackup]: Connected to ${data.url}!`);
   Backup.Start();
});

Backup.on("started", (data: EventInterface) => {
    console.log(`[MongooseBackup]: Backup started at ${data.time}`);
});

Backup.on("backupError", (message: string) => {
    console.log(message);
});

Backup.on("ping", (data: EventInterface) => {
    console.log(`${data.time} [MongooseBackup]: Backup is alive. Location: ${data.location}`);
});

Backup.on("backupDone", (data: EventInterface) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message}`);
});

Backup.on("backupCleaning", (data: EventInterface) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message}, Total: ${data.total}, Items: ${data.items}`);
});

Backup.on("backupCleaningError", (data: EventInterface) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message}`);
});