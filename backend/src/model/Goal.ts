import { DataType } from "npm:sequelize-typescript";
import { Table, Model, Column, ForeignKey } from "../config/deps.ts";
import { Wallet } from './Wallet.ts'

@Table({tableName: "goals"})
export class Goal extends Model{

    @Column({allowNull: false})
    declare targetAmount: number;

    @Column({allowNull: false})
    declare currentAmount: number;

    @Column({allowNull: false})
    declare deadline: Date;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID,
        onDelete: 'CASCADE'
    })
    declare walletId: string;

}