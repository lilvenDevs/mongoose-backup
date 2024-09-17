const { MongooseBackup } = require("../dist");
require("dotenv").config();

const Backup = new MongooseBackup({
  url: process.env.TEST_URL || '', // Your MongoDB URL
  location: "Europe/Istanbul", // Timezone location default is Europe/Istanbul
  cycle: 'minutes', // minutes, hours, daily, weekly, monthly, yearly
  maximumBackup: 5, // If you want to delete old backups, set this to a number. Default is Infinity.
  readable: true, // If you want to readable backup files, set this to true. Default is false.
});

Backup.on('connected', (data) => {
   console.log(`[MongooseBackup]: Connected to ${data.url}!`);
   Backup.Start(); 
});

Backup.on("started", (data) => {
    console.log(`[MongooseBackup]: Backup started at ${data.time}`);
});

Backup.on("backupError", (message) => {
    console.log(message);
});

Backup.on("ping", (data) => {
    console.log(`[MongooseBackup]: Backup is alive. Location: ${data.location} Url: ${data.url}, Time: ${data.time}`);
});

Backup.on("backupDone", (data) => {
    console.log(`${data.time} [MongooseBackup]: Total ${data.total} documents with ${data.items} items backed up.`);
});

Backup.on("backupCleaning", (data) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message} Location: ${data.location}, Total: ${data.total}, Items: ${data.items}`);
});

Backup.on("backupCleaningError", (data) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message} Location: ${data.location}, Total: ${data.total}, Items: ${data.items}`);
});