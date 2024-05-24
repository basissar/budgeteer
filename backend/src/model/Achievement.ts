import { Column, Table, Model, ForeignKey } from "../config/deps.ts";
import { Category } from "./Category.ts";

@Table({tableName: "achievements", createdAt: false, updatedAt: false})
export class Achievement extends Model{

    @Column({allowNull: false})
    declare name: string;

    @Column({allowNull: false})
    declare description: string;

    @Column({allowNull: true})
    declare quote: string;

    @Column({allowNull: false})
    declare gainedCredits: number;

    @Column({ allowNull: false })
    declare gainedXp: number;

    @ForeignKey(() => Category)
    @Column({allowNull: true})
    declare categoryId: number;

    @Column({allowNull: true})
    declare targetCount: number;

    @Column({allowNull: false})
    declare type: string;

}
