import { Dropdown } from "flowbite-react";
import { useUserContext } from "../security/userProvider";

const WalletSelect = () => {
    const { wallets, currentWallet, handleWalletChange } = useUserContext();

    return (
        <Dropdown
            label={wallets.length > 0 ? currentWallet?.name : "Select Wallet"}
            color="light"
            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
            onChange={(e) => handleWalletChange(e.target.value)}
        >
            <div>
                {wallets.map(wallet => (
                    <Dropdown.Item
                        key={wallet.id}
                        onClick={() => handleWalletChange(wallet.id)}
                        className="w-full text-center"
                    >
                        {wallet.name} ({wallet.currency})
                    </Dropdown.Item>
                ))}
            </div>
        </Dropdown>
    );
}

export default WalletSelect;