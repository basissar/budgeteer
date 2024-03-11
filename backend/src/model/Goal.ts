
// export interface Goal {
//     id: bigint;
//     targetAmount: number;
//     currentAmount: number;
//     deadline: Date;
//     userId: bigint
// }

import { Table, Model, Column, ForeignKey } from "npm:sequelize-typescript";
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