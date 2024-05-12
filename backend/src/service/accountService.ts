import { ACCOUNT_REPOSITORY, USER_SERVICE } from "../config/macros.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { EventResult } from "../model/EventResult.ts";
import { EventType } from "../model/EventType.ts";
import { AccountRepository } from "../repository/accountRepository.ts";
import { container } from "../utils/container.ts";
import { UserService } from "./userService.ts";


export class AccountService {

    private userService: UserService;

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
      [EventType.LEVEL_UP]: 20 //todo add credit reward based on the reached level
    }

    constructor(){
        const userSer = container.resolve(USER_SERVICE);
        const accountRepo = container.resolve(ACCOUNT_REPOSITORY);

        //todo user service has no use so far FIX
        if (userSer == null) {
            const newUserSer = new UserService();
            container.register(USER_SERVICE, newUserSer);
            this.userService = newUserSer;
        } else {
            this.userService = userSer;
        }

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

    /** Calculates needed XP to reach next level
     * 
     * @param level level to reach
     * @returns experience points needed
     */
    calculateXPForLevel(level: number): number {
        return Math.floor(this.BASE_XP * Math.pow(1 + this.XP_INCREASE_PERCENTAGE, level - 1));
    }

    /** Calculates highest level achievable by current XP
     * 
     * @param xp experience points for which we are calculating level
     * @returns highest reachable level for given XP
     */    
    calculateLevelForXP(xp: number): number {
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
    totalXPForLevel(targetLevel: number): number {
        let totalXP = 0;
        for (let level = 1; level <= targetLevel; level++) {
            totalXP += this.calculateXPForLevel(level);
        }
        return totalXP;
    }

    rewardXPForEvent(eventType: EventType): number {
        return this.eventXPRewards[eventType] || 0; // Return XP reward for the event type, or 0 if not found
    }

    rewardCreditsForEvent(eventType: EventType): number {
        return this.eventCreditRewards[eventType] || 0;
    }



    

}