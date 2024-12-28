import { ServiceError } from "../errors/ServiceError.ts";
import { UnknownTypeError } from "../errors/UnknownTypeError.ts";
import { AccountAchievement } from "../model/AccountAchievement.ts";
import { AchievementType } from "../model/AchievementType.ts";
import { AchievementRepository } from "../repository/achievementRepository.ts";
import { AchievementContext } from "../strategy/achievementContext.ts";
import { BudgetStrategy } from "../strategy/budgetStrategy.ts";
import { ExpenseStrategy } from "../strategy/expenseStrategy.ts";
import { GoalCompletionStrategy } from "../strategy/goalStrategy.ts";


export class AchievementService {

    private achievementContext: AchievementContext;

    private achievementRepository: AchievementRepository;

    constructor(achievementRepository: AchievementRepository){
        this.achievementContext = new AchievementContext();
        this.achievementRepository = achievementRepository;
    }

    async getAllAchievements() {
        try {
            const result = await this.achievementRepository.findAll();

            return result;
        } catch (err) {
            throw new ServiceError(`Achievement service error: ${err}`);
        }
    }

    async getAllForAccount(accountId: string) {
        try {
            const result = await this.achievementRepository.findAllForAccount(accountId);

            return result;
        } catch (err) {
            throw new ServiceError(`Achievement service error: ${err}`);
        }
    }

    /**
     * 
     * @param accountId id of user account
     * @param type type of achievement for evaluation
     * @param data any data passed into the evalutaion 
     * data[0] - repository
     * data[1] - count of completed expenses/goals/budgets
     */
    async evaluateAchievement(accountId: string, type: AchievementType, data: any[]){
        switch(type){
            case AchievementType.GOAL: {
                this.achievementContext.setStrategy(new GoalCompletionStrategy(this));
                await this.achievementContext.executeStrategy(accountId, type, data);
                break;
            }
            case AchievementType.EXPENSE:{
                this.achievementContext.setStrategy(new ExpenseStrategy(this));
                await this.achievementContext.executeStrategy(accountId, type, data);
                break;
            }
            case AchievementType.BUDGET:{
                this.achievementContext.setStrategy(new BudgetStrategy(this));
                await this.achievementContext.executeStrategy(accountId,type,data);
                break;
            }
            default: {
                throw new UnknownTypeError(`Achievement type: ${type} is not applicable for achievement evalutaion`)
            }
        }
    }

    async claimAchievement(accountId: string, achievementId: number){
        const achievement = await this.achievementRepository.findAccountAchievement(accountId,achievementId);
        
        if (achievement == null || achievement.claimed){
            return false;
        }

        achievement.set('claimed', true);
        await achievement.save();

        const actualAchv = achievement.achievement;

        return actualAchv;             
    }

    async rewardAchievement(accountId: string, achievementId: number){
        const exists = await this.achievementRepository.accountAchievementExists(accountId, achievementId);

        if (!exists) {
            const newAchievement = new AccountAchievement({
                accountId,
                achievementId,
                dateAchieved: new Date()
            });
            await newAchievement.save();

            return true; //if new is created
        } 

        return false; //none created
    }

    async checkAndRewardAchievement(accountId: string, type: AchievementType, count?: number){
        const achievements = await this.achievementRepository.findByType(type);

        for(const achievement of achievements) {
            if (achievement.targetCount == count){
                await this.rewardAchievement(accountId, achievement.id);
            }
        }
    }

    async findByType(type: AchievementType){
        return await this.achievementRepository.findByType(type);
    }
}