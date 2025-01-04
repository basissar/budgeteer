import React, { useState } from "react";
import { Table, Modal, Button } from "flowbite-react";
import Icon from "../custom/icon";
import DeleteIcon from "../../assets/delete.svg?react";
import EditIcon from "../../assets/edit.svg?react";
import categoryTheme from "../../themes/categoryTable.json";
import CategoryForm from "../wallet/categoryForm";

export default function CategoryTable({ defaultCategories, customCategories, handleDeleteCategory, handleUpdateCategory }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [categoryToEdit, setCategoryToEdit] = useState(null);

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setCategoryToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            handleDeleteCategory(categoryToDelete.id);
        }
        closeDeleteModal();
    };

    const openEditModal = (category) => {
        setCategoryToEdit(category);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setCategoryToEdit(null);
        setIsEditModalOpen(false);
    };

    return (
        <>
            <Table theme={categoryTheme}>
                <Table.Head>
                    <Table.HeadCell>Custom Categories</Table.HeadCell>
                    <Table.HeadCell>Default Categories</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {Array.from(
                        { length: Math.max(customCategories.length, defaultCategories.length) },
                        (_, index) => (
                            <Table.Row key={index} className="bg-white">
                                <Table.Cell className="border-r border-gray-300">
                                    {customCategories[index] ? (
                                        <div className="flex flex-row items-center justify-between w-full">
                                            <div className="flex flex-row items-center">
                                                <Icon
                                                    id={customCategories[index].iconId}
                                                    className="mr-[5px]"
                                                    color={customCategories[index].color}
                                                />
                                                <p className="whitespace-nowrap text-gray-900">
                                                    {customCategories[index].name}
                                                </p>
                                            </div>
                                            <div className="flex flex-row">
                                                <EditIcon
                                                    style={{ transform: "scale(0.75)", transformOrigin: "center" }}
                                                    className="edit-icon cursor-pointer"
                                                    onClick={() => openEditModal(customCategories[index])}
                                                />
                                                <DeleteIcon
                                                    style={{ transform: "scale(0.75)", transformOrigin: "center" }}
                                                    className="delete-icon cursor-pointer"
                                                    onClick={() => openDeleteModal(customCategories[index])}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p></p>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    {defaultCategories[index] ? (
                                        <div className="flex flex-row items-center">
                                            <Icon
                                                id={defaultCategories[index].iconId}
                                                className="mr-[5px]"
                                                color={defaultCategories[index].color}
                                            />
                                            <p className="whitespace-nowrap text-gray-900">
                                                {defaultCategories[index].name}
                                            </p>
                                        </div>
                                    ) : (
                                        <p></p>
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        )
                    )}
                </Table.Body>
            </Table>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                <Modal.Header>Confirm Deletion</Modal.Header>
                <Modal.Body>
                    <p className="text-gray-500">
                        Are you sure you want to delete the category "
                        <span className="font-semibold">{categoryToDelete?.name}</span>"? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="light" onClick={closeDeleteModal}>
                        Cancel
                    </Button>
                    <Button color="failure" onClick={confirmDelete}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {isEditModalOpen && categoryToEdit && (
                <CategoryForm
                    walletId={categoryToEdit.walletId}
                    isModalOpen={isEditModalOpen}
                    closeModal={closeEditModal}
                    initialCategory={categoryToEdit}
                    setCustomCategories={handleUpdateCategory}
                />
            )}
        </>

    );
}
