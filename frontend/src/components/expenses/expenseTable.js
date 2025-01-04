import { Table } from "flowbite-react";
import Icon from "../custom/icon";
import DeleteIcon from "../../assets/delete.svg?react";
import EditIcon from "../../assets/edit.svg?react";


const ExpenseTable = ({ expenses, currency, handleEditExpense, handleDeleteExpense }) => {
    return (
        <Table striped hoverable={expenses.length > 0}>
            <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Expense Name</Table.HeadCell>
                <Table.HeadCell>Source Category</Table.HeadCell>
                <Table.HeadCell>Target Category</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {expenses.length === 0 ? (
                    <Table.Row>
                        <Table.Cell colSpan={6} className="text-center">
                            No expenses found
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    expenses.map(expense => (
                        <Table.Row key={expense.id}>
                            <Table.Cell>{new Date(expense.date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{expense.name}</Table.Cell>
                            <Table.Cell>
                                {expense.sourceCategory && (
                                    <div className="flex flex-row items-center">
                                        <div
                                            className="text-center text-white min-w-44"
                                            style={{
                                                backgroundColor: expense.sourceCategory.color,
                                                borderRadius: '5px',
                                                padding: '5px'
                                            }}
                                        >
                                            {expense.sourceCategory.name}
                                        </div>
                                        <Icon id={expense.sourceCategory.iconId} color={expense.sourceCategory.color} />
                                    </div>
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                {expense.targetCategory && (
                                    <div className="flex flex-row items-center">
                                        <div
                                            className="text-center text-white min-w-44"
                                            style={{
                                                backgroundColor: expense.targetCategory.color,
                                                borderRadius: '5px',
                                                padding: '5px'
                                            }}
                                        >
                                            {expense.targetCategory.name}
                                        </div>
                                        <Icon id={expense.targetCategory.iconId} color={expense.targetCategory.color} />
                                    </div>
                                )}
                            </Table.Cell>
                            <Table.Cell className={expense.amount >= 0 ? 'positive-amount' : 'negative-amount'}>
                                {expense.amount} {currency}
                            </Table.Cell>
                            <Table.Cell>
                                <div className="flex flex-row items-center">
                                    <EditIcon className="edit-icon"
                                        onClick={() => handleEditExpense(expense.id)} />
                                    <DeleteIcon 
                                        className="delete-icon"
                                        onClick={() => handleDeleteExpense(expense.id)}/>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))
                )}
            </Table.Body>
        </Table>
    );
}

export default ExpenseTable;