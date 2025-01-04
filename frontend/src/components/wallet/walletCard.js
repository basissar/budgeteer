import { Card } from "flowbite-react";
import CardIcon from "../../assets/card-icon.svg?react"

export default function Wallet({ cardName, amount, currency }) {
    return (
        <Card className="w-64 h-32 bg-light-green hover:bg-light-green-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="flex flex-row gap-2 ">
                <CardIcon/>
                <div>
                    <h4 className="text-2xl font-bold">{cardName}</h4>
                    <div className="flex flex-row items-center gap-2">
                        <span>{amount}</span>
                        <span>{currency}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}