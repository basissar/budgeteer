import { useState, useEffect } from "react";
import { Account } from "../account";
import axios from "axios";
import { INFO, API_BASE_URL } from "../../utils/macros";
import { Modal, Button } from "flowbite-react";  // Import Flowbite components

import './avatarOverview.css';

import blueFly from '../../assets/items/blue_fly.png';
import blueHat from '../../assets/items/blue_hat.png';
import goldenHat from '../../assets/items/golden_hat.png';
import greenFly from '../../assets/items/green_fly.png';
import greenHat from '../../assets/items/green_hat.png';
import purpleFly from '../../assets/items/purple_fly.png';
import redHat from '../../assets/items/red_hat.png';
import Achievements from "./achievements";
import { useUserContext } from "../security/userProvider";

const itemImages = {
    'blue_fly': blueFly,
    'blue_hat': blueHat,
    'golden_hat': goldenHat,
    'green_fly': greenFly,
    'green_hat': greenHat,
    'purple_fly': purpleFly,
    'red_hat': redHat,
};

export function AvatarOverview() {
    const [items, setItems] = useState([]);
    const [userId, setUserId] = useState('');
    const [avatarId, setAvatar] = useState(null);
    const [ownedItems, setOwnedItems] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { user, updateEquippedItems, equippedItems } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountResponse = await axios.get(`${API_BASE_URL}/${user.id}/account`, {
                    withCredentials: true
                });

                const avatarId = Number(accountResponse.data.account.avatar.id);
                setAvatar(avatarId);

                const itemResponse = await axios.get(`${API_BASE_URL}/avatars/${avatarId}`, {
                    withCredentials: true
                });

                const items = itemResponse.data.items;
                const ownedItems = accountResponse.data.account.ownedItems;

                const ownedItemIds = ownedItems.map(item => item.id);
                const availableItems = items.filter(item => !ownedItemIds.includes(item.id));

                setItems(availableItems);
                setOwnedItems(ownedItems);

                updateEquippedItems(
                    accountResponse.data.account.equippedItems.reduce((acc, item) => {
                        acc[item.type] = item;
                        return acc;
                    }, { hat: null, neck: null })
                );
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [user]);

    const handleBuyItem = async (itemId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${user.id}/buy/${itemId}`, {}, {
                withCredentials: true
            });

            const boughtItem = items.find(item => item.id === itemId);

            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
            setOwnedItems(prevOwnedItems => [...prevOwnedItems, boughtItem]);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setErrorMessage("You do not have enough credits to buy this item");
                setShowErrorModal(true);
            } else {
                console.error(err);
                setErrorMessage("An error occurred while buying the item");
                setShowErrorModal(true);
            }
        }
    };

    const handleEquipItem = async (item) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${user.id}/equip/${item.id}`, {}, {
                withCredentials: true
            });

            const newEquippedItems = { ...equippedItems, [item.type]: item };

            updateEquippedItems(newEquippedItems);
        } catch (err) {
            console.error(err);
            alert("An error occurred while equipping the item");
        }
    };

    const handleUnequipItem = async (item) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${user.id}/unequip/${item.id}`, {}, {
                withCredentials: true
            });

            const newEquippedItems = { ...equippedItems, [item.type]: null };

            updateEquippedItems(newEquippedItems);
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
        <div className="flex flex-col items-center mt-10">
            <div className="flex flex-row items-center gap-4">
                <div className="max-w-[300px]">
                    <Account />
                </div>
                <div>
                    <Achievements userId={userId} />
                </div>
            </div>
            <div className="flex flex-col w-1/2 mr-[5%]">
                <div className="mb-[20px] flex flex-col items-center">
                    <h2>Owned Items</h2>
                    {ownedItems.length === 0 ? (
                        <p>You don't own any items yet</p>
                    ) : (
                        <div className="flex flex-row gap-4">
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
                    )}
                </div>

                <div className="flex flex-col items-center gap-3">
                    <h2>Unlocked Items</h2>
                    <div className="flex flex-row gap-4">
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

            <Modal show={showErrorModal} onClose={() => setShowErrorModal(false)} size="sm">
                <Modal.Body>
                    <p>{errorMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button color='light' onClick={() => setShowErrorModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
