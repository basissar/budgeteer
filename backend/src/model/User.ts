import { Account } from "./Account.ts";
import {
    Table,
    Column,
    Model,
    HasMany,
    PrimaryKey,
    DataType,
    HasOne
} from 'npm:sequelize-typescript'
import { Wallet } from "./Wallet.ts";

@Table({tableName: "users"})
export class User extends Model {

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare public id;

    @Column({allowNull: false, unique: true})
    declare username: string;

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

    @HasMany(() => Wallet)
    public wallets!: Wallet[];

    // @HasOne(() => Account)
    // declare account: Account;

}
  