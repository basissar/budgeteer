import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../../utils/macros.js";
import { Account  } from "../account.js";
import { ExpenseSummary } from "./expenseSummary.js";
import './dashboard.css'


export function Dashboard(){

    return (
        <div className="dash-container">
            <ExpenseSummary months={5} />
            <Account/>
        </div>
    );
}