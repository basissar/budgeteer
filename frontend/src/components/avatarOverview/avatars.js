import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, INFO } from '../../utils/macros';

import av1 from '../../assets/avatars/1.png';
import av2 from '../../assets/avatars/2.png';
import { useUserContext } from '../security/userProvider';
import { Button } from 'flowbite-react';
import Error from '../custom/error';


const avatarImages = [
    av1, av2
]

export default function Avatars() {
    const [avatars, setAvatars] = useState([]);
    const [account, setAccount] = useState('');
    const navigate = useNavigate();

    const { user } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const avatarResponse = await axios.get(`${API_BASE_URL}/avatars`, {
                    withCredentials: true
                });

                setAvatars(avatarResponse.data.avatars);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();

    }, []);

    const handleChoice = async (avatarId) => {
        try {
            const accountResponse = await axios.post(`${API_BASE_URL}/${user.id}/account`, {
                avatarId: avatarId
            },
                {
                    withCredentials: true
                });

            console.log(accountResponse.data.account);
            setAccount(accountResponse.data.account);

            navigate("/");

        } catch (err) {
            console.error(err);
        }

    }

    return (
        <div className='flex flex-col items-center mt-10'>
            <h2>Avatars</h2>

            <div className="flex flex-row items-center">
                {avatars.map((avatar) => (
                    <div key={avatar.id} className="flex flex-col items-center mx-4">
                        <span>{avatar.name}</span>
                        <span>{avatar.description}</span>
                        <img src={avatarImages[avatar.id - 1]} alt={avatar.name} />
                        <Button color="light" onClick={() => handleChoice(avatar.id)}>
                            Choose {avatar.name}
                        </Button>
                    </div>
                ))}
            </div>

            <Error message={'Please note that once chosen avatar cannot be changed'} type={'alert'}/>

        </div>
    );
}