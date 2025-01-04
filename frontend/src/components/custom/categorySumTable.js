import { Table } from "flowbite-react";
import Icon from "./icon";

const CategorySumTable = ({ negativeSumMap, categories, currency }) => {
    const renderCategorySum = (categoryId, sum) => {
        const foundCategory = categories.find((cat) => cat.id === Number(categoryId));

        return (
            <div className="flex flex-row items-center gap-2 justify-center">
                <Icon id={foundCategory.iconId} alt={foundCategory.name} color={foundCategory.color}/>
                <span className="font-semibold">{sum}</span>
                <span className="font-semibold">{currency}</span>
            </div>
        );
    };

    const negativeSums = Object.entries(negativeSumMap)
        .filter(([key, value]) => value < 0)
        .sort((a, b) => a[1] - b[1]);

    const noNegativeSums = negativeSums.length === 0;

    return (
        <Table striped className="min-w-72">
            <Table.Head>
                <Table.HeadCell>Expenses</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
                {noNegativeSums ? (
                    <Table.Row>
                        <Table.Cell className="text-center text-gray-500">
                            No expenses found for this dateframe.
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    negativeSums.map(([key, value], index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {renderCategorySum(key, value)}
                            </Table.Cell>
                        </Table.Row>
                    ))
                )}
            </Table.Body>
        </Table>
    );
};

export default CategorySumTable;
