

import { Column } from "npm:sequelize-typescript";
import { Table, Model} from "../config/deps.ts";

@Table({tableName: "avatars"})
export class Avatar extends Model{

    @Column({allowNull: false})
    public name!: string;

    @Column({allowNull: false})
    public description!: string;

}

