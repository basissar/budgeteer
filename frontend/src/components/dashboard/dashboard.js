import { Account } from "../account.js";
import { useUserContext } from "../security/userProvider.js";
import { ExpenseSummary } from "./expenseSummary.js";
import { Datepicker } from "flowbite-react";
import { Link } from 'react-router-dom';

export function Dashboard() {

    const { wallets } = useUserContext();

    if (wallets.length === 0) {
        return (
            <div class="container">
                <div class="row_container dashboard">
                    <div className="mr-[50px]">
                        You don't have any wallets yet. Create one <Link to="/wallets">here</Link>.
                    </div>
                    <Account />
                </div>
            </div>

        );
    } else {
        return (
            <div class="container">
                <div class="row_container dashboard">
                    <div className="mr-[200px]">
                        <ExpenseSummary selectedRange={'x'} count={5} height={250} width={600} />
                    </div>
                    <Account />
                </div>
            </div>

        );
    }


}