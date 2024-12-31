import { SumSearchParameters } from "../repository/sumSearchParams.ts";
import { Message } from "./errorMessage.ts";

export class Validator {

    private DATE_RANGE = "Invalid date range.";

    validate(searchParams: SumSearchParameters, messages: Message[]){
        if (searchParams.startDate && searchParams.endDate){
            this.validateDate(searchParams.startDate, searchParams.endDate, messages);
        }
    }

    validateDate(startDate: Date, endDate: Date, messages: Message[]){
        if (startDate > endDate) {
            messages.push(new Message(this.DATE_RANGE, 'invalid.daterange'));
        }
    }


}