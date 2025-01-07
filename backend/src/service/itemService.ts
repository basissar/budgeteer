import { ACCOUNT_SERVICE, ITEM_REPOSITORY } from "../config/macros.ts";
import { NotEnoughCreditsError } from "../errors/NotEnoughCreditsError.ts";
import { ServiceError } from "../errors/ServiceError.ts";
import { ItemRepository } from "../repository/itemRepository.ts";
import { container } from "../utils/container.ts";
import { AccountService } from "./accountService.ts";

export class ItemService {

    private itemRepository: ItemRepository;

    private accountService: AccountService;

    constructor(itemRepository: ItemRepository, accountService: AccountService) {
        this.itemRepository = itemRepository;
        this.accountService = accountService;
    }

    /**
     * Buys item
     * @param itemId wanted item 
     * @param userId for account retrieval
     * @returns 
     */
    public async buyItem(itemId: number, userId: string) {
        const foundAccount = await this.accountService.findByUserNoItem(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (foundAccount == null || wantedItem == null) {
            return false;
        }

        const creditBalance = foundAccount.credits;

        if (creditBalance < wantedItem.price) {
            throw new NotEnoughCreditsError(`User does not`)
        }

        foundAccount.set('credits', creditBalance - wantedItem.price);
        foundAccount.save();

        await foundAccount.$add('ownedItems', wantedItem);

        return wantedItem;
    }

    /**
     * Equipes item or unequipes item already equipped
     * @param itemId item to eequip
     * @param userId for account retrieval
     * @returns 
     */
    public async equipItem(itemId: number, userId: string) {
        const result = await this.accountService.findByUser(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (result == null || wantedItem == null || result.account == null) {
            return false;
        }

        const equippedItems = result.account.equippedItems;

        for (const item of equippedItems) {
            if (item.type === wantedItem.type) {
                // Remove the current equipped item of the same type
                await result.account.$remove('equippedItems', item);
                break;
            }
        }

        await result.account.$add('equippedItems', wantedItem);
        await result.account.save();
        return wantedItem;
    }

    /**
     * Unequips item
     * @param itemId item to unequip 
     * @param userId for account retrieval
     * @returns 
     */
    public async unequipItem(itemId: number, userId: string) {
        const foundAccount = await this.accountService.findByUserNoItem(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (foundAccount == null || wantedItem == null) {
            return false;
        }

        await foundAccount.$remove('equippedItems', wantedItem);

        return wantedItem;
    }

    /**
     * Return items allowed for avatar
     * @param avatarId 
     * @returns 
     */
    public async findByAvatar(avatarId: number) {
        try {
            return await this.itemRepository.findByAvatar(avatarId);
        } catch (err) {
            throw new ServiceError(`Item service error: ${err}`);
        }
    }

}