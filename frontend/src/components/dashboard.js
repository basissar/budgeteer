import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../utils/macros";
import  './dashboard.css';
import { Avatar } from "./avatar.js";



export function Dashboard(){

    return (
        <div className="container">
                <Avatar/>             
        </div>
    );
}