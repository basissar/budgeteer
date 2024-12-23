import { ServiceError } from "../errors/ServiceError.ts";
import { Account } from "../model/Account.ts";
import { Achievement } from "../model/Achievement.ts";
import { EventResult } from "../model/EventResult.ts";
import { EventType } from "../model/EventType.ts";
import { AccountRepository } from "../repository/accountRepository.ts";


export class AccountService {

    private accountRepository: AccountRepository;

    private BASE_XP = 50;

    private XP_INCREASE_PERCENTAGE = 0.1;

    private eventXPRewards: Record<EventType, number> = {
      [EventType.ADD_EXPENSE]: 15,
      [EventType.CREATE_GOAL]: 20,
      [EventType.REACH_GOAL]: 150,
      [EventType.CREATE_BUDGET]: 20,
      [EventType.WITHIN_BUDGET]: 100,
      [EventType.LEVEL_UP]: 0 // no experience points rewarded for level up
      ,
      [EventType.ACHIEVEMENT]: 0
    };

    private eventCreditRewards: Record<EventType, number> = {
      [EventType.ADD_EXPENSE]: 15,
      [EventType.CREATE_GOAL]: 20,
      [EventType.REACH_GOAL]: 100,
      [EventType.CREATE_BUDGET]: 20,
      [EventType.WITHIN_BUDGET]: 80,
      [EventType.LEVEL_UP]: 20 //TODO add credit reward based on the reached level
      ,
      [EventType.ACHIEVEMENT]: 0
    }

    constructor(accountRepository: AccountRepository){
        this.accountRepository = accountRepository;
    }


    async handleEvent(event: EventType, userId: string, achievement?: Achievement): Promise<EventResult | null> {
        try {
            let earnedCredits = 0;
            let earnedXP = 0;

            const foundAccount = await this.accountRepository.findByUser(userId);

            if (foundAccount == null) {
                return null;
            }

            if (event == EventType.ACHIEVEMENT){
                earnedCredits = achievement!.gainedCredits;
                earnedXP = achievement!.gainedXp;
            } else {
                earnedCredits = this.rewardCreditsForEvent(event);
                earnedXP = this.rewardXPForEvent(event);
            }

            const totalXPBalance = foundAccount.experience + earnedXP;

            const reachedLevel  = this.calculateLevelForXP(totalXPBalance);

            const leveledUp = reachedLevel > foundAccount.level;

            if ( leveledUp) {
                earnedCredits = earnedCredits + this.rewardCreditsForEvent(EventType.LEVEL_UP);
                foundAccount.set('level', reachedLevel);
            } 
            
            foundAccount.set('experience', foundAccount.experience + earnedXP);
            foundAccount.set('credits', foundAccount.credits + earnedCredits);

            await this.accountRepository.save(foundAccount);
            
            const result = {
                earnedCredits: earnedCredits,
                earnedXP: earnedXP,
                creditBalance: foundAccount.credits,
                XPBalance: foundAccount.experience,
                leveledUp: leveledUp,
                newLevel: reachedLevel,
            }

            return result;

        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async createAccount(userId: string, avatarId: number) {
        try {
            const newAccount = new Account({
                experience: 0,
                credits: 0,
                level: 0,
                userId: userId,
                avatarId: avatarId
            });

            return await this.accountRepository.save(newAccount);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async updateAccount(account: Account){
        try {
            return await this.accountRepository.save(account);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async findById(accountId: string) {
        try {
            return await this.accountRepository.findById(accountId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async findByUser(userId: string) {
        try {
            const account = await this.accountRepository.findByUser(userId);
            const neededXP = this.totalXPForLevel(account!.level + 1);

            const result = {
                account: account,
                neededXP: neededXP
            }

            // return await this.accountRepository.findByUser(userId);
            return result;
        } catch (err){
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async findByUserNoItem(userId: string) {
        try {
            return await this.accountRepository.findByUserNoItem(userId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async getOwnedForUser(accountId: string) {
        try {
            return await this.accountRepository.getItemsOwnedForAccount(accountId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err}`);
        }
    }

    async getIdForUser(userId: string){
        return await this.accountRepository.getAccountIdForUser(userId);
    }

    /** Calculates needed XP to reach next level
     * 
     * @param level level to reach
     * @returns experience points needed
     */
    private calculateXPForLevel(level: number): number {
        if (level === 1) return this.BASE_XP;
        return Math.floor(this.BASE_XP * Math.pow(1 + this.XP_INCREASE_PERCENTAGE, level - 1));
    }

    /** Calculates highest level achievable by current XP
     * 
     * @param xp experience points for which we are calculating level
     * @returns highest reachable level for given XP
     */    
    private calculateLevelForXP(xp: number): number {
        let level = 1;
        let cumulativeXP = this.BASE_XP;
        while (xp >= cumulativeXP) {
            level++;
            cumulativeXP += this.calculateXPForLevel(level);
        }
        return level - 1; // return previous level
    }
    
    /** Calculates cummulative XP needed to reach target level
     * 
     * @param targetLevel level to reach
     * @returns sum of all XP needed to reach target level
     */
    private totalXPForLevel(targetLevel: number): number {
        let totalXP = 0;
        for (let level = 1; level <= targetLevel; level++) {
            totalXP += this.calculateXPForLevel(level);
        }
        return totalXP;
    }

    private rewardXPForEvent(eventType: EventType): number {
        return this.eventXPRewards[eventType] || 0; 
    }

    private rewardCreditsForEvent(eventType: EventType): number {
        return this.eventCreditRewards[eventType] || 0;
    }



    

}