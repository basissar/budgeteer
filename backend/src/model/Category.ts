import {Table, Column, Model, ForeignKey, BelongsTo} from 'npm:sequelize-typescript';
import { User } from "./User.ts";
import { Wallet } from "./Wallet.ts";

@Table({tableName: "categories"})
export class Category extends Model {
    
    @Column({ allowNull: false })
    public name!: string;

    @ForeignKey(() => User)
    @Column({ allowNull: true })
    public userId?: number;

    @ForeignKey(() => Wallet)
    @Column({ allowNull: true })
    public walletId?: number;

}