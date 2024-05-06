import { Table, Column, Model, ForeignKey, DataType } from 'npm:sequelize-typescript';
import { User } from "./User.ts";
import { Wallet } from "./Wallet.ts";

@Table({ tableName: "categories" })
export class Category extends Model {

    @Column({ allowNull: false, type: DataType.STRING })
    declare name!: string;

    @Column({ allowNull: false })
    declare color!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: true,
        type: DataType.UUID
    })
    declare userId?: string;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: true,
        type: DataType.UUID
    })
    declare walletId?: string;
}
