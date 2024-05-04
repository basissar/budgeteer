import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'npm:sequelize-typescript';
import { User } from "./User.ts";
import { Wallet } from "./Wallet.ts";

@Table({ tableName: "categories" })
export class Category extends Model {

    @Column({ allowNull: false, type: DataType.STRING })
    name!: string;

    @Column({ allowNull: false })
    color!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: true,
        type: DataType.UUID
    })
    userId?: string;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: true,
        type: DataType.UUID
    })
    walletId?: string;

}