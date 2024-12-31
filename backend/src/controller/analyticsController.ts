import { RouterContext } from "@oak/oak";
import { AnalyticsService } from "../service/analyticsService.ts";
import { SumSearchParameters } from "../repository/sumSearchParams.ts";
import { OK } from "../config/macros.ts";

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Retrieves current balance per category
     * @param ctx
     */
    async getBallancePerCategory(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const sumMap = await this.analyticsService.getCategoryBalances(walletId);

        const sumMapObject = Object.fromEntries(sumMap);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Current walelt balance per category retrieved",
            sumMap: sumMapObject
        }
    }

    /**
     * Retrieves current total wallet balance
     * @param ctx 
     */
    async getTotalWalletBalance(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const totalSum = await this.analyticsService.getTotalWalletBalance(walletId);

        ctx.response.status = OK;
        ctx.response.body = {
            message: "Total wallet balance retrieved",
            sum: totalSum
        }
    }

    /**
     * Retrieves incomes and expenses per category
     * @param ctx 
     */
    async getSumsForDateRange(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const params = ctx.request.url.searchParams;

        const searchParams = this.mapSearchParameters(params);

        searchParams.walletId = walletId;

        const serviceMaps = await this.analyticsService.getSumsForDateRangePerCategory(searchParams);

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

    /**
     * Retrieves expenses sum from search parameters
     * @param ctx 
     */
    async sumAction(ctx: RouterContext<string>) {
        const { walletId } = ctx.params;

        const parameters = ctx.request.url.searchParams;

        const sumSearchParams = this.mapSearchParameters(parameters);

        sumSearchParams.walletId = walletId;

        const sumResult = await this.analyticsService.getExpenseSum(sumSearchParams);

        ctx.response.status = OK;
        ctx.response.body = {
            result: sumResult.result,
            messages: sumResult.messages
        }
    }

    /**
     * Maps neccesary parameters for sum retrieval
     * @param searchParameters 
     * @returns 
     */
    private mapSearchParameters(searchParameters: URLSearchParams): SumSearchParameters {
        const params = new SumSearchParameters();

        const amountCondition = searchParameters.get('amountCondition') === 'true';
        const startDate = searchParameters.has('startDate') ? new Date(searchParameters.get('startDate')!) : undefined;
        const endDate = searchParameters.has('endDate') ? new Date(searchParameters.get('endDate')!) : undefined;

        const targetCategoryId = searchParameters.has('targetCategoryId')
            ? searchParameters.get('targetCategoryId') === "null"
                ? null
                : Number(searchParameters.get('targetCategoryId'))
            : undefined;

        const sourceCategoryId = searchParameters.has('sourceCategoryId')
            ? searchParameters.get('sourceCategoryId') === "null"
                ? null
                : Number(searchParameters.get('sourceCategoryId'))
            : undefined;

        params.amountCondition = amountCondition;
        params.startDate = startDate;
        params.endDate = endDate;
        params.targetCategoryId = targetCategoryId;
        params.sourceCategoryId = sourceCategoryId;

        return params;
    }

}