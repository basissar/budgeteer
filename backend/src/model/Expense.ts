import { Table, Column, Model, ForeignKey, DataType } from 'npm:sequelize-typescript';
import { Category } from './Category.ts';
import { Wallet } from './Wallet.ts';

@Table({ tableName: "expenses" })
export class Expense extends Model{

    @Column({ allowNull: false })
    declare name!: string;

    @Column({ allowNull: false })
    declare amount!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: true })
    declare sourceCategoryId!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: true })
    declare targetCategoryId!: number;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID,
        onDelete: 'CASCADE'
    })
    declare walletId!: string;
}
