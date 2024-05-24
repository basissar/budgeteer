import { BelongsToMany } from "npm:sequelize-typescript";
import { Column, ForeignKey } from "../config/deps.ts";
import { Model, Table } from "../config/deps.ts";
import {Avatar} from "./Avatar.ts";
import {ItemRarity} from "./ItemRarity.ts";
import { Account } from "./Account.ts";
import { ItemOwned } from "./ItemOwned.ts";
import { ItemAvatar } from "./ItemAvatar.ts";

@Table({tableName: "items", createdAt: false, updatedAt: false})
export class Item extends Model {

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: false})
    declare price: number;

    @Column({allowNull: false})
    declare rarity: string;

    @Column({allowNull: true})
    declare type: string;

    @ForeignKey(() => Avatar)
    @Column({allowNull: false})
    declare avatarId: number;

    @Column({allowNull: false})
    declare item_img: string;

    @BelongsToMany(() => Account, () => ItemOwned)
    declare accounts: Account[]

    /**
     * avatarId only if we expect item to belong to one Avatar only
     * list of Avatars if we expect that more Avatars can be customized with the same Item
     */
    @BelongsToMany(() => Avatar, () => ItemAvatar)
    declare avatars: Avatar[]
}