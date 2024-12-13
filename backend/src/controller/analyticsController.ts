import { RouterContext } from "@oak/oak";
import { ANALYTICS_SERVICE, OK } from "../config/macros.ts";
import { AnalyticsService } from "../service/analyticsService.ts";
import { container } from "../utils/container.ts";

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor(){
        this.analyticsService = container.resolve(ANALYTICS_SERVICE);

        if (this.analyticsService == null){
            const newAnalyticsService = new AnalyticsService();
            container.register(ANALYTICS_SERVICE, newAnalyticsService)
            this.analyticsService = newAnalyticsService;
        }
    }

    async getSumNegativeForMonth(ctx: RouterContext<string>){
        const { userId , walletId } = ctx.params;

        const requestBody = await ctx.request.body.json();

        const date = requestBody.date;

        const passedDate = new Date(date);

        const sumNegative = await this.analyticsService.getSumNegativeForMonth(userId, passedDate,walletId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Sum for expenses retrived successfully",
            date: date,
            sum: sumNegative
        }        
    }

    async getSumPositiveForMonth(ctx: RouterContext<string>){
        const { userId , walletId} = ctx.params;

        const requestBody = await ctx.request.body.json();

        const date = requestBody.date;

        const passedDate = new Date(date);

        const sumPositive = await this.analyticsService.getSumPositiveForMonth(userId, passedDate,walletId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Sum for expenses retrived successfully",
            date: date,
            sum: sumPositive
        }  
    }

    async getSumNegativeForRange(ctx: RouterContext<string>){
        const { userId } = ctx.params;

        const requestBody = await ctx.request.body.json();

        const startDate = requestBody.startDate;
        const endDate = requestBody.endDate;
        const categoryId = requestBody.categoryId;

        const passedStart = new Date(startDate);
        const passedEnd = new Date(endDate);

        const sumNegative = await this.analyticsService.getSumNegativeForDateRange(userId, passedStart, passedEnd, categoryId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Sum for expenses retrived successfully",
            start: passedStart,
            end: passedEnd,
            sum: sumNegative
        }        
    }

    async getCurrentWalletBalance(ctx: RouterContext<string>){
        const { userId, walletId } = ctx.params;

        const sumMap = await this.analyticsService.getCurrentWalletBalance(userId, walletId);

        const sumMapObject = Object.fromEntries(sumMap);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Current walelt balance per category retrieved",
            sumMap: sumMapObject
        }
    }


}