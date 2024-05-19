import { ACCOUNT_REPOSITORY } from "../config/macros.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { Account } from "../model/Account.ts";
import { EventResult } from "../model/EventResult.ts";
import { EventType } from "../model/EventType.ts";
import { AccountRepository } from "../repository/accountRepository.ts";
import { container } from "../utils/container.ts";


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
    };

    private eventCreditRewards: Record<EventType, number> = {
      [EventType.ADD_EXPENSE]: 15,
      [EventType.CREATE_GOAL]: 20,
      [EventType.REACH_GOAL]: 100,
      [EventType.CREATE_BUDGET]: 20,
      [EventType.WITHIN_BUDGET]: 80,
      [EventType.LEVEL_UP]: 20 //TODO add credit reward based on the reached level
    }

    constructor(){
        const accountRepo = container.resolve(ACCOUNT_REPOSITORY);

        if (accountRepo == null) {
            const newAccountRepo = new AccountRepository();
            container.register(ACCOUNT_REPOSITORY, newAccountRepo);
            this.accountRepository = newAccountRepo;
        } else {
            this.accountRepository = accountRepo;
        }
    }


    async handleEvent(event: EventType, userId: string): Promise<EventResult | null> {
        try {
            const foundAccount = await this.accountRepository.findByUser(userId);

            if (foundAccount == null) {
                return null;
            }

            let earnedCredits = this.rewardCreditsForEvent(event);
            const earnedXP = this.rewardXPForEvent(event);

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
            throw new ServiceError(`Account service error: ${err.message}`);
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
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    async updateAccount(account: Account){
        try {
            return await this.accountRepository.save(account);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    async findById(accountId: string) {
        try {
            return await this.accountRepository.findById(accountId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    async findByUser(userId: string) {
        try {
            return await this.accountRepository.findByUser(userId);
        } catch (err){
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    async findByUserNoItem(userId: string) {
        try {
            return await this.accountRepository.findByUserNoItem(userId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    async getOwnedForUser(accountId: string) {
        try {
            return await this.accountRepository.getItemsOwnedForAccount(accountId);
        } catch (err) {
            throw new ServiceError(`Account service error: ${err.message}`);
        }
    }

    /** Calculates needed XP to reach next level
     * 
     * @param level level to reach
     * @returns experience points needed
     */
    private calculateXPForLevel(level: number): number {
        return Math.floor(this.BASE_XP * Math.pow(1 + this.XP_INCREASE_PERCENTAGE, level - 1));
    }

    /** Calculates highest level achievable by current XP
     * 
     * @param xp experience points for which we are calculating level
     * @returns highest reachable level for given XP
     */    
    private calculateLevelForXP(xp: number): number {
        let level = 1;
        let xpRequired = this.BASE_XP;
        while (xp >= xpRequired) {
            level++;
            xpRequired = this.calculateXPForLevel(level);
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
        return this.eventXPRewards[eventType] || 0; // Return XP reward for the event type, or 0 if not found
    }

    private rewardCreditsForEvent(eventType: EventType): number {
        return this.eventCreditRewards[eventType] || 0;
    }



    

}