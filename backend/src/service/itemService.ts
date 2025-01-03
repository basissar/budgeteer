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

    async buyItem(itemId: number, userId: string){
        const foundAccount = await this.accountService.findByUserNoItem(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (foundAccount == null || wantedItem == null){
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

    async equipItem(itemId: number, userId: string) {
        const result = await this.accountService.findByUser(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (result == null || wantedItem == null || result.account == null){
            return false;
        }
        //TODO handle removal of equipped item of the same type

        const equippedItems = result.account.equippedItems;

        for (const item of equippedItems) {
            if(item.type == wantedItem.type){
               await result.account.$remove('equippedItems', item);
               await result.account.$add('equippedItems', wantedItem);
            }
        }

        return wantedItem;
    }

    async unequipItem(itemId: number, userId: string) {
        const foundAccount = await this.accountService.findByUserNoItem(userId);
        const wantedItem = await this.itemRepository.findById(itemId);

        if (foundAccount == null || wantedItem == null){
            return false;
        }

        await foundAccount.$remove('equippedItems', wantedItem);

        return wantedItem;
    }

    async findByAvatar(avatarId: number) {
        try {
            return await this.itemRepository.findByAvatar(avatarId);
        } catch (err) {
            throw new ServiceError(`Item service error: ${err}`);
        }
    }

}