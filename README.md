

# [@lilven/mongoose-backup](https://npmjs.com/package/@lilven/mongoose-backup)
![NPM Downloads](https://img.shields.io/npm/dm/@lilven/mongoose-backup?style=for-the-badge)
![License](https://img.shields.io/npm/l/@lilven/mongoose-backup?style=for-the-badge)

## Installation

Install @lilven/mongoose-backup with npm

```bash
  npm install "@lilven/mongoose-backup"
```

<br>

### Features

- Automatic Backup for MongoDB
- Maximum backups (delete old backups when it reached limit)
- Customizable backup cycles: minutes, hours, daily, weekly, monthly, yearly
- If you want your backups more readable set readable to true

<br>

# Events

| Name  |  Returns |
|---|---|
| connected  | Object: url, location |
| started  | Object: message, time |
| ping  | Object: message, url, location, time |
| backupDone | Object: message, time, total, items |
| backupError  | String |
| backupCleaning  | Object: message, time, total, items |
| backupCleaningError  | Object: message, time |

<br>

### Importing

```js
// CJS
const { MongooseBackup } = require("@lilven/mongoose-backup");
const Backup = new MongooseBackup({
    url: "{mongodb_url}",
    cycle: "minutes",
    location: "Europe/Istanbul" // Timezone location default is Europe/Istanbul
});

// ESM
import { MongooseBackup } from "@lilven/mongoose-backup";
const Backup = new MongooseBackup({
    url: "{mongodb_url}",
    cycle: "minutes",
    location: "Europe/Istanbul" // Timezone location default is Europe/Istanbul
});
```

<br>

# Usage

### Simple Backup Code
```js
// ESM
import { MongooseBackup, EventInterface } from "@lilven/mongoose-backup";
const Backup = new MongooseBackup({
    url: "{mongodb_url}",
    cycle: "minutes",
    location: "Europe/Istanbul" // Timezone location default is Europe/Istanbul
});

Backup.on('connected', () => {
    Backup.start();
});

Backup.on("backupDone", (data: EventInterface) => {
    console.log(`${data.time} [MongooseBackup]: ${data.message}`);
});
```

<br>

### Example File
```js
// ESM
import { MongooseBackup, EventInterface } from "@lilven/mongoose-backup";

const Backup = new MongooseBackup({
  url: "{mongo_url}", // Your MongoDB URL
  location: "Europe/Istanbul", // Timezone location default is Europe/Istanbul
  cycle: 'minutes', // minutes, hours, daily, weekly, monthly, yearly
  maximumBackup: 5, // If you want to delete old backups, set this to a number. Default is Infinity.
  readable: true, // If you want to readable backup files, set this to true. Default is false.
});

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
```

<br>

## Feedback

If you have any feedback, please reach out to us at devs@lilven.com

<br><br><br><br>

---
<h6 align="center">Developed with ❤️ by Lilven Development Team</h6>
