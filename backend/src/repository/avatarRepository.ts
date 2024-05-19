import { RepositoryError } from "../errors/RepositoryError.ts";
import { Avatar } from "../model/Avatar.ts";
import { Item } from "../model/Item.ts";
import { BaseRepository } from "./baseRepository.ts";


export class AvatarRepository implements BaseRepository<Avatar, number> {

    async save(avatar: Avatar): Promise<Avatar | null> {
        try {
            const result = await avatar.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Avatar repository error: ${err.message}`);
        }
    }

    async findAll(): Promise<Avatar[] | null> {
        return await Avatar.findAll();
    }

    async findById(id: number): Promise<Avatar | null> {
        return await Avatar.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Item,
                    as: 'items',
                    through: {attributes: []}
                }
            ]
        });
    }

    async deleteById(id: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async exists(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}