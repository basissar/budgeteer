

import { Column, Table, Model, HasMany, BelongsTo, BelongsToMany} from "npm:sequelize-typescript";
import { Item } from "./Item.ts";
import { ItemAvatar } from "./ItemAvatar.ts";

@Table({tableName: "avatars"})
export class Avatar extends Model{

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: false})
    declare description: string;

    @BelongsToMany(() => Item, () => ItemAvatar)
    declare items: Item[]
}

