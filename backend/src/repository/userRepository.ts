import { Op } from 'npm:sequelize';
import { RepositoryError } from '../errors/RepositoryError.ts';
import { User } from '../model/User.ts';
import { Wallet } from '../model/Wallet.ts';
import { Budget } from '../model/Budget.ts';
import { BaseRepository } from "./baseRepository.ts";

export class UserRepository implements BaseRepository<User, string> {
    
    async save(user: User): Promise<User | null> {
        try {
            const result = await user.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`User Repository error: ${err.message}`);
        }
    }

    async findAll(): Promise<User[] | null> {
        try {
            return await User.findAll({
                attributes: ['id', 'username']
            });
        } catch (err) {
            throw new RepositoryError(err.message);
        }
    }

    async findById(id: string): Promise<User | null> {
        return await User.findByPk(id);
    }

    async exists(id: string): Promise<boolean> {
        const result = await User.findOne({where: {id}});
        return !!result;
    }
      

    async findByUsername(username: string){
        return await User.findOne({
            where: {
                username: username
            }
        });
    }

    async existsById(id: string) {
        const result = await User.findOne({where: {id}});
        return !!result;
    }

    async existsByUsername(username: string){
        const result = await User.findOne({where: {username: username}});
        return !!result;
    }

    async existsByEmail(email: string) {
        const result = await User.findOne({
            where: {
                email: email,
                deletedAt: null
            }
        });
        return !!result;
    }

    //this should be deleted as it causes problems and cascade is not really applicable
    async deleteById(id: string) {
        return await User.destroy({
            where: {id}
        });
    }

    async setDeleted(id: string) {
        const deletedAt = new Date();

        return await User.update({deletedAt}, {where: {id}});
    }

    async getForCron(timezones: string[], recurrence: string){
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: Wallet, as: 'wallets',
                        include: [
                            {
                                model: Budget,
                                as: 'budgets',
                                where: {
                                    recurrence: recurrence
                                }
                            }
                        ]
                    }
                ],
                where: {
                    timezone: {
                        [Op.in]: timezones
                    }
                }
            });

            return users;
        } catch (error) {
            console.error('Error getting users with wallets and budgets for cron:', error);
            throw error;
        }
    }

}