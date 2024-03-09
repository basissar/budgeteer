import {Expense} from "../model/Expense.ts";
import {executeQuery} from "../database/database.ts";


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