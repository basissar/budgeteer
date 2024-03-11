import {
    Table,
    Column,
    Model,
    HasMany
} from 'npm:sequelize-typescript'
import { Wallet } from "./Wallet.ts";

@Table({tableName: "users"})
export class User extends Model{

    @Column({allowNull: false, unique: true})
    declare public username: string;

    @HasMany(() => Wallet)
    public wallets!: Wallet[];

}