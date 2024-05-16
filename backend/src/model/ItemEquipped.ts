import { Column, ForeignKey, Model, Table } from "../config/deps.ts";
import { Account } from "./Account.ts";
import { Item } from "./Item.ts";

@Table({tableName: "itemEquipped"})
export class ItemEquipped extends Model {

    @ForeignKey(() => Item)
    @Column({allowNull: false})
    declare itemId: number;

    @ForeignKey(() => Account)
    @Column({allowNull: false})
    declare accountId: string;

}