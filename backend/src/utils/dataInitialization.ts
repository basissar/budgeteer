import { AVATAR_REPOSITORY, CATEGORY_REPOSITORY, ITEM_REPOSITORY } from "../config/macros.ts";
import { container } from "./container.ts";
import { Category } from "../model/Category.ts";
import { Avatar } from "../model/Avatar.ts";
import { Item } from "../model/Item.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";
import { AvatarRepository } from "../repository/avatarRepository.ts";
import { ItemRepository } from "../repository/itemRepository.ts";

const categoriesData = [
    { name: "Unclassified", color: "#8A817C" },
    { name: "Entertainment", color: "#D81159" },
    { name: "Food", color: "#9D0208" },
    { name: "School", color: "#FFD300" },
    { name: "Transport", color: "#4CC9F0" },
    { name: "Shopping", color: "#147DF5" },
    { name: "Healthcare", color: "#16DB65" },
    { name: "Housing", color: "#27A300" },
    { name: "Pets", color: "#F58300" },
    { name: "Travel", color: "#3A0CA3" },
    { name: "Subscriptions", color: "#D00000" }
];

const avatarData = [
    { id: 1, name: "Mejvina", description: "Mejvina is a wild catto."},
    { id: 2, name: "Pumpkin", description: "This is Pumpkin the cat."}
];

const itemData = [
    { name: "Blue fly", price: 50, rarity: 'common', avatarId: 1, item_img: 'blue_fly'},
    { name: "Green hat", price: 20, rarity: 'common', avatarId: 1, item_img: 'green_hat'},
    { name: "Golden hat", price: 100, rarity: 'rare', avatarId: 1, item_img: 'golden_hat'},
    { name: "Green fly", price: 100, rarity: 'rare', avatarId: 2, item_img: 'green_fly'},
    { name: "Blue hat", price: 15, rarity: 'common', avatarId: 2, item_img: 'blue_hat'},
    { name: "Red hat", price: 15, rarity: 'common', avatarId: 2, item_img: 'red_hat'}
]

// const achievementData = [
//     { name: "5 Expenses added", description: "You have added 5 expenses!", gainedCredits: 10,}
// ]


export async function insertData(){
    let catRep = container.resolve(CATEGORY_REPOSITORY);
    let avRepo = container.resolve(AVATAR_REPOSITORY);
    let itemRepo = container.resolve(ITEM_REPOSITORY);

    // await Category.drop();

    if (catRep == null) {
        catRep = new CategoryRepository();
        container.register(CATEGORY_REPOSITORY, catRep);
    }

    if (avRepo == null) {
        avRepo = new AvatarRepository();
        container.register(AVATAR_REPOSITORY, avRepo);
    }

    if(itemRepo == null){
        itemRepo = new ItemRepository();
        container.register(ITEM_REPOSITORY, itemRepo);
    }


    // Loop through categories data and save each category
    for (const categoryData of categoriesData) {
        const category = new Category(categoryData);

        const exists = await catRep.existsByName(category.name);
        if (!exists){
            // console.log(category);

        const savedCategory = await catRep.save(category);

        if (savedCategory) {
            console.log(`Category "${savedCategory.name}" saved successfully.`);
        } else {
            console.log(`Failed to save category "${category.name}".`);
        }
        }
    }

    for (const avatar of avatarData){
        const toSave = new Avatar(avatar);

        const exists = await avRepo.exists(toSave.id);

        if (!exists){
            await toSave.save();
            console.log(`Avatar ${avatar.name} with id ${avatar.id} saved successfully`);
        }
    }

    for (const item of itemData){
        const toSave = new Item(item);

        const exists = await itemRepo.existsByName(toSave.name);

        if(!exists) {
            await toSave.save();
            console.log(`Item ${item.name} for ${item.price} credits with ${item.rarity} saved successfuly`);
        }
        
    }
}