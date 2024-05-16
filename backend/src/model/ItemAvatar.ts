import { Table, Model, ForeignKey, Column} from "npm:sequelize-typescript";
import { Item } from "./Item.ts";
import { Avatar } from "./Avatar.ts";


@Table({tableName: "itemAvatars"})
export class ItemAvatar extends Model {

    @ForeignKey(() => Item)
    @Column({allowNull: false})
    declare itemId: number;

    @ForeignKey(() => Avatar)
    @Column({allowNull: false})
    declare avatarId: number;

}