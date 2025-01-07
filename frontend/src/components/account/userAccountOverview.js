import { useUserContext } from "../security/userProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/macros";
import { useState } from "react";
import { AvatarWindow } from "../avatarOverview/avatarWindow";
import { Button, TextInput } from "flowbite-react";

export function UserAccountOverview() {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    // Local state for inputs
    const [email, setEmail] = useState(user?.email || "");
    const [username, setUsername] = useState(user?.username || "");

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/user/logout`, {}, { withCredentials: true });

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
            }, { withCredentials: true });

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
            <div className="flex flex-col justify-center items-center">
                <AvatarWindow />
                <div className="flex flex-col justify-center items-center">
                    <div>
                        <div>Current username: {user && user.username}</div>
                        <div>Current email: {user && user.email}</div>
                    </div>


                    <div className="flex flex-row items-center gap-4 mt-5">
                        <div className="flex flex-row items-center gap-2">
                            New email:
                            <div className="max-w-44">
                                <TextInput type="email" placeholder={user.email} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            New username:
                            <div className="max-w-44">
                                <TextInput type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={user.username} />
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-row items-center gap-5 mt-10">
                        <Button color="light" onClick={handleLogout}>Logout</Button>
                        <Button color="light" onClick={handleEdit}>Save changes</Button>
                        <Button color="failure" onClick={handleDelete}>Delete Profile</Button>
                    </div>
                </div>

            </div>

        </div>
    )
}