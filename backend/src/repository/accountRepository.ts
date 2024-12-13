import { RepositoryError } from "../errors/RepositoryError.ts";
import { Account } from "../model/Account.ts";
import { Achievement } from "../model/Achievement.ts";
import { Avatar } from "../model/Avatar.ts";
import { Item } from "../model/Item.ts";
import { BaseRepository } from "./baseRepository.ts";


export class AccountRepository implements BaseRepository<Account, string> {

    async save(account: Account): Promise<Account | null> {
        try {
            const result = await account.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Acocunt repository error: ${(err as Error).message}`);
        }
    }
    
    async findAll(): Promise<Account[] | null> {
        return await Account.findAll();
        // throw new Error("Method not implemented.");
    }
    
    async findById(id: string): Promise<Account | null> {
        return await Account.findByPk(id);
    }

    async findByUser(id: string): Promise<Account | null> {
        return await Account.findOne({
            where: {
                userId: id,
            },
            include: [
                {
                    model: Avatar,
                    as: 'avatar'
                },
                {
                    model: Item,
                    as: 'ownedItems',
                    through: { attributes: [] } // Exclude join table attributes
                },
                {
                    model: Item,
                    as: 'equippedItems',
                    through: { attributes: [] } // Exclude join table attributes
                },
                {
                    model: Achievement,
                    as: 'achievements'
                }
            ]
        });
    }

    async findByUserNoItem(id: string): Promise<Account | null> {
        return await Account.findOne({
            where: {
                userId: id,
            }
        })
    }

    //The method below could as well be useless since the items are alway connected to account by default
    async getItemsOwnedForAccount(id: string) {
        const account = await Account.findByPk(id);

        if(!account){
            return null;
        } else {
            const items = await account.$get('ownedItems');
            return items;
        }
    }

    async getAccountIdForUser(userId: string){
        return await Account.findOne({
            where: {
                userId: userId
            },
            attributes: [
                'id'
            ]
        })
    }

    async getAccountForScheduler(userId: string){
        return await Account.findOne({
            where: {
                userId: userId
            },
            attributes: [
                'id',
                'stayedWithinBudget'
            ]
        })
    }
    
    async deleteById(id: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async exists(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}