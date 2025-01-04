import { Table, Column, Model, ForeignKey, DataType, Length, Is } from 'npm:sequelize-typescript';
import { Wallet } from "./Wallet.ts";

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

@Table({ tableName: "categories", createdAt: false, updatedAt: false })
export class Category extends Model {

    @Length({min: 1, max: 15})
    @Column({ allowNull: false, type: DataType.STRING })
    declare name: string;

    @Is('HexColor', (value) => {
        if (!HEX_REGEX.test(value)) {
          throw new Error(`"${value}" is not a hex color value.`);
        }
      })
    @Column({ allowNull: false })
    declare color: string;

    @ForeignKey(() => Wallet)
    @Column({
        allowNull: true,
        type: DataType.UUID
    })
    declare walletId?: string;

    @Column({allowNull: true})
    declare iconId?: number;
}
