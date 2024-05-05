import { CATEGORY_REPOSITORY } from "../config/macros.ts";
import { container } from "./container.ts";
import { Category } from "../model/Category.ts";
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


export async function saveDefaultCategories(){
    const catRep = container.resolve(CATEGORY_REPOSITORY);

    if (catRep == null) {
        const catRep = new CategoryRepository();
        container.register(CATEGORY_REPOSITORY, catRep);
    }


    // Loop through categories data and save each category
    for (const categoryData of categoriesData) {
        const category = new Category(categoryData);

        console.log(category);

        const savedCategory = await catRep.save(category);

        console.log(savedCategory);
        if (savedCategory) {
            console.log(`Category "${savedCategory.name}" saved successfully.`);
        } else {
            console.log(`Failed to save category "${category.name}".`);
        }
    }
}