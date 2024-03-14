import { Column } from "../config/deps.ts";
import { Model, Table } from "../config/deps.ts";
import {Avatar} from "./Avatar.ts";
import {ItemRarity} from "./ItemRarity.ts";

/*
export interface Item {
    id: number;
    name: string;
    rarity: ItemRarity;
    avatar: Avatar;
}
*/


@Table({tableName: "items"})
export class Item extends Model {

    @Column({allowNull: false})
    public name!: string;

    @Column({allowNull: false})
    public rarity!: ItemRarity;

    @Column({allowNull: false})
    public avatar!: Avatar;
}