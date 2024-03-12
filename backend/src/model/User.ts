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

    @Column({allowNull: true, unique: true})
    declare public email: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare public oauthProvider: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare public oauthId: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare public password: string;   

    @HasMany(() => Wallet)
    public wallets!: Wallet[];

}