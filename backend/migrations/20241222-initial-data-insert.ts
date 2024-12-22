import { Category } from '../src/model/Category.ts';
import { Avatar } from "../src/model/Avatar.ts";
import { Item } from "../src/model/Item.ts";
import { Achievement } from "../src/model/Achievement.ts";

const categoriesData = [
    { name: "Unclassified", color: "#8A817C", createdAt: new Date(), updatedAt: new Date() },
    { name: "Entertainment", color: "#D81159", createdAt: new Date(), updatedAt: new Date() },
    { name: "Food", color: "#9D0208", createdAt: new Date(), updatedAt: new Date() },
    { name: "School", color: "#FFD300", createdAt: new Date(), updatedAt: new Date() },
    { name: "Transport", color: "#4CC9F0", createdAt: new Date(), updatedAt: new Date() },
    { name: "Shopping", color: "#147DF5", createdAt: new Date(), updatedAt: new Date() },
    { name: "Healthcare", color: "#16DB65", createdAt: new Date(), updatedAt: new Date() },
    { name: "Housing", color: "#27A300", createdAt: new Date(), updatedAt: new Date() },
    { name: "Pets", color: "#F58300", createdAt: new Date(), updatedAt: new Date() },
    { name: "Travel", color: "#3A0CA3", createdAt: new Date(), updatedAt: new Date() },
    { name: "Subscriptions", color: "#D00000", createdAt: new Date(), updatedAt: new Date() }
];

const avatarData = [
    { id: 1, name: "Mejvina", description: "Mejvina is a wild catto.", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: "Pumpkin", description: "This is Pumpkin the cat.", createdAt: new Date(), updatedAt: new Date() }
];

const itemData = [
    { name: "Blue fly", price: 50, rarity: 'common', type: 'neck', avatarId: 1, item_img: 'blue_fly', createdAt: new Date(), updatedAt: new Date() },
    { name: "Green hat", price: 20, rarity: 'common', type: 'hat', avatarId: 1, item_img: 'green_hat', createdAt: new Date(), updatedAt: new Date() },
    { name: "Golden hat", price: 100, rarity: 'rare', type: 'hat', avatarId: 1, item_img: 'golden_hat', createdAt: new Date(), updatedAt: new Date() },
    { name: "Green fly", price: 100, rarity: 'rare', type: 'neck', avatarId: 2, item_img: 'green_fly', createdAt: new Date(), updatedAt: new Date() },
    { name: "Blue hat", price: 15, rarity: 'common', type: 'hat', avatarId: 2, item_img: 'blue_hat', createdAt: new Date(), updatedAt: new Date() },
    { name: "Red hat", price: 15, rarity: 'common', type: 'hat', avatarId: 2, item_img: 'red_hat', createdAt: new Date(), updatedAt: new Date() }
];

const achievementData = [
    { name: "First Expense", description: "Log your first expense.", quote: "A journey of a thousand miles begins with a single step.", gainedCredits: 10, gainedXp: 50, categoryId: 1, targetCount: 1, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Entertainment Enthusiast", description: "Spend 300 credits on entertainment.", quote: "Life is more fun if you play games.", gainedCredits: 15, gainedXp: 75, categoryId: 2, targetCount: 300, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Gourmet", description: "Spend 500 credits on food.", quote: "Good food is good mood.", gainedCredits: 20, gainedXp: 100, categoryId: 3, targetCount: 500, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Student Saver", description: "Save 100 credits in school expenses.", quote: "Education is the key to success.", gainedCredits: 10, gainedXp: 50, categoryId: 4, targetCount: 100, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Commuter", description: "Spend 200 credits on transport.", quote: "Travel is the only thing you buy that makes you richer.", gainedCredits: 15, gainedXp: 75, categoryId: 5, targetCount: 200, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Shopaholic", description: "Spend 1000 credits on shopping.", quote: "Shopping is cheaper than therapy.", gainedCredits: 40, gainedXp: 150, categoryId: 6, targetCount: 1000, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Health Advocate", description: "Spend 200 credits on healthcare.", quote: "Health is wealth.", gainedCredits: 25, gainedXp: 100, categoryId: 7, targetCount: 200, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Homeowner", description: "Spend 800 credits on housing.", quote: "Home is where our story begins.", gainedCredits: 35, gainedXp: 125, categoryId: 8, targetCount: 800, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Pet Lover", description: "Spend 300 credits on pets.", quote: "Pets are humanizing.", gainedCredits: 15, gainedXp: 75, categoryId: 9, targetCount: 300, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Traveler", description: "Spend 700 credits on travel.", quote: "Travel is the only thing you buy that makes you richer.", gainedCredits: 30, gainedXp: 125, categoryId: 10, targetCount: 700, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Subscription Savvy", description: "Spend 500 credits on subscriptions.", quote: "Subscriptions are a key to access.", gainedCredits: 20, gainedXp: 100, categoryId: 11, targetCount: 500, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Budget Keeper", description: "Stay within budget for a month.", quote: "Discipline is the bridge between goals and accomplishment.", gainedCredits: 50, gainedXp: 150, categoryId: 1, targetCount: 30, type: 'budget', createdAt: new Date(), updatedAt: new Date() },
    { name: "Goal Achiever", description: "Complete 5 goals.", quote: "Dream big, achieve bigger.", gainedCredits: 50, gainedXp: 200, categoryId: 2, targetCount: 5, type: 'goal', createdAt: new Date(), updatedAt: new Date() }
];

export async function up() {
    // Categories insert
    await Category.bulkCreate(categoriesData);

    // Avatars insert
    await Avatar.bulkCreate(avatarData);

    // Items insert
    await Item.bulkCreate(itemData);

    // Achievement insert
    await Achievement.bulkCreate(achievementData);
}

export async function down() {
    // Remove achievements
    await Achievement.destroy({ where: {} });

    // Remove items
    await Item.destroy({ where: {} });

    // Remove avatars
    await Avatar.destroy({ where: {} });

    // Remove categories
    await Category.destroy({ where: {} });
}
