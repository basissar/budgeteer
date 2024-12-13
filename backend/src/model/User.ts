import {
    Table,
    Column,
    Model,
    HasMany,
    PrimaryKey,
    DataType,
    HasOne,
    BelongsToMany
} from 'npm:sequelize-typescript'
import { Wallet } from "./Wallet.ts";
import { Account } from "./Account.ts";
import {IsEmail} from "sequelize-typescript";

@Table({tableName: "users", createdAt: false, updatedAt: false})
export class User extends Model {

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare public id;

    @Column({allowNull: false, unique: true})
    declare username: string;

    @IsEmail
    @Column({allowNull: true, unique: true})
    declare email: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare oauthProvider: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare oauthId: string;

    @Column({ allowNull: true }) // Allow null if registered via OAuth2
    declare password: string;  
    
    @Column({allowNull: false})
    declare timezone: string;

    @Column({allowNull: true})
    declare deletedAt: Date;

    @HasMany(() => Wallet, { onDelete: 'CASCADE' })
    public wallets!: Wallet[];
}
  