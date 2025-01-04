import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../utils/macros.js";
import Credit from '../assets/credit.svg?react';
import { useUserContext } from "./security/userProvider";
import { AvatarWindow } from "./avatarOverview/avatarWindow";

export function Account() {
    const [account, setAccount] = useState(null);
    const [nextLevelXP, setXP] = useState(0);
    const [percentage, setPercentage] = useState(0);

    const { user } = useUserContext();

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

                const num = Math.round((currExperience / neededExperience) * 100);

                setPercentage(num);

            } catch (error) {
                console.error(error.message);
            }

        }

        fetchData();
    }, [user]);

    return (
        <div>
            <div className="flex flex-col justify-center items-center">
                <AvatarWindow />
                {account ? (
                    <>
                        <div id="username">{user && user.username}</div>
                        <div className="flex justify-center items-center"><p className="font-semibold mr-[5px] text-xl">{account.credits}</p>
                            <Credit alt="credit_icon" />
                        </div>
                    </>
                ) : (
                    <div>Loading...</div>
                )}
                <div className="flex flex-col justify-center items-center w-full h-full font-semibold">
                    <div className="flex items-center pl-[10px] pr-[10px] w-full rounded-xl">
                        <p>{account && account.level}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ml-[5%] mr-[5%]">
                            <div className="bg-dark-green h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>


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