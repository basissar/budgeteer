import { RouterContext } from "@oak/oak";
import { ANALYTICS_SERVICE, OK } from "../config/macros.ts";
import { AnalyticsService } from "../service/analyticsService.ts";
import { container } from "../utils/container.ts";

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService){
        this.analyticsService = analyticsService;
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

        const sumNegative = await this.analyticsService.getTotalNegativeSumPerCategory(userId, passedStart, passedEnd, categoryId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Sum for expenses retrived successfully",
            start: passedStart,
            end: passedEnd,
            sum: sumNegative
        }        
    }

    //TODO rename to getBallancePerCategory
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

    async getTotalWalletBalance(ctx: RouterContext<string>){
        const {walletId} = ctx.params;

        const totalSum = await this.analyticsService.getTotalWalletBalance(walletId);
        
        ctx.response.status = OK;
        ctx.response.body = {
            message: "Total wallet balance retrieved",
            sum: totalSum
        }
    }

    async getSumsForDateRange(ctx: RouterContext<string>){
        const {walletId, startDate, endDate} = ctx.params;

        const userId = await ctx.cookies.get("user_id");
        
        const serviceMaps = await this.analyticsService.getSumsForDateRange(userId!, walletId, new Date(startDate), new Date(endDate));
        
        const positiveSumMap = Object.fromEntries(serviceMaps.positiveSumMap);
        const negativeSumMap = Object.fromEntries(serviceMaps.negativeSumMap);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Sums for date range retrieved",
            sumMaps: {
                positiveSumMap,
                negativeSumMap
            }
        }
    }

}