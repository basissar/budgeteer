import {
    Table,
    Column,
    Model,
    HasMany,
    PrimaryKey,
    DataType,
    BelongsTo,
    ForeignKey,
    BelongsToMany
} from 'npm:sequelize-typescript';
import { User } from "./User.ts";
import { Avatar } from "./Avatar.ts";
import { Item } from "./Item.ts";
import { ItemOwned } from "./ItemOwned.ts";
import { ItemAvatar } from "./ItemAvatar.ts";
import { ItemEquipped } from "./ItemEquipped.ts";
import { Achievement } from "./Achievement.ts";
import { AccountAchievement } from "./AccountAchievement.ts";

@Table({tableName: "accounts", createdAt: false, updatedAt: false})
export class Account extends Model {
    
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare public id;
    
    @Column({allowNull: false, type: DataType.DOUBLE})
    declare experience: number;

    @Column({ allowNull: false })
    declare credits: number;

    @Column({allowNull: false, type: DataType.INTEGER})
    declare level: number;

    @ForeignKey(() => User)
    @Column({ allowNull: false, type: DataType.UUID})
    declare userId: string;

    @ForeignKey(() => Avatar)
    declare avatarId: number;

    @Column({allowNull: false, defaultValue: 0})
    declare stayedWithinBudget: number;

    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => Avatar, { foreignKey: 'avatarId', as: 'avatar' })
    declare avatar: Avatar;

    // @BelongsToMany(() => Item, () => ItemAvatar)
    // declare items: Item[]

    @BelongsToMany(() => Item, () => ItemOwned)
    declare ownedItems: Item[];

    @BelongsToMany(() => Item, () => ItemEquipped)
    declare equippedItems: Item[];

    @BelongsToMany(() => Achievement, () => AccountAchievement)
    declare achievements: Achievement[];
}