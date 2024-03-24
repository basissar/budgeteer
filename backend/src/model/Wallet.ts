import {
    Table,
    Column,
    Model, ForeignKey, BelongsTo, HasMany, DataType, PrimaryKey
} from "npm:sequelize-typescript";
import { User } from "./User.ts";
import { Budget } from './Budget.ts';
import { Goal } from './Goal.ts';


@Table({tableName:"wallets"})
export class Wallet extends Model{

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare id;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.UUID
    })
    declare public userId: string;

    @Column({allowNull: false})
    declare public name: string;

    @HasMany(() => Budget)
    public budgets?: Budget[];

    @HasMany(() => Goal)
    public goals?: Goal[];
}