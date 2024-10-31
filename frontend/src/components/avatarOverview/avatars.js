import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, INFO } from '../../utils/macros';

import av1 from '../../assets/avatars/1.png';
import av2 from '../../assets/avatars/2.png';


const avatarImages = [
    av1, av2
]

export default function Avatars() {
    const [avatars, setAvatars] = useState([]);
    const [userId, setUserId] = useState('');
    const [account, setAccount] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(INFO, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                setUserId(userResponse.data.user.id);

                const avatarResponse = await axios.get(`${API_BASE_URL}/avatars`, {
                    headers: { Authorization: `Bearer ${token}`}
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
            const token = localStorage.getItem('token');
            const accountResponse = await axios.post(`${API_BASE_URL}/${userId}/account`, {
                avatarId: avatarId
            },
            {
                headers: { Authorization: `Bearer ${token}`}
            });

            console.log(accountResponse.data.account);
            setAccount(accountResponse.data.account);

        } catch (err) {
            console.error(err);
        }

    }

    return (
        <div className='container'>
            <h2>Avatars</h2>
            <ul>
                {avatars.map(avatar => (
                    <li key={avatar.id}>
                        {/* Render the avatar name and description */}
                        {avatar.name} {avatar.description}
                        
                        {/* Render the avatar image */}
                        <img src={avatarImages[avatar.id - 1]} alt={avatar.name} />
                        <button onClick={() => handleChoice(avatar.id)}> Choose {avatar.name} </button>
                    </li>
                ))}
            </ul>
            
        </div>
    );
}