import { RepositoryError } from "../errors/RepositoryError.ts";
import { AccountAchievement } from "../model/AccountAchievement.ts";
import { Achievement } from "../model/Achievement.ts";
import { BaseRepository } from "./baseRepository.ts";

export class AchievementRepository implements BaseRepository<Achievement, number> {
    
    async save(achievement: Achievement): Promise<Achievement | null> {
        try {
            const result = await achievement.save();

            return result;
        } catch (err) {
            throw new RepositoryError(`Achievement repository error: ${err.mesasge}`)
        }
    }

    async findAll(): Promise<Achievement[] | null> {
        return await Achievement.findAll();
    }

    async findById(id: number): Promise<Achievement | null> {
        return await Achievement.findByPk(id)
    }

    deleteById(id: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    exists(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async findAccountAchievement(accountId: string, achievementId: number){
        return await AccountAchievement.findOne({
            where: {
                accountId: accountId,
                achievementId: achievementId
            },
            include: [Achievement]
        });
    }

    async findAllForAccount(accountId: string) {
        return await AccountAchievement.findAll({
            where:{
                accountId: accountId
            },
            include: [Achievement]
        })
    }

    async accountAchievementExists(accountId: string, achievementId: number){
        const result = await AccountAchievement.findOne({
            where: {
                accountId: accountId,
                achievementId: achievementId
            }
        });

        return !!result;
    }

    async findByType(type: string){
        return await Achievement.findAll({
            where: {
                type: type
            }
        });
    }

}