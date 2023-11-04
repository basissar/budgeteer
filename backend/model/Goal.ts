
export interface Goal {
    id: bigint;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    userId: bigint
}
