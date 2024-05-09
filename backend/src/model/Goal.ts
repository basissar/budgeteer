import { DataType } from "npm:sequelize-typescript";
import { Table, Model, Column, ForeignKey } from "../config/deps.ts";
import { Wallet } from './Wallet.ts'

@Table({tableName: "goals"})
export class Goal extends Model{

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: false})
    declare targetAmount: number;

    @Column({allowNull: false})
    declare currentAmount: number;

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