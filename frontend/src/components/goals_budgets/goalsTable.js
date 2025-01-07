import { Table } from 'flowbite-react';
import { ProgressBar } from '../custom/progressBar';
import Icon from '../custom/icon';
import categoryTheme from "../../themes/categoryTable.json";
import { useNavigate } from 'react-router-dom';

const GoalsTable = ({ goals, currentWalletCurrency}) => {

    const navigate = useNavigate();

    const handleGoalClick = (goalId) => {
        navigate(`/goals/${goalId}`);
    }

    return (
        <>
            <Table hoverable={goals.length > 0} theme={categoryTheme} className='w-[910px]'>
                <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Progress</Table.HeadCell>
                    <Table.HeadCell>Category</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {goals.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={4} className="text-center">
                                No goals found
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        goals.map((goal) => (
                            <Table.Row key={goal.id} className='hover:cursor-pointer' onClick={() => handleGoalClick(goal.id)}>
                                <Table.Cell className='min-w-48'>{goal.name}</Table.Cell>
                                <Table.Cell id="progress" className='min-w-96 flex flex-col items-center'>
                                    <ProgressBar
                                        percentage={(goal.currentAmount / goal.targetAmount) * 100}
                                        color={goal.category.color}
                                    />
                                    <span className="flex items-center space-x-2">
                                        <span>{goal.currentAmount}/{goal.targetAmount} {currentWalletCurrency}</span>
                                        <span
                                            className={`font-semibold ${(goal.currentAmount >= goal.targetAmount) ? 'text-green-500' : ''}`}>
                                            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                                        </span>
                                        {(goal.currentAmount >= goal.targetAmount) && <span className="text-green-500 font-bold">Completed!</span>}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    {goal.category && (
                                        <div className="flex flex-row items-center gap-2">
                                            <div
                                                className="text-center text-white min-w-32"
                                                style={{
                                                    backgroundColor: goal.category.color,
                                                    borderRadius: '5px',
                                                    padding: '5px'
                                                }}
                                            >
                                                {goal.category.name}
                                            </div>
                                            <Icon id={goal.category.iconId} color={goal.category.color} />
                                        </div>
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </>
    );
};

export default GoalsTable;
