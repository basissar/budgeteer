import { useUserContext } from "../security/userProvider";
import {useNavigate} from "react-router-dom";
import axios from "axios";

export function UserAccountOverview() {
    const { setUser } = useUserContext();
    const navigate = useNavigate();

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

    }

    const handleDelete = async () => {

    }

    return (
        <div>
            <h2>Account Overview</h2>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleEdit}>Edit Profile</button>
            <button onClick={handleDelete}>Delete Profile</button>
        </div>
    )
}