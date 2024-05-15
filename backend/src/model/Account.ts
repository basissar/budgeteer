import {
    Table,
    Column,
    Model,
    HasMany,
    PrimaryKey,
    DataType,
    BelongsTo,
    ForeignKey
} from 'npm:sequelize-typescript';
import { User } from "./User.ts";
import { Avatar } from "./Avatar.ts";

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

    @BelongsTo(() => User)
    declare user: User;
}