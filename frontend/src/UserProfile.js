import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const { username } = useParams();

    useEffect(() => {
        fetchUserData();
    }, [username]);

    const fetchUserData = async () => {

        if(!userData){
            try {
                const response = await fetch(`http://localhost:8000/budgeteer/users/${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }        
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Profile</h1>
            <p>Username: {userData.user.username}</p>
            <p>Email: {userData.user.email}</p>
        </div>
    );
}

export default UserProfile;