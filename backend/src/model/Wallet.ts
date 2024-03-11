import {
    Table,
    Column,
    Model, ForeignKey, BelongsTo, HasMany
} from "npm:sequelize-typescript";
import { User } from "./User.ts";
import { Budget } from './Budget.ts';
import { Goal } from './Goal.ts';


@Table({tableName:"wallets"})
export class Wallet extends Model{

    @ForeignKey(() => User)
    @Column({allowNull: false})
    public userId!: number;

    @Column({allowNull: false})
    public name!: string;

    @HasMany(() => Budget)
    public budgets?: Budget[];

    @HasMany(() => Goal)
    public goals?: Goal[];
}