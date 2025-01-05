import { Table } from 'flowbite-react';
import { ProgressBar } from '../custom/progressBar';
import Icon from '../custom/icon';
import categoryTheme from "../../themes/categoryTable.json"
import { Modal, TextInput, Button } from 'flowbite-react';
import { useState } from 'react';

const BudgetTable = ({ budgets, currentWalletCurrency, handleEditBudget, handleDeleteBudget }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);

    const openModal = (budget) => {
        setSelectedBudget({ ...budget });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBudget(null);
    };

    const handleSaveChanges = () => {
        handleEditBudget(selectedBudget);
        closeModal();
    };

    const handleDelete = () => {
        handleDeleteBudget(selectedBudget.id);
        closeModal();
    };

    return (
        <>
            <Table hoverable={budgets.length > 0} theme={categoryTheme} className='w-[910px]'>
                <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Limit</Table.HeadCell>
                    <Table.HeadCell>Category</Table.HeadCell>
                    <Table.HeadCell>Recurrence</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {budgets.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={5} className="text-center">
                                No budgets found
                            </Table.Cell>
                        </Table.Row>
                    ) : (budgets.map((budget) => (
                        <Table.Row key={budget.id} className='hover:cursor-pointer' onClick={() => openModal(budget)}>
                            <Table.Cell>{budget.name}</Table.Cell>
                            <Table.Cell id="progress" className='min-w-96 flex flex-col items-center'>
                                <ProgressBar
                                    percentage={(budget.currentAmount / budget.limit) * 100}
                                    color={budget.category && budget.category.color}
                                />
                                <span className="flex items-center space-x-2">
                                    <span>{budget.currentAmount}/{budget.limit} {currentWalletCurrency}</span>
                                    <span className='font-semibold'>{((budget.currentAmount / budget.limit) * 100).toFixed(0)} %</span>
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                {budget.category && (
                                    <div className="flex flex-row items-center gap-2">
                                        <div
                                            className="text-center text-white min-w-32"
                                            style={{
                                                backgroundColor: budget.category.color,
                                                borderRadius: '5px',
                                                padding: '5px'
                                            }}
                                        >
                                            {budget.category.name}
                                        </div>
                                        <Icon id={budget.category.iconId} color={budget.category.color} />
                                    </div>
                                )}
                            </Table.Cell>
                            <Table.Cell className='max-w-10'>{budget.recurrence.charAt(0).toUpperCase() + budget.recurrence.slice(1)}</Table.Cell>
                        </Table.Row>
                    )))}
                </Table.Body>
            </Table>

            {selectedBudget && (
                <Modal show={isModalOpen} onClose={closeModal}>
                    <Modal.Header>
                        Edit Budget
                    </Modal.Header>
                    <Modal.Body>
                        <div className="space-y-6">
                            <TextInput
                                label="Name"
                                value={selectedBudget.name}
                                onChange={(e) => setSelectedBudget({ ...selectedBudget, name: e.target.value })}
                            />
                            <TextInput
                                label="Limit"
                                type="number"
                                value={selectedBudget.limit}
                                onChange={(e) => setSelectedBudget({ ...selectedBudget, limit: e.target.value })}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="bg-dark-green" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                        <Button color="failure" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button color="light" onClick={closeModal}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>

    );
};

export default BudgetTable;
