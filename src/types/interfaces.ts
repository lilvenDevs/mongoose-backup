export type CycleType = 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface BackupModuleProps {
    url: string;
    location?: string;
    cycle: CycleType;
    maximumBackup: number;
    readable?: boolean;
}

export interface LocalizeProps {
    this: any;
    cycle: CycleType;
}