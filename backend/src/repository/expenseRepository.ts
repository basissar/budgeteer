import { RepositoryError } from "../errors/RepositoryError.ts";
import { Category } from "../model/Category.ts";
import { Expense } from "../model/Expense.ts";
import { Wallet } from "../model/Wallet.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';

export class ExpenseRepository implements BaseRepository<Expense, number> {

    async save(expense: Expense): Promise<Expense | null> {
        try {
            const result = await expense.save();
            return result;
        } catch (error) {
            throw new RepositoryError(`Expense repository error: ${error.message}`);
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
        return await Expense.findByPk(id, {
            include: [
                { model: Category, as: 'sourceCategory', attributes: ['name', 'color'] },
                { model: Category, as: 'targetCategory', attributes: ['name', 'color'] }
            ]
        });
    }

    async deleteById(id: number): Promise<number> {
        return await Expense.destroy({
            where: { id: id }
        });
    }

    async deleteBySource(catId: number): Promise<number> {
        return await Expense.destroy({
            where: { sourceCategoryId: catId }
        })
    }

    async deleteByTarget(catId: number): Promise<number> {
        return await Expense.destroy({
            where: { targetCategoryId: catId }
        });
    }

    async deleteByWallet(walletId: string): Promise<number> {
        return await Expense.destroy({
            where: { walletId: walletId }
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
            },
            include: [
                { model: Category, as: 'sourceCategory', attributes: ['name', 'color'] },
                { model: Category, as: 'targetCategory', attributes: ['name', 'color'] }
            ],
            order: [['date', 'DESC']]
        })
    }

    async findByUser(userId: string): Promise<Expense[] | null> {
        try {
            const userWallets = await Wallet.findAll({
                where: { userId: userId }
            });

            const walletIds = userWallets.map(wallet => wallet.id);

            return await Expense.findAll({
                where: {
                    walletId: {
                        [Op.in]: walletIds // Using the "in" operator to match walletIds
                    }
                },
                include: [
                    { model: Category, as: 'sourceCategory', attributes: ['name', 'color'] },
                    { model: Category, as: 'targetCategory', attributes: ['name', 'color'] }
                ],
                order: [['date', 'DESC']]
            });
        } catch (error) {
            throw new RepositoryError(error.stack);
        }
    }

    async getCountByCategoryForUser(userId: string, categoryId: number) {
        try {
            //Retrieve the user's wallets
            const userWallets = await Wallet.findAll({
                where: { userId: userId },
                attributes: ['id']
            });

            //Extract wallet IDs
            const walletIds = userWallets.map(wallet => wallet.id);

            //Count expenses that match the category and belong to the user's wallets
            const count = await Expense.count({
                where: {
                    walletId: {
                        [Op.in]: walletIds
                    },
                    targetCategoryId: categoryId
                }
            });

            return count;
        } catch (error) {
            throw new RepositoryError(error.stack);
        }
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

    async findByDate(walletId: string, date: Date, category: number) {
        try {
            return await Expense.findAll({
                attributes: ['name', 'amount', 'targetCategoryId'],
                where: {
                    walletId: walletId,
                    date: date,
                    targetCategoryId: category
                }
            });
        } catch (err) {
            throw new RepositoryError(err.stack);
        }
    }

    async findByDateRange(walletId: string, startDay: Date, endDay: Date, category: number) {
        try {
            return await Expense.findAll({
                attributes: ['name', 'amount', 'targetCategoryId'],
                where: {
                    walletId: walletId,
                    date: {
                        [Op.between]: [startDay, endDay]
                    },
                    targetCategoryId: category
                }
            });
        } catch (err) {
            throw new RepositoryError(err.stack);
        }
    }

    async sumNegativeExpensesForMonth(userId: string, year: number, month: number, walletId: string) {
        try {
            // const userWallets = await Wallet.findAll({
            //     where: { userId: userId },
            //     attributes: ['id']
            // });

            // const walletIds = userWallets.map(wallet => wallet.id);

            const result = await Expense.sum('amount', {
                where: {
                    walletId: walletId,
                    amount: {
                        [Op.lt]: 0 // positive amounts
                    },
                    date: {
                        [Op.between]: [new Date(year, month - 1, 1), new Date(year, month, 0)] // date range for the month
                    },
                    sourceCategoryId: null,
                }
            });

            return result || 0;
        } catch (error) {
            throw new RepositoryError(`Expense repository error: ${error.message}`);
        }
    }

    async sumPositiveExpensesForMonth(userId: string, year: number, month: number, walletId: string) {
        try {
            // const userWallets = await Wallet.findAll({
            //     where: { userId: userId },
            //     attributes: ['id']
            // });

            // const walletIds = userWallets.map(wallet => wallet.id);

            const result = await Expense.sum('amount', {
                where: {
                    walletId: walletId,
                    amount: {
                        [Op.gt]: 0 // positive amounts
                    },
                    date: {
                        [Op.between]: [new Date(year, month - 1, 1), new Date(year, month, 0)] // date range for the month
                    },
                    sourceCategoryId: null,
                }
            });

            return result || 0;
        } catch (error) {
            throw new RepositoryError(`Expense repository error: ${error.message}`);
        }
    }

    async sumNegativeExpensesForDateRange(userId: string, startDate: Date, endDate: Date, targetCategoryId: number): Promise<number> {
        try {
            const userWallets = await Wallet.findAll({
                where: { userId: userId },
                attributes: ['id']
            });

            const walletIds = userWallets.map(wallet => wallet.id);

            const result = await Expense.sum('amount', {
                where: {
                    walletId: {
                        [Op.in]: walletIds
                    },
                    amount: {
                        [Op.lt]: 0 // negative amounts
                    },
                    date: {
                        [Op.between]: [startDate, endDate] // date range
                    },
                    targetCategoryId: targetCategoryId
                }
            });

            return result || 0;
        } catch (error) {
            throw new RepositoryError(`Expense repository error: ${error.message}`);
        }
    }

    async getCurrentWalletBalance(walletId: string, targetCategoryId: number) {
        const targetCategorySum = await Expense.sum('amount', {
            where: {
                walletId: walletId,
                targetCategoryId: targetCategoryId
            }
        });
    
        const positiveTargetCategorySum = targetCategorySum > 0 ? targetCategorySum : 0;
    
        const sourceCategorySum = await Expense.sum('amount', {
            where: {
                walletId: walletId,
                sourceCategoryId: targetCategoryId
            }
        });
    
        const currentBalance = positiveTargetCategorySum - (sourceCategorySum || 0);
        return currentBalance || 0;
    }
}