import { AchievementType } from "../model/AchievementType.ts";

export interface AchievementStrategy {
    checkAndReward(accountId: string, type: AchievementType, data: any[]): Promise<void>;
}