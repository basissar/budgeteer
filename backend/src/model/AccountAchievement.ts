import { Column, ForeignKey, Model, Table, BelongsTo} from "npm:sequelize-typescript";
import { Achievement } from "./Achievement.ts";
import { Account } from "./Account.ts";

@Table({tableName:"accountAchievements", createdAt: false, updatedAt: false})
export class AccountAchievement extends Model{

    @ForeignKey(() => Account)
    @Column({allowNull: false})
    declare accountId: string;

    @ForeignKey(() => Achievement)
    @Column({allowNull: false})
    declare achievementId: number;

    //this might cause issues
    @BelongsTo(() => Achievement)
    declare achievement: Achievement;

    @Column({ allowNull: false })
    declare dateAchieved: Date;

    @Column({allowNull: false, defaultValue: false})
    declare claimed: boolean; 
}