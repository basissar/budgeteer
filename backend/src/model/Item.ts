import {Avatar} from "./Avatar.ts";
import {ItemRarity} from "./ItemRarity.ts";

export interface Item {
    id: number;
    name: string;
    rarity: ItemRarity;
    avatar: Avatar;
}

