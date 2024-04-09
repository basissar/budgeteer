import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const { username } = useParams();

    useEffect(() => {
        // Fetch user data based on the username from the URL
        fetchUserData();
    }, [username]);

    const fetchUserData = async () => {

        if(!userData){
            try {
                // Assuming you have an endpoint to fetch user data by username, adjust the URL accordingly
                const response = await fetch(`http://localhost:8000/budgeteer/users/${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
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
            {/* Other user details */}
        </div>
    );
}

export default UserProfile;