import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'npm:sequelize-typescript';
import { Category } from './Category.ts';
import { Wallet } from './Wallet.ts';

@Table({ tableName: "expenses" })
export class Expense extends Model{

    @Column({ allowNull: false })
    declare name!: string;

    @Column({ allowNull: false })
    declare amount!: number;

    @Column({ allowNull: false })
    declare date!: Date;

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

    @BelongsTo(() => Category, { foreignKey: 'sourceCategoryId', as: 'sourceCategory' })
    declare sourceCategory: Category;

    @BelongsTo(() => Category, { foreignKey: 'targetCategoryId', as: 'targetCategory' })
    declare targetCategory: Category;
}
