import { useUserContext } from "../security/userProvider";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {API_BASE_URL} from "../../utils/macros";
import {useState} from "react";
import {AvatarWindow} from "../avatarOverview/avatarWindow";

export function UserAccountOverview() {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    // Local state for inputs
    const [email, setEmail] = useState(user?.email || "");
    const [username, setUsername] = useState(user?.username || "");

    const endpoint = 'http://localhost:8000/budgeteer/user/logout'

    const handleLogout = async () => {
        try {
            await axios.post(endpoint, {}, {withCredentials: true });

            setUser(null);

            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }

    const handleEdit = async () => {
        try {
            const updateResponse = await axios.post(`${API_BASE_URL}/user/update`, {
                username,
                email,
            }, {withCredentials: true });

            setUser((prevUser) => ({
                ...prevUser,
                email,
                username,
            }));

        } catch (e) {
            console.error(e);
        }
    }

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
        if (!confirmDelete) {
            return;
        }

        try {
            const deleteResponse = await axios.delete(`${API_BASE_URL}/users`, {
                withCredentials: true
            });

            setUser(null);

            navigate('/');

        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div>
            <h2>Account Overview</h2>
            <AvatarWindow/>
            <input type="email"
                   value={email} // Controlled input for email
                   onChange={(e) => setEmail(e.target.value)} // Update local state
                   placeholder={user.email}/>
            <input type="text"
                   value={username} // Controlled input for username
                   onChange={(e) => setUsername(e.target.value)} // Update local state
                   placeholder={user.username}/>
            <div> {user && user.username}</div>
            <div> {user && user.email}</div>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleEdit}>Edit Profile</button>
            <button onClick={handleDelete}>Delete Profile</button>
        </div>
    )
}