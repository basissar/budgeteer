import { RepositoryError } from "../errors/RepositoryError.ts";
import { Category } from "../model/Category.ts";
import { Expense } from "../model/Expense.ts";
import { Wallet } from "../model/Wallet.ts";
import { BaseRepository } from "./baseRepository.ts";
import { Op } from 'npm:sequelize';
import { SumSearchParameters } from "./sumSearchParams.ts";

export class ExpenseRepository implements BaseRepository<Expense, number> {

    async save(expense: Expense): Promise<Expense | null> {
        try {
            const result = await expense.save();
            return result;
        } catch (error) {
            throw new RepositoryError(`Expense repository error: ${(error as Error).message}`);
        }
    }

    async findAll(): Promise<Expense[] | null> {
        try {
            return await Expense.findAll();
        } catch (error) {
            throw new RepositoryError((error as Error).message);
        }
    }

    async findById(id: number): Promise<Expense | null> {
        return await Expense.findByPk(id, {
            include: [
                { model: Category, as: 'sourceCategory', attributes: ['id', 'name', 'color', 'iconId'] },
                { model: Category, as: 'targetCategory', attributes: ['id', 'name', 'color', 'iconId'] }
            ]
        });
    }

    async deleteById(id: number): Promise<number> {
        return await Expense.destroy({
            where: { id: id }
        });
    }

    async deleteBySource(walletId: string, catId: number): Promise<number> {
        return await Expense.destroy({
            where: { sourceCategoryId: catId, walletId: walletId}
        })
    }

    async deleteByTarget(walletId: string, catId: number): Promise<number> {
        return await Expense.destroy({
            where: { targetCategoryId: catId, walletId: walletId}
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
                { model: Category, as: 'sourceCategory', attributes: ['id', 'name', 'color', 'iconId'] },
                { model: Category, as: 'targetCategory', attributes: ['id', 'name', 'color', 'iconId'] }
            ],
            order: [['date', 'DESC']]
        })
    }

    public async findByUser(userId: string): Promise<Expense[] | null> {
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
            throw new RepositoryError((error as Error).message);
        }
    }

    public async getCountByCategoryForUser(userId: string, categoryId: number) {
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
            throw new RepositoryError((error as Error).message);
        }
    }

    public async findBySource(walletId: string, source: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                sourceCategoryId: source
            }
        })
    }

    public async findByTarget(walletId: string, target: number): Promise<Expense[] | null> {
        return await Expense.findAll({
            where: {
                walletId: walletId,
                targetCategoryId: target
            }
        })
    }

    public async findByMaxAmount(walletId: string, max: number): Promise<Expense[] | null> {
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
            throw new RepositoryError((error as Error).message);
        }
    }

    public async findByMinAmount(walletId: string, min: number): Promise<Expense[] | null> {
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
            throw new RepositoryError((error as Error).message);
        }
    }

    public async findByDate(walletId: string, date: Date, category: number) {
        try {
            return await Expense.findAll({
                attributes: ['name', 'amount', 'targetCategoryId'],
                where: {
                    walletId: walletId,
                    date: date,
                    targetCategoryId: category
                }
            });
        } catch (error) {
            throw new RepositoryError((error as Error).message);
        }
    }

    public async findByDateRangeWithCategory(walletId: string, startDay: Date, endDay: Date, category: number) {
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
        } catch (error) {
            throw new RepositoryError((error as Error).message);
        }
    }

    /**
     * Retrieves sum based on search parameters
     * @param params 
     * @returns summed amount
     */
    public async sumExpenses(params: SumSearchParameters): Promise<number> {
        try {
            const whereClause = params.toWhereClause();

            const result = await Expense.sum('amount', {where: whereClause});

            return result || 0;
        } catch (err) {
            throw new RepositoryError(`Expense repository error: ${(err as Error).message}`);
        }
    }

    public async getBalanceTotal(walletId: string) {
        const totalSum = await Expense.sum('amount', {
            where: {
                walletId: walletId,
                sourceCategoryId: null
            }
        });

        return totalSum || 0;
    }
}