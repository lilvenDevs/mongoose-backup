import { EventEmitter } from 'events';

type CycleType = 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';
interface BackupModuleProps {
    url: string;
    location?: string;
    cycle: CycleType;
    maximumBackup: number;
    readable?: boolean;
}

declare class BackupModule extends EventEmitter {
    connected: boolean;
    url: string;
    location?: string;
    cycle: CycleType;
    maximumBackup: number;
    readable?: boolean;
    getDocuments: Function;
    getDocument: Function;
    constructor({ url, location, cycle, maximumBackup, readable, }: BackupModuleProps);
    Start(): Promise<any>;
}

interface Events {
    message: string;
    location: string;
    url: string;
    time: Date;
    total: number;
    items: Array<any>;
}

export { type Events as EventInterface, BackupModule as MongooseBackup };
