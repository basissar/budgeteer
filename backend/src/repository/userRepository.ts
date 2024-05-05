import { RepositoryError } from '../errors/RepositoryError.ts';
import { User } from '../model/User.ts';
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
                attributes: ['id', 'username'] // Specify only required attributes
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
        const result = await User.findOne({where: {email: email}});
        return !!result;
    }

    async deleteById(id: string) {
        return await User.destroy({
            where: {id}
        });
    }

    async deleteByUsername(username: string) {
        return await User.destroy({
            where: {username: username}
        });
    }

    async getForCron(timezone: string){
        return await User.findAll({
            attributes:['id'],
            where: {timezone: timezone}
        })
    }

}