import { RepositoryError } from "../errors/RepositoryError.ts";
import {Expense} from "../model/Expense.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';

export class ExpenseRepository implements BaseRepository<Expense, number> {

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
            where: { id: id }
        });
    }

    async deleteBySource(catId: number): Promise<number> {
        return await Expense.destroy({ 
            where: { sourceCategoryId: catId}
        })
    }   

    async deleteByTarget(catId: number): Promise<number> {
        return await Expense.destroy({
            where: { targetCategoryId: catId}
        });
    }

    async deleteByWallet(walletId: string): Promise<number>{
        return await Expense.destroy({
            where: { walletId: walletId}
        });
    }

    async exists(id: number): Promise<boolean> {
        const result = await Expense.findOne({ 
            where: { id }
        });
        return !!result;
    }

    async findByWallet(id: string): Promise<Expense[] | null> {
        return await Expense.findAll({ 
            where: {
                walletId: id
            }
        })
    }

    async findBySource(walletId: string, source: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                sourceCategoryId: source
            }
        })
    }

    async findByTarget(walletId: string, target: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                targetCategoryId: target
            }
        })
    }

    async findByMaxAmount(walletId: string, max: number): Promise<Expense[] | null> {
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

    async findByMinAmount(walletId: string, min: number): Promise<Expense[] | null> {
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