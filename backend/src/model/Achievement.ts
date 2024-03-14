/*
export interface Achievement {
    id: number;
    name: string;
    description: string;
    quote: string;
    gainedCredits: number;
    gainedXp: number;
}

*/

import { Column, Table, Model } from "../config/deps.ts";

@Table({tableName: "achievements"})
export class Achievement extends Model{

    @Column({allowNull: false})
    public name!: string;

    @Column({allowNull: false})
    public description!: string;

    @Column({allowNull: false})
    public quote!: string;

    @Column({allowNull: false})
    public gainedCredits!: number;

    @Column({ allowNull: false })
    public gainedXp!: number;

}
