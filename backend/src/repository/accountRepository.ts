import { RepositoryError } from "../errors/RepositoryError.ts";
import { Account } from "../model/Account.ts";
import { BaseRepository } from "./baseRepository.ts";


export class AccountRepository implements BaseRepository<Account, string> {

    async save(account: Account): Promise<Account | null> {
        try {
            const result = await account.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Acocunt repository error: ${err.message}`);
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
            }
        });
    }
    
    async deleteById(id: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async exists(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}