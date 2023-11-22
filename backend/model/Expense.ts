
export interface Expense {
    id: bigint;
    name: string;
    amount: number;
    sourceCategoryId: bigint;
    targetCategoryId: bigint;
    walletId: bigint;
}
