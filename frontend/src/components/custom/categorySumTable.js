import { Table } from "flowbite-react";
import Icon from "./icon";

const CategorySumTable = ({ negativeSumMap, positiveSumMap, categories, currency }) => {
    const renderCategorySum = (categoryId, sum) => {
        const foundCategory = categories.find((cat) => cat.id === Number(categoryId));

        return (
            <div className="flex flex-row items-center gap-2">
                <Icon id={foundCategory.id} alt={foundCategory.name} />
                {/* <span>{foundCategory.name}</span> */}
                <span>{sum}</span>
                <span>{currency}</span>
            </div>
        );
    };

    const positiveSums = Object.entries(positiveSumMap)
        .filter(([key, value]) => value > 0)
        .sort((a, b) => b[1] - a[1]);

    const negativeSums = Object.entries(negativeSumMap)
        .filter(([key, value]) => value < 0)
        .sort((a, b) => a[1] - b[1]);

    const rows = [
        ...Object.entries(positiveSumMap)
            .filter(([key, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => ({ category: key, positive: value, negative: null })),
        ...Object.entries(negativeSumMap)
            .filter(([key, value]) => value < 0)
            .sort((a, b) => a[1] - b[1])
            .map(([key, value]) => ({ category: key, positive: null, negative: value })),
    ];

    const noPositiveSums = positiveSums.length === 0;
    const noNegativeSums = negativeSums.length === 0;

    return (
        <Table striped>
            <Table.Head>
                <Table.HeadCell>Positive Sums</Table.HeadCell>
                <Table.HeadCell>Negative Sums</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
                {noPositiveSums && noNegativeSums ? (
                    <Table.Row>
                        <Table.Cell colSpan="2" className="text-center text-gray-500">
                            No sums fetched for this dateframe.
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    [...Array(Math.max(positiveSums.length, negativeSums.length))].map((_, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {positiveSums[index] ? renderCategorySum(positiveSums[index][0], positiveSums[index][1]) : (noPositiveSums && index === 0 ? <span>No positive sums found</span> : null)}
                            </Table.Cell>
                            <Table.Cell>
                                {negativeSums[index] ? renderCategorySum(negativeSums[index][0], negativeSums[index][1]) : (noNegativeSums && index === 0 ? <span>No negative sums found</span> : null)}
                            </Table.Cell>
                        </Table.Row>
                    ))
                )}
            </Table.Body>
        </Table>
    );
};


export default CategorySumTable;