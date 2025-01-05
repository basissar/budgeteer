import { Achievement } from "../src/model/Achievement.ts";

const achievementData = [
    { name: "First Expense", description: "Log your first expense.", quote: "A journey of a thousand miles begins with a single step.", gainedCredits: 10, gainedXp: 50, categoryId: 1, targetCount: 1, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Entertainment Enthusiast", description: "Log 10 expenses on entertainment.", quote: "Life is more fun if you play games.", gainedCredits: 15, gainedXp: 75, categoryId: 2, targetCount: 10, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Gourmet", description: "Log 5 expenses on food.", quote: "Good food is good mood.", gainedCredits: 20, gainedXp: 100, categoryId: 3, targetCount: 5, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Student Saver", description: "Log 3 school expenses.", quote: "Education is the key to success.", gainedCredits: 10, gainedXp: 50, categoryId: 4, targetCount: 3, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Commuter", description: "Log 5 expenses on transport.", quote: "Travel is the only thing you buy that makes you richer.", gainedCredits: 15, gainedXp: 75, categoryId: 5, targetCount: 5, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Shopaholic", description: "Log 10 expenses on shopping.", quote: "Shopping is cheaper than therapy.", gainedCredits: 40, gainedXp: 150, categoryId: 6, targetCount: 10, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Health Advocate", description: "Log 8 expenses on healthcare.", quote: "Health is wealth.", gainedCredits: 25, gainedXp: 100, categoryId: 7, targetCount: 8, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Homeowner", description: "Log 5 expenses on housing.", quote: "Home is where our story begins.", gainedCredits: 35, gainedXp: 125, categoryId: 8, targetCount: 5, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Pet Lover", description: "Log 4 expenses on pets.", quote: "Pets are humanizing.", gainedCredits: 15, gainedXp: 75, categoryId: 9, targetCount: 4, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Traveler", description: "Log 8 expenses on travel.", quote: "Travel is the only thing you buy that makes you richer.", gainedCredits: 30, gainedXp: 125, categoryId: 10, targetCount: 8, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Subscription Savvy", description: "Log 10 expenses on subscriptions.", quote: "Subscriptions are a key to access.", gainedCredits: 20, gainedXp: 100, categoryId: 11, targetCount: 10, type: 'expense', createdAt: new Date(), updatedAt: new Date() },
    { name: "Budget Keeper", description: "Stay within your first budget.", quote: "Discipline is the bridge between goals and accomplishment.", gainedCredits: 50, gainedXp: 150, categoryId: 1, targetCount: 1, type: 'budget', createdAt: new Date(), updatedAt: new Date() },
    { name: "Goal Achiever", description: "Complete 5 goals.", quote: "Dream big, achieve bigger.", gainedCredits: 50, gainedXp: 200, categoryId: 2, targetCount: 5, type: 'goal', createdAt: new Date(), updatedAt: new Date() }
];

export async function up() {
    // Remove old achievements
    await Achievement.destroy({ where: {} });

    // Insert new achievements
    await Achievement.bulkCreate(achievementData);
}

export async function down() {
    // Remove new achievements
    await Achievement.destroy({ where: {} });

    // Optionally, reinsert the old achievements if you want to roll back to the previous state.
    const oldAchievementData = [
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

    await Achievement.bulkCreate(oldAchievementData);
}
