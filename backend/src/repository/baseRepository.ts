import {Model} from 'npm:sequelize-typescript'

export interface BaseRepository<T extends Model, K extends string | number> {
    //save can be used as update
    save(entity: T): Promise<T | null>;
    findAll(): Promise<T[] | null>;
    findById(id: K): Promise<T | null>;
    deleteById(id: K): Promise<number>;
    exists(id: K): Promise<boolean>;
}