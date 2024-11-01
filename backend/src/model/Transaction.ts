
import { Table, Column, Model, ForeignKey, DataType } from 'npm:sequelize-typescript';
import { Category } from './Category.ts';
import { Wallet } from './Wallet.ts';

@Table({ tableName: "transactions" })
export class Transaction extends Model {

    @ForeignKey(() => Wallet)
    @Column({ allowNull: false })
    public targetWalletId!: number;

    @ForeignKey(() => Wallet)
    @Column({ allowNull: false })
    public sourceWalletId!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: false })
    public targetCategoryId!: number;

    @ForeignKey(() => Category)
    @Column({ allowNull: false })
    public sourceCategoryId!: number;

    @Column({ allowNull: false , type: DataType.DOUBLE})
    public amount!: number;
}

