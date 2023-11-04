import {Recurrence} from "./Recurrence.ts";


export interface Budget {
    id: bigint;
    limit: number;
    currentAmount: number;
    recurrence: Recurrence;
    categoryId: bigint;
    userId: bigint;
    name: string;
}


