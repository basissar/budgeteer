import { RepositoryError } from "../errors/RepositoryError.ts";
import {Expense} from "../model/Expense.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';

export class ExpenseRepository implements BaseRepository<Expense> {

    async save(expense: Expense): Promise<Expense | null> {
        try{
            const result = await expense.save();
            return result;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findAll(): Promise<Expense[] | null> {
        try {
            return await Expense.findAll();
        } catch (error) {
            throw new RepositoryError(error.stack);
        }
    }

    async findById(id: number): Promise<Expense | null> {
        return await Expense.findByPk(id);
    }

    async deleteById(id: number): Promise<number> {
        return await Expense.destroy({
            where: { id }
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Expense.findOne({ 
            where: { id }
        });
        return !!result;
    }

    async findByWallet(id: number): Promise<Expense[] | null> {
        return await Expense.findAll({ 
            where: {
                walletId: id
            }
        })
    }

    async findBySource(walletId: number, source: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                sourceCategoryId: source
            }
        })
    }

    async findByTarget(walletId: number, target: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                targetCategoryId: target
            }
        })
    }

    async findByMaxAmount(walletId: number, max: number): Promise<Expense[] | null> {
        try {
            return await Expense.findAll({
                where: {
                    walletId: walletId,
                    amount: {
                        [Op.lte]: max // Using less than or equal operator
                    }
                }
            });
        } catch (error) {
            throw new RepositoryError(error.stack);
        }
    }

    async findByMinAmount(walletId: number, min: number): Promise<Expense[] | null> {
        try {
            return await Expense.findAll({
                where: {
                    walletId: walletId,
                    amount: {
                        [Op.gte]: min // Using greater than or equal operator
                    }
                }
            });
        } catch (error) {
            throw new RepositoryError(error.stack);
        }
    }
    
}

/*
export class expenseRepo {

    static async save(expense: Expense): Promise<Expense> {
        const query = "INSERT INTO expenses (name, amount, \"sourceCategoryId\", \"targetCategoryId\", \"walletId\") VALUES ($1, $2, $3, $4, $5) RETURNING id, name, walletId";
        const params = [expense.name, expense.amount, expense.sourceCategoryId
            , expense.targetCategoryId, expense.walletId]

        try {

            // return await executeQuery<{id, name, walletId}>(query, params);
            await executeQuery(query,params);
            return expense;
        } catch (error){
            console.error(error);
            throw new Error("Expense repository error: " + error);
        }
    }

    static async delete(userId: number, expenseId: number):Promise<boolean>{
        const query = "DELETE FROM expenses WHERE "

        //todo there isn't any userId so there is no need to pass it
        //maybe check
    }

    static async update(expense: Expense): Promise<Expense> {
        const query = "UPDATE expenses SET name = $2, amount = $3, \"sourceCategoryId\" = $4," +
            "\"targetCategoryId\" = $5 WHERE id = $1";
        const params = [expense.id, expense.name, expense.amount,
            expense.sourceCategoryId, expense.targetCategoryId]

        try {
            await executeQuery(query, params);
            return expense;
        } catch (error){
            console.error(error);
            throw new Error("Expense repository error: " + error);
        }
    }

    static async existsById(expenseId: number): Promise<boolean>{
        const query = "SELECT EXISTS (SELECT 1 FROM expenses WHERE id = $1)";
        const params = [expenseId];

        try {
            const result = await executeQuery(query, params);

            const existsValue = (result.rows[0] as { exists?: boolean})?.exists;
            return existsValue === true;
        } catch (error){
            throw new Error("Expense repository error: " + error);
        }
    }

}
*/