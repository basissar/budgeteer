import { useState } from "react";
import { Modal, Button, TextInput } from "flowbite-react";
import { SketchPicker } from 'react-color';
import Icon from "../custom/icon";
import axios from "axios";
import { API_BASE_URL } from "../../utils/macros";

const CategoryForm = ({ walletId, isModalOpen, closeModal, setCustomCategories}) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [newCategoryIcon, setNewCategoryIcon] = useState(null);

    const handleColorChange = (color) => {
        setSelectedColor(color.hex);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || !walletId || !newCategoryIcon) return;

        try {
            const newCategory = {
                name: newCategoryName,
                walletId: walletId,
                color: selectedColor,
                iconId: newCategoryIcon,
            };

            const response = await axios.post(`${API_BASE_URL}/categories/${walletId}`, newCategory, {
                withCredentials: true,
            });

            setCustomCategories(response.data.category);

            closeModal();
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    return (
        <Modal show={isModalOpen} onClose={closeModal}>
            <Modal.Header>Create Custom Category</Modal.Header>
            <Modal.Body>
                <div className="flex flex-row gap-20">
                    <div className="flex flex-col items-center gap-4">
                        <TextInput class="focus:border-green-500 focus:ring-green-500 h-10" type='text'
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category Name"
                            required />

                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 23 - 12 + 1 }, (_, index) => {
                                const id = 12 + index;
                                return (
                                    <div
                                        key={id}
                                        className="flex justify-center items-center hover:bg-gray-100 w-10 h-10 border rounded shadow-lg transition-shadow duration-200 focus:outline-none focus:border-gray-800"
                                        onClick={() => setNewCategoryIcon(id)}
                                        tabIndex={0}
                                    >
                                        <Icon id={id} color={selectedColor} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <SketchPicker
                            color={selectedColor}
                            onChange={handleColorChange}
                            disableAlpha={true}
                        />
                    </div>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button color="gray" onClick={closeModal}>
                    Close
                </Button>
                <Button className="bg-dark-green" onClick={handleCreateCategory}>
                    Create Category
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryForm;