import { Column, ForeignKey, Model, Table, BelongsTo, DataType } from "npm:sequelize-typescript";
import {Category} from "./Category.ts";
import { Wallet } from "./Wallet.ts";


@Table({tableName: "budgets", createdAt: false, updatedAt: false})
export class Budget extends Model {
    
    @Column({ allowNull: false , type: DataType.DOUBLE})
    declare limit: number;

    @Column({ allowNull: false , type: DataType.DOUBLE})
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

    @Column({allowNull: false})
    declare name: string;

    @BelongsTo(() => Category, { foreignKey: 'categoryId', as: 'category' })
    declare category: Category;

}
