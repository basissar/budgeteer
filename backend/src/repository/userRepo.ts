import { User } from '../model/User.ts';
import { BaseRepository } from "./baseRepository.ts";

export class UserRepository implements BaseRepository<User> {
    
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

    async findById(id: number): Promise<User | null> {
        return await User.findByPk(id);
    }

    async exists(id: number): Promise<boolean> {
        const result = await User.findOne({where: {id}});
        return !!result;
    }
      

    async findByUsername(username: string){
        return await User.findOne({
            where: {
                username
            }
        });
    }

    async existsById(id: number) {
        const result = await User.findOne({where: {id}});
        return !!result;
    }

    async existsByUsername(username: string){
        const result = await User.findOne({where: {username}});
        return !!result;
    }

    async deleteById(id: number) {
        return await User.destroy({
            where: {id}
        });
    }

    async deleteByUsername(username: string) {
        return await User.destroy({
            where: {username}
        });
    }

}