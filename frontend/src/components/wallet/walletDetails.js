import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/macros";
import { Button, Card, Spinner, Table } from "flowbite-react";
import { useUserContext } from "../security/userProvider";
import axios from "axios";
import CategoryForm from "./categoryForm";
import Error from "../custom/error";
import CategoryTable from "../custom/categoryOverviewTable";

export default function WalletDetails() {
    const { walletId } = useParams();
    const [details, setDetails] = useState(null);

    const [defaultCategories, setDefaulCategories] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);
    const { user, error, setError, updateWallet } = useUserContext();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [originalDetails, setOriginalDetails] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/wallets/${walletId}`, {
                    withCredentials: true,
                });

                const walletData = response.data.wallet;

                const defaultCats = await axios.get(`${API_BASE_URL}/categories`, {
                    withCredentials: true,
                });

                setDefaulCategories(defaultCats.data.categories);

                const customCats = await axios.get(`${API_BASE_URL}/categories/${walletId}/custom`, {
                    withCredentials: true,
                });

                setCustomCategories(customCats.data.categories);

                setDetails({
                    name: walletData._name,
                    amount: walletData._amount,
                    currency: walletData._currency
                });
            } catch (error) {
                setError(error);
            }
        };

        fetchData();
    }, [walletId]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleCategoryCreated = (newCategory) => {
        setCustomCategories((prevCategories) => [...prevCategories, newCategory]);
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`,
                { withCredentials: true }
            )

            setCustomCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
        } catch (error) {
            setError('Error occured while deleting a category');
        }
    }

    const toggleEdit = () => {
        setOriginalDetails(details);
        setIsEditing(!isEditing);
    };


    const handleSave = async () => {
        if ( details.name !== originalDetails.name) {
            try {
                const response = await axios.put(`${API_BASE_URL}/wallets/${walletId}`,
                    { name: details.name },
                    { withCredentials: true }
                );

                setOriginalDetails(details);

                const updatedWallet = response.data.wallet;

                updateWallet(updatedWallet);
            } catch (error) {
                setError(`${error.response.data.message}`);
                return;
            }
        }
        setIsEditing(false);
    };

    const handleDelete = async () => {
        console.log(`Deleted wallet ${walletId}`);

        try {
            const response = await axios.delete(`${API_BASE_URL}/${user.id}/wallets/${walletId}`, { withCredentials: true });

            if (response.status === 200) {
                console.log(`Wallet ${walletId} deleted successfully`);

                navigate('/wallets');
            }
        } catch (error) {
            setError(`An error occurred while fetching data. ${error.response.data.message}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-center gap-20 mx-auto">
                <div className="flex flex-col items-center gap-5 min-w-[512px]">

                    <div className='max-w-sm'>
                        {error && <Error message={error} type={'error'} />}
                    </div>

                    <Card className="w-full items-center">
                        <h2>General Information</h2>
                        <div className="flex flex-col items-center">
                            {details ? (
                                isEditing ? (
                                    <>
                                        <div className="flex flex-row gap-4">
                                            <div className="flex flex-row gap-1">
                                                <p>Balance: </p>
                                                <p>{details.amount}</p>
                                            </div>

                                            <div className="flex flex-row gap-1">
                                                <p>Currency: </p>
                                                <p>{details.currency}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-1 items-center">
                                            <label>Name: </label>
                                            <input
                                                type="text"
                                                value={details.name}
                                                onChange={(e) =>
                                                    setDetails({ ...details, name: e.target.value })
                                                }
                                                className="border p-1 rounded"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-row gap-4">
                                            <div className="flex flex-row gap-1">
                                                <p>Balance: </p>
                                                <p>{details.amount}</p>
                                            </div>

                                            <div className="flex flex-row gap-1">
                                                <p>Currency: </p>
                                                <p>{details.currency}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-1">
                                            <p>Name: </p>
                                            <p>{details.name}</p>
                                        </div>
                                    </>
                                )
                            ) : (
                                <div className="text-center">
                                    <Spinner
                                        color="success"
                                        aria-label="Extra large spinner example"
                                        size="xl"
                                    />
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="w-full flex flex-row items-center gap-10 p-2">
                        <Button color="failure" className="w-1/2" onClick={handleDelete}>
                            Delete wallet
                        </Button>
                        <Button
                            color={isEditing ? "success" : "light"}
                            className="w-1/2"
                            onClick={isEditing ? handleSave : toggleEdit}
                        >
                            {isEditing ? "Save Wallet" : "Edit Wallet"}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5">
                    <div className="mt-[20px]">
                        {details && customCategories && defaultCategories && (
                            <CategoryTable
                                defaultCategories={defaultCategories}
                                customCategories={customCategories}
                                handleDeleteCategory={handleDeleteCategory}
                            />
                        )}
                    </div>

                    <Button
                        className="self-center flex items-center justify-center text-white rounded-lg bg-dark-green"
                        onClick={() => { openModal(); }}>
                        Create custom category
                    </Button>

                </div>
            </div>

            <CategoryForm walletId={walletId} isModalOpen={isModalOpen} closeModal={closeModal} setCustomCategories={handleCategoryCreated} />
        </div>

    );
}
