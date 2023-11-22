
export interface Transaction{
    id: bigint;
    targetWalletId: bigint;
    sourceWalletId: bigint;
    targetCategoryId: bigint;
    sourceCategoryId: bigint;
    amount: number
}
