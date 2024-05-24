import { RepositoryError } from "../errors/RepositoryError.ts";
import { Item } from "../model/Item.ts";
import { ItemAvatar } from "../model/ItemAvatar.ts";
import { ItemEquipped } from "../model/ItemEquipped.ts";
import { ItemOwned } from "../model/ItemOwned.ts";
import { BaseRepository } from "./baseRepository.ts";

export class ItemRepository implements BaseRepository<Item, number> {
    
    async save(item: Item): Promise<Item | null> {
        try {
            const result = await item.save();

            return result;
        } catch (err){
            throw new RepositoryError(`Item repository error: ${err.message}`);
        }
    }

    async findAll(): Promise<Item[] | null> {
        return await Item.findAll();
    }

    async findById(id: number): Promise<Item | null> {
        return await Item.findByPk(id);
    }

    //No need for the following CRUD operations
    async deleteById(id: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async exists(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async existsByName(name: string) {
        const result = await Item.findOne({
            where: {
                name: name
            }
        });

        return !!result;
    }

    async findByAvatar(avatarId: number) {
        return await Item.findAll({
            where: {
                avatarId: avatarId
            }
        });
    }
}
