import { useEffect, useState } from "react";
import { Account } from "../account";
import axios from "axios";
import { INFO , API_BASE_URL} from "../../utils/macros";

import './avatarOverview.css';

import blueFly from '../../assets/items/blue_fly.png';
import blueHat from '../../assets/items/blue_hat.png';
import goldenHat from '../../assets/items/golden_hat.png';
import greenFly from '../../assets/items/green_fly.png';
import greenHat from '../../assets/items/green_hat.png';
import purpleFly from '../../assets/items/purple_fly.png';
import redHat from '../../assets/items/red_hat.png';
import Achievements from "../achievements";

const itemImages = {
    'blue_fly': blueFly,
    'blue_hat': blueHat,
    'golden_hat': goldenHat,
    'green_fly': greenFly,
    'green_hat': greenHat,
    'purple_fly': purpleFly,
    'red_hat': redHat,
};

console.log('Item Images:', itemImages); // Log the item images paths

export function AvatarOverview(){
    const [items, setItems] = useState([]);
    const [userId, setUserId] = useState('');
    const [avatarId, setAvatar] = useState(null);
    const [ownedItems, setOwnedItems] = useState([]);
    const [equippedItems, setEquippedItems] = useState({ hat: null, neck: null });

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

                const accountResponse = await axios.get(`${API_BASE_URL}/${userResponse.data.user.id}/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const avatarId = Number(accountResponse.data.account.avatar.id);
                setAvatar(avatarId);

                const itemResponse = await axios.get(`${API_BASE_URL}/avatars/${avatarId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const items = itemResponse.data.items;
                const ownedItems = accountResponse.data.account.ownedItems;
                const equippedItems = accountResponse.data.account.equippedItems.reduce((acc, item) => {
                    acc[item.type] = item;
                    return acc;
                }, { hat: null, neck: null });

                // Filter items into owned and available
                const ownedItemIds = ownedItems.map(item => item.id);
                const availableItems = items.filter(item => !ownedItemIds.includes(item.id));

                setItems(availableItems);
                setOwnedItems(ownedItems);
                setEquippedItems(equippedItems);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleBuyItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/${userId}/buy/${itemId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Find the bought item
            const boughtItem = items.find(item => item.id === itemId);

            // Update the state
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
            setOwnedItems(prevOwnedItems => [...prevOwnedItems, boughtItem]);

            // alert(response.data.message);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                alert("You do not have enough credits to buy this item");
            } else {
                console.error(err);
                alert("An error occurred while buying the item");
            }
        }
    };

    const handleEquipItem = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/${userId}/equip/${item.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newEquippedItems = { ...equippedItems, [item.type]: item };
            setEquippedItems(newEquippedItems);

            // alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert("An error occurred while equipping the item");
        }
    };

    const handleUnequipItem = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/${userId}/unequip/${item.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newEquippedItems = { ...equippedItems, [item.type]: null };
            setEquippedItems(newEquippedItems);

            // alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert("An error occurred while unequipping the item");
        }
    };
    
    const getItemClass = (item) => {
        if (item.type === 'hat') {
            return 'item hat';
        } else if (item.type === 'neck') {
            return 'item neck';
        } else {
            return 'item';
        }
    };

    return (
        <div className="container">
            <div className="avatar-container">
                <div className="avatar">
                    <Account />
                    {equippedItems.hat && <img className="equipped-item hat" src={itemImages[equippedItems.hat.item_img]} alt={equippedItems.hat.name} />}
                    {equippedItems.neck && <img className="equipped-item neck" src={itemImages[equippedItems.neck.item_img]} alt={equippedItems.neck.name} />}
                </div>
                <div>
                    <Achievements userId={userId}/>
                </div>
            </div>
            <div className="items-container">
                <div className="item-section">
                    <h2>Owned Items</h2>
                    <div className="item-list">
                        {ownedItems.map((item) => (
                            <div key={item.id} className={getItemClass(item)}>
                                <img src={itemImages[item.item_img]} alt={item.name} onError={(e) => { e.target.src = 'fallback_image_path' }} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>Price: {item.price}</p>
                                    <p>Rarity: {item.rarity}</p>
                                    {equippedItems[item.type]?.id === item.id ? (
                                        <button onClick={() => handleUnequipItem(item)}>Unequip</button>
                                    ) : (
                                        <button onClick={() => handleEquipItem(item)}>Equip</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="item-section">
                    <h2>Unlocked Items</h2>
                    <div className="item-list">
                        {items.map((item) => (
                            <div key={item.id} className={getItemClass(item)}>
                                <img src={itemImages[item.item_img]} alt={item.name} onError={(e) => { e.target.src = 'fallback_image_path' }} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>Price: {item.price}</p>
                                    <p>Rarity: {item.rarity}</p>
                                    <button onClick={() => handleBuyItem(item.id)}>Buy</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
    
}