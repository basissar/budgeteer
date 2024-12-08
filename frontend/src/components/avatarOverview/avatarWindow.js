import {useEffect, useState} from "react";
import {useUserContext} from "../security/userProvider";
import axios from "axios";
import {API_BASE_URL} from "../../utils/macros";


export function AvatarWindow() {
    const [avatarId, setAvatarId] = useState(null);
    const [avatarName, setAvatarName] = useState("");

    const { user, equippedItems, updateEquippedItems } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const accountResponse = await axios.get(`${API_BASE_URL}/${user.id}/account`, {
                    withCredentials: true
                });

                setAvatarId(accountResponse.data.account.avatarId);
                setAvatarName(accountResponse.data.account.avatar.name);
            } catch (error) {
                console.error(error.message);
            }
        }

        fetchData();
    }, [user, equippedItems]);


    const getAvatarImage = (avatarId) => {
        return require('../../assets/avatars/' + avatarId+'.png');
    }

    const getItemImage = (itemImageName) => {
        try {
            return require(`../../assets/items/${itemImageName}.png`);
        } catch (error) {
            //
        }
    };

    return (
        <div className="avatar-container">
                    <div className="image_container">
                        <img src={avatarId && getAvatarImage(avatarId)} alt={avatarName} />
                        {equippedItems.hat && <img className="equipped-item hat" src={equippedItems.hat.item_img && getItemImage(equippedItems.hat.item_img)} alt={equippedItems.hat.name} />}
                        {equippedItems.neck && <img className="equipped-item neck" src={equippedItems.neck.item_img && getItemImage(equippedItems.neck.item_img)} alt={equippedItems.neck.name} />}
                    </div>
        </div>
    )
}