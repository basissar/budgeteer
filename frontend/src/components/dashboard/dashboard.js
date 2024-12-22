import { Account } from "../account.js";
import { ExpenseSummary } from "./expenseSummary.js";
import { Datepicker } from "flowbite-react";

export function Dashboard() {

    return (
        <div class="container">
            <div class="row_container dashboard">
                <ExpenseSummary months={5} />
                <Account />
            </div>
        </div>

    );
}