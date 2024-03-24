import { User } from '../model/User.ts';
import { BaseRepository } from "./baseRepository.ts";

export class UserRepository implements BaseRepository<User, string> {
    
    async save(user: User): Promise<User | null> {
        try {
            const result = await user.save();

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async findAll(): Promise<User[] | null> {
        try {
            return await User.findAll({
                attributes: ['id', 'username'] // Specify only required attributes
            });
        } catch (err) {
            throw new Error(err.stack);
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

}