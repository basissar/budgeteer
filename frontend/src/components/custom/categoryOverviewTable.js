import React from "react";
import { Table } from "flowbite-react";
import Icon from "../custom/icon";
import DeleteIcon from "../../assets/delete.svg?react";
import categoryTheme from "../../themes/categoryTable.json";

export default function CategoryTable({ defaultCategories, customCategories, handleDeleteCategory }) {
    return (
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
                                    <div className="flex flex-row items-center">
                                        <Icon
                                            id={customCategories[index].iconId}
                                            className="mr-[5px]"
                                            color={customCategories[index].color}
                                        />
                                        <p className="whitespace-nowrap text-gray-900">
                                            {customCategories[index].name}
                                        </p>
                                        <DeleteIcon
                                            className="delete-icon"
                                            onClick={() => handleDeleteCategory(customCategories[index].id)}
                                        />
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
    );
}
