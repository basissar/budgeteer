import { Op } from "npm:sequelize";

export class SumSearchParameters {
    private _walletId?: string;
    private _amountCondition?: { [key: symbol]: number };
    private _startDate?: Date;
    private _endDate?: Date;
    private _targetCategoryId?: number | null;
    private _sourceCategoryId?: number | null;

    get walletId(): string | undefined {
        return this._walletId;
    }

    set walletId(value: string | undefined) {
        if (value && value.trim() === "") {
            throw new Error("Wallet ID cannot be an empty string.");
        }
        this._walletId = value;
    }

    get amountCondition(): { [key: symbol]: number } | undefined {
        return this._amountCondition;
    }

    set amountCondition(value: boolean | undefined) {
        if (value !== undefined) {
            this._amountCondition = value
                ? { [Op.gt]: 0 }
                : { [Op.lt]: 0 };
        }
    }

    get startDate(): Date | undefined {
        return this._startDate;
    }

    set startDate(value: Date | undefined) {
        this._startDate = value;
        this._validateDateRange();
    }

    get endDate(): Date | undefined {
        return this._endDate;
    }

    set endDate(value: Date | undefined) {
        this._endDate = value;
        this._validateDateRange();
    }

    get targetCategoryId(): number | null | undefined {
        return this._targetCategoryId;
    }

    set targetCategoryId(value: number | null | undefined) {
        this._targetCategoryId = value;
    }

    get sourceCategoryId(): number | null | undefined {
        return this._sourceCategoryId;
    }

    set sourceCategoryId(value: number | null | undefined) {
        this._sourceCategoryId = value;
    }

    private _validateDateRange() {
        if (this._startDate && this._endDate && this._startDate > this._endDate) {
            throw new Error("Start date cannot be after end date.");
        }
    }

    toWhereClause(): any {
        const whereClause: any = {};

        if (this.walletId) {
            whereClause.walletId = this.walletId;
        }

        if (this.amountCondition) {
            whereClause.amount = this.amountCondition;
        }

        if (this.startDate && this.endDate) {
            whereClause.date = {
                [Op.between]: [this.startDate, this.endDate],
            };
        }

        if (this.targetCategoryId !== undefined) {
            whereClause.targetCategoryId = this.targetCategoryId;
        }

        if (this.sourceCategoryId !== undefined) {
            whereClause.sourceCategoryId = this.sourceCategoryId;
        }

        return whereClause;
    }
}
