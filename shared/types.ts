// types.ts
export interface HiringTeam {
    name: string;
    title: string;
    connection: string;
    messageUrl?: string; // Optional field, might be undefined if not present
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    timePosted: string;
    applicants: number;
    workType: string[];
    easyApply: boolean;
    logo?: string;
    description?: string;
    applyUrl?: string;
    hiringTeam?: HiringTeam | null; // Optional field that can be null or contain the hiring team info
}

export interface BasicJobInfo {
    id: string;
    title: string;
    url: string;
    company: string;
    location: string;
    timePosted: string;
}
