import {RouterContext} from "https://deno.land/x/oak@v12.6.1/router.ts";
import {Category} from "../model/Category.ts";
import {categoryRepo} from "../repository/categoryRepo.ts";
import {BAD_REQUEST, CREATED, INTERNAL_ERROR, OK} from "../config/macros.ts";

// import {categoryService} from "../service/categoryService.ts";

/*
export async function createCategory(ctx: RouterContext<string>){
    try {
        const requestBody = await ctx.request.body().value;

        const passedCategory = requestBody.valueOf();

        if (!passedCategory.id || !passedCategory.name){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "Id and name is required"};
            return
        }

        const newCategory: Category = { id: passedCategory.id,
            name: passedCategory.name,
            userId: passedCategory.userId
        };

        const createdCategory = await categoryService.createCategory(newCategory);

        ctx.response.status = CREATED;
        ctx.response.body = {
            message: "Category created",
            category: createdCategory
        }
    } catch (error){
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}

export async function getAllCategories(ctx: RouterContext<string>){
    try {

        // returns all categories, both default and user created
        //const categories = await categoryRepo.getAllCategories();

        //returns only default categories
        const categories = await categoryService.getAllCategories();

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Categories retrieved",
            categories: categories}
    } catch (error) {
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }

}

export async function getAllCategoriesForUser(ctx: RouterContext<string>){
    try{
        const id  = Number(ctx.params);

        if (!id){
            ctx.response.status = BAD_REQUEST;
            ctx.response.body = { message: "Id is required"};
            return;
        }

        const categories = await categoryService.getAllForUser(id);

        ctx.response.status = OK;

        ctx.response.body = {
            message: "Categories retrieved",
            categories: categories
        }

    } catch (error){
        ctx.response.status = INTERNAL_ERROR;
        ctx.response.body = { message: error };
    }
}
*/