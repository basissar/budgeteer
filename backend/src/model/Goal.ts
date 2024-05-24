import { Column, ForeignKey, Model, Table, BelongsTo, DataType } from "npm:sequelize-typescript";
import { Wallet } from './Wallet.ts'
import { Category } from "./Category.ts";

@Table({tableName: "goals", createdAt: false, updatedAt: false})
export class Goal extends Model{

    @Column({allowNull: false})
    declare name: string;

    @Column({ allowNull: false , type: DataType.DOUBLE})
    declare targetAmount: number;

    @Column({ allowNull: false , type: DataType.DOUBLE})
    declare currentAmount: number;

    @Column({allowNull: false, defaultValue: false})
    declare completed: boolean;

    @ForeignKey(() => Category)
    @Column({allowNull: false})
    declare categoryId: number;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID,
        onDelete: 'CASCADE'
    })
    declare walletId: string;

    @BelongsTo(() => Category, { foreignKey: 'categoryId', as: 'category' })
    declare category: Category;
}