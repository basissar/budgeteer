import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../utils/macros.js";
import  './avatarOverview/avatar.css';
import {ProgressBar} from './custom/progressBar.js';
import credit from '../assets/credit.svg';

import av1 from '../assets/avatars/1.png';
import av2 from '../assets/avatars/2.png';
import {useUserContext} from "./security/userProvider";


const avatarImages = [
    av1, av2
]

export function Account(){
    const [account, setAccount] = useState(null);
    const [nextLevelXP, setXP] = useState(0);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [percentage, setPercentage] = useState(0);

    const {user} = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                return;
            }

            try {

                const accountResponse = await axios.get(`${API_BASE_URL}/${user.id}/account`, {
                    withCredentials: true
                });

                setAccount(accountResponse.data.account);
                setXP(accountResponse.data.neededXP);

                const currExperience = accountResponse.data.account.experience;
                const neededExperience = accountResponse.data.neededXP;

                const num = Math.round((currExperience/neededExperience)*100);

                setPercentage(num);

            } catch (error) {
                console.error(error.message);
            }
        
        }

        fetchData();
    }, [user]);

    return (
        <div className="account_container">
            <div className="accountInfo">
            <div className="image_container">
                <img src={account && avatarImages[account.avatar.id - 1]} alt={account && account.avatar.name} />
            </div>
            {account ? (
                <>
                    <div id="username">{username}</div>
                    <div className="creds"><p>{account.credits}</p> <img src={credit} alt="credit_icon"/></div>
                </>
            ) : (
                <div>Loading...</div>
            )}
            <div className="levelInfo_container">
                <div className="levelInfo">
                    <p>{account && account.level}</p>
                    <ProgressBar percentage={percentage} color="#26692A" />
                    <p>{account && account.level + 1}</p>
                </div>
                <div>
                    {account && account.experience} / {nextLevelXP} XP
                </div>
            </div>   

            </div>      
             
        </div>
    );
}