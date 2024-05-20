import { CATEGORY_REPOSITORY } from "../config/macros.ts";
import { container } from "./container.ts";
import { Category } from "../model/Category.ts";
import { Avatar } from "../model/Avatar.ts";
import { Item } from "../model/Item.ts";
import { CategoryRepository } from "../repository/categoryRepository.ts";

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
    { id: 1, name: "Dog", description: "This is Rex the doggo"},
    { id: 2, name: "Cat", description: "This is Pumpkin the cat"}
];

const itemData = [
    { name: "Brown hat", price: 100, rarity: 'common', avatarId: 1},
    { name: "Special brown hat", price: 200, rarity: 'rare', avatarId: 1},   
    { name: "Pants", price: 120, rarity: 'common', avatarId: 2},
    { name: "Very special pants", price: 300, rarity: 'epic', avatarId: 2}, 
]


export async function insertData(){
    let catRep = container.resolve(CATEGORY_REPOSITORY);

    if (catRep == null) {
        catRep = new CategoryRepository();
        container.register(CATEGORY_REPOSITORY, catRep);
    }


    // Loop through categories data and save each category
    for (const categoryData of categoriesData) {
        const category = new Category(categoryData);

        // console.log(category);

        const savedCategory = await catRep.save(category);

        if (savedCategory) {
            console.log(`Category "${savedCategory.name}" saved successfully.`);
        } else {
            console.log(`Failed to save category "${category.name}".`);
        }
    }

    for (const avatar of avatarData){
        const toSave = new Avatar(avatar);
        toSave.save();
        console.log(`Avatar ${avatar.name} saved successfully`);
    }

    for (const item of itemData){
        const toSave = new Item(item);
        toSave.save();
        console.log(`Item ${item.name} for ${item.price} credits with ${item.rarity} saved successfuly`);
    }
}