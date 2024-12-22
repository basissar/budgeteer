import { Dropdown } from "flowbite-react";

const WalletSelect = ({ wallets, handleWalletChange, currentWalletId }) => {
    return (
        <Dropdown
            label={wallets.length > 0 ? wallets.find(wallet => wallet.id === currentWalletId)?.name : "Select Wallet"}
            color="light"
            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
            onChange={handleWalletChange}
        >
            <div>
                {wallets.map(wallet => (
                    <Dropdown.Item
                        key={wallet.id}
                        onClick={() => handleWalletChange({ value: wallet.id })}
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