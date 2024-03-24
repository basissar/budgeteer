import { Column, ForeignKey, Model, Table, BelongsTo, DataType } from "npm:sequelize-typescript";
import {Recurrence} from "./Recurrence.ts";
import {Category} from "./Category.ts";
import { Wallet } from "./Wallet.ts";


@Table({tableName: "budgets"})
export class Budget extends Model {
    
    @Column({allowNull: false})
    public limit!: number;

    @Column({allowNull: false})
    public currentAmount!: number;

    @Column({ allowNull: false })
    public recurrence!: string;

    @ForeignKey(() => Category)
    @Column({allowNull: false})
    public categoryId!: number;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID
    })
    declare public walletId: string;
    // public wallet?: Wallet;

    @Column({allowNull: false})
    public name!: string;

}
