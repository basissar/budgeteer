import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../utils/macros";
import { Account  } from "./account.js";



export function Dashboard(){

    return (
        <div className="container">
                <Account/>             
        </div>
    );
}