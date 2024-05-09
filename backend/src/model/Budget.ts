import { Column, ForeignKey, Model, Table, BelongsTo, DataType } from "npm:sequelize-typescript";
import {Recurrence} from "./Recurrence.ts";
import {Category} from "./Category.ts";
import { Wallet } from "./Wallet.ts";


@Table({tableName: "budgets"})
export class Budget extends Model {
    
    @Column({allowNull: false})
    declare limit: number;

    @Column({allowNull: false})
    declare currentAmount: number;

    @Column({ allowNull: false })
    declare recurrence: string;

    @ForeignKey(() => Category)
    @Column({allowNull: false})
    declare categoryId: number;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: false,
        type: DataType.UUID
    })
    declare walletId: string;
    // public wallet?: Wallet;

    @Column({allowNull: false})
    declare name: string;

    @BelongsTo(() => Category, { foreignKey: 'categoryId', as: 'category' })
    declare category: Category;

}
