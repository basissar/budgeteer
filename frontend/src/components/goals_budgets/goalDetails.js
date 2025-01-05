import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../security/userProvider";
import axios from "axios";
import { API_BASE_URL } from "../../utils/macros";
import { TextInput, Dropdown, Button, Tooltip, Modal } from "flowbite-react";
import Icon from "../custom/icon";
import Error from "../custom/error";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function GoalDetails() {
    const { goalId } = useParams();
    const [goal, setGoal] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [amountToAdd, setAmountToAdd] = useState('');
    const [editedName, setEditedName] = useState('');
    const [editedTarget, setEditedTarget] = useState(null);
    const [newGoalCategory, setNewGoalCategory] = useState('');

    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

    const { user, showModal, setError, currentWallet} = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !goalId) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/goals/${goalId}`, { withCredentials: true });
                setGoal(response.data.goal);

                const categoriesResponse = await axios.get(
                    `${API_BASE_URL}/categories/${response.data.goal.walletId}`,
                    { withCredentials: true }
                );
                setCategories(categoriesResponse.data.categories);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [user, goalId]);

    const handleEditGoal = async () => {
        try {
            const updatedGoal = {};

            if (editedName && editedName !== goal.name) {
                updatedGoal.name = editedName;
            }

            if (editedTarget && Number(editedTarget) !== goal.targetAmount) {
                updatedGoal.targetAmount = Number(editedTarget);
            }

            if (newGoalCategory && newGoalCategory !== goal.categoryId) {
                updatedGoal.categoryId = newGoalCategory;
            }

            if (Object.keys(updatedGoal).length > 0) {
                const response = await axios.put(`${API_BASE_URL}/goals/${goalId}`, updatedGoal, { withCredentials: true });
                setGoal({ ...goal, ...response.data.goal });
            }


        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Error editing goal");
        }
    };

    const handleDeleteGoal = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/goals/${goalId}`, { withCredentials: true });
            navigate("/budgets_and_goals");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Error deleting goal");
        }
    };

    const handleMoneyAdd = async () => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/goals/money/${goalId}`,
                { amount: amountToAdd },
                { withCredentials: true }
            );

            if (response.data.goal.completed) {
                const modalContent = {
                    eventResult: response.data.eventResult,
                    title: response.data.message,
                    additionalMessage: response.data.additionalMessage || response.data.completeMessage,
                };

                if (modalContent.additionalMessage) {
                    showModal(modalContent);
                }
            }

            setGoal({ ...goal, currentAmount: goal.currentAmount + Number(amountToAdd) });
            setAmountToAdd('');
        } catch (error) {
            setErrorMessage(`An error occurred while adding money: ${error.message}`);
        }
    };

    const getDropdownLabel = (selectedId) => {
        if (!selectedId) return "Select a category";
        const selectedCategory = categories.find((cat) => cat.id === selectedId);
        return (
            <div className="flex items-center gap-2 h-5">
                <Icon id={selectedCategory.iconId} alt={selectedCategory.name} color={selectedCategory.color} />
                <span>{selectedCategory.name}</span>
            </div>
        );
    };

    const openDeletePopup = () => setIsDeletePopupOpen(true);
    const closeDeletePopup = () => setIsDeletePopupOpen(false);
    const confirmDelete = () => {
        handleDeleteGoal();
        closeDeletePopup();
    };

    const handleBack = () => {
        navigate("/budgets_and_goals");
    }

    return (
        <>
            {goal && (
                <div className="flex mx-auto flex-col gap-5 max-w-[500px] mt-10">
                    <h2>Savings goal details</h2>
                    <div className="flex flex-row gap-10">
                        <TextInput
                            label="Goal Name"
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder={goal.name}
                        />
                        <div className="min-w-44">
                            <Dropdown
                                label={getDropdownLabel(newGoalCategory)}
                                color="light"
                                theme={{
                                    floating: { target: "left-0 w-full focus:border-green-500 justify-center" },
                                }}
                            >
                                <div className="max-h-60 overflow-y-auto">
                                    {categories.map((category) => (
                                        <Dropdown.Item key={category.id} onClick={() => setNewGoalCategory(category.id)}>
                                            <div className="flex items-center gap-2">
                                                <Icon
                                                    id={category.iconId}
                                                    alt={category.name}
                                                    color={category.color}
                                                />
                                                <span>{category.name}</span>
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </div>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <TextInput
                            label="Add Amount"
                            type="number"
                            value={amountToAdd}
                            onChange={(e) => setAmountToAdd(e.target.value)}
                            placeholder="Enter amount to add"
                        />
                        <Button size="xs" className="bg-dark-green" onClick={handleMoneyAdd}>
                            +
                        </Button>
                    </div>

                    <div>
                        <span>Current amount: </span>
                        <span className={goal.currentAmount >= goal.targetAmount ? "text-green-500 font-bold" : ""}>
                            {goal.currentAmount} / {goal.targetAmount} {currentWallet.currency}
                        </span>
                    </div>

                    <div className='max-w-44'>
                        <label>Target Amount:</label>
                        {goal.completed ? (
                            <Tooltip
                                content="Target amount cannot be edited as this goal was already completed once."
                                style="light"
                                trigger="hover"
                                theme={{ target: "w-full" }}
                            >
                                <TextInput
                                    label="Target Amount"
                                    type="number"
                                    value={editedTarget}
                                    onChange={(e) => setEditedTarget(e.target.value)}
                                    disabled={goal.completed}
                                    placeholder="Enter target amount"
                                />
                            </Tooltip>
                        ) : (
                            <TextInput
                                label="Target Amount"
                                type="number"
                                value={editedTarget}
                                onChange={(e) => setEditedTarget(e.target.value)}
                                disabled={goal.completed}
                                placeholder="Enter target amount"
                            />
                        )}
                    </div>



                    <div className="flex flex-row items-center gap-4 mt-10">
                        <Button className="bg-dark-green" onClick={handleEditGoal}>
                            Save & Exit
                        </Button>
                        <Button color="failure" onClick={openDeletePopup}>
                            Delete Goal
                        </Button>
                        <Button color="light" onClick={handleBack}>
                            Back to budgets and savings
                        </Button>
                    </div>

                    <Modal show={isDeletePopupOpen} size="md" onClose={closeDeletePopup} popup>
                        <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                                <h3 className="mb-5 text-lg font-normal text-gray-500">
                                    Are you sure you want to delete this goal? This action is <b>irreversible</b>.
                                </h3>
                                <div className="flex justify-center gap-4">
                                    <Button color="failure" onClick={confirmDelete}>Yes, I'm sure</Button>
                                    <Button color="light" onClick={closeDeletePopup}>No, cancel</Button>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                    {errorMessage && <Error message={errorMessage} type="error" />}
                </div>
            )}
        </>
    );
}
