import { useState } from "react";
import { Modal, Button, TextInput } from "flowbite-react";
import { SketchPicker } from 'react-color';
import Icon from "../custom/icon";
import axios from "axios";
import { API_BASE_URL } from "../../utils/macros";

const CategoryForm = ({ walletId, isModalOpen, closeModal, setCustomCategories, initialCategory = null }) => {
    const [newCategoryName, setNewCategoryName] = useState(initialCategory?.name || '');
    const [selectedColor, setSelectedColor] = useState(initialCategory?.color || "#000000");
    const [newCategoryIcon, setNewCategoryIcon] = useState(initialCategory?.iconId || null);

    const handleColorChange = (color) => {
        setSelectedColor(color.hex);
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim() || !walletId || !newCategoryIcon) return;

        try {
            const categoryData = {
                name: newCategoryName,
                walletId: walletId,
                color: selectedColor,
                iconId: newCategoryIcon,
            };

            if (initialCategory) {
                const response = await axios.put(
                    `${API_BASE_URL}/categories/${initialCategory.id}`,
                    categoryData,
                    { withCredentials: true }
                );
                setCustomCategories(response.data.category);
            } else {
                const response = await axios.post(
                    `${API_BASE_URL}/categories/${walletId}`,
                    categoryData,
                    { withCredentials: true }
                );
                setCustomCategories(response.data.category);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    return (
        <Modal show={isModalOpen} onClose={closeModal}>
            <Modal.Header>{initialCategory ? "Edit Category" : "Create Custom Category"}</Modal.Header>
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
                                const isSelected = newCategoryIcon === id;
                                return (
                                    <div
                                        key={id}
                                        className={`flex justify-center items-center w-10 h-10 border rounded shadow-lg transition-shadow duration-200 hover:bg-gray-100 ${isSelected ? "border-gray-800" : "border-transparent"
                                            }`}
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
                <Button className="bg-dark-green" onClick={handleSaveCategory}>
                    {initialCategory ? "Update Category" : "Create Category"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryForm;