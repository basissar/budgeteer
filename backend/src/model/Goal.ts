import { Table, Model, Column, ForeignKey } from "../config/deps.ts";
import { Wallet } from './Wallet.ts'

@Table({tableName: "goals"})
export class Goal extends Model{

    @Column({allowNull: false})
    public targetAmount!: number;

    @Column({allowNull: false})
    public currentAmount!: number;

    @Column({allowNull: false})
    public deadline!: Date;

    @ForeignKey(() => Wallet)
    public walletId!: number;

}