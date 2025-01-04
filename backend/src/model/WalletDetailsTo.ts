import { Category } from "./Category.ts";

export class WalletDetailsTO {

    private _walletId: string;
    private _name: string;
    private _amount: number;
    private _currency: string;
    private _categories: Category[];

    public get walletId(): string {
        return this._walletId;
    }
    public set walletId(value: string) {
        this._walletId = value;
    }

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    public get amount(): number {
        return this._amount;
    }
    public set amount(value: number) {
        this._amount = value;
    }

    public get currency(): string {
        return this._currency;
    }
    public set currency(value: string) {
        this._currency = value;
    }

    public get categories(): Category[] {
        return this._categories;
    }
    public set categories(value: Category[]) {
        this._categories = value;
    }

}