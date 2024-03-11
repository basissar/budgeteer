import {Model} from 'npm:sequelize-typescript'

export interface BaseRepository<T extends Model> {
    save(entity: T): Promise<T | null>;
    findAll(): Promise<T[] | null>;
    findById(id: number): Promise<T | null>;
    deleteById(id: number): Promise<number>;
    exists(id: number): Promise<boolean>;
}