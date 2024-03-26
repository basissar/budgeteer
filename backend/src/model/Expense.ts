import { Table, Column, Model, ForeignKey, DataType } from 'npm:sequelize-typescript';
import { Category } from './Category.ts';
import { Wallet } from './Wallet.ts';

@Table({ tableName: "expenses" })
export class Expense extends Model{

    @Column({ allowNull: false })
    public name!: string;

    @Column({ allowNull: false })
    public amount!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: false })
    public sourceCategoryId!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: false })
    public targetCategoryId!: number;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID,
        onDelete: 'CASCADE'
    })
    public walletId!: string;
}
