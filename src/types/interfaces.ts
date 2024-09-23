export type CycleType = 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';

<<<<<<< HEAD
export interface BackupModuleProps {
=======
export interface MongoProps {
>>>>>>> 6a1eabf (Multi Provider Support)
    url: string;
    location?: string;
    cycle: CycleType;
    maximumBackup: number;
    readable?: boolean;
}
<<<<<<< HEAD
=======
export interface JsonProps {
    path: string;
    location?: string;
    cycle: CycleType;
    maximumBackup: number;
    readable?: boolean;
}

export interface BackupClientProps {
  provider: MongoProps | JsonProps,
  useCache?: boolean
}
>>>>>>> 6a1eabf (Multi Provider Support)

export interface LocalizeProps {
    this: any;
    cycle: CycleType;
}