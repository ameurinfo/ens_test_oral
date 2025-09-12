
export enum StudentStatus {
    Waiting = 'WAITING',
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
}

export interface Student {
    id: number;
    name: string;
    specialty: string;
    committeeId: number;
    status: StudentStatus;
    queuePosition: number;
    evaluation?: Evaluation;
}

export interface Committee {
    id: number;
    name: string;
    specialty: string;
    members: string[];
}

export interface Criterion {
    id: number;
    name: string;
    maxScore: number;
}

export interface Evaluation {
    scores: { [criterionId: number]: number };
    notes: string;
    finalScore?: number;
}
