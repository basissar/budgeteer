import { Dropdown } from "flowbite-react";
import { useState, useEffect } from "react";

const SummarySelect = ({ onSelect }) => {
    const [selectedValue, setSelectedValue] = useState('t');

    const options = [
        { label: 'Today', value: 't' },
        { label: 'Last Week', value: 'w' },
        { label: 'This Month', value: 'm' },
        { label: 'Last 6 Months', value: 'x' },
        { label: 'This Year', value: 'y' },
    ];

    const handleSelect = (value) => {
        setSelectedValue(value);
        onSelect(value);
    };

    const selectedLabel = options.find(option => option.value === selectedValue)?.label || 'Select Date Range';

    return (
        <Dropdown label={selectedLabel} color="light" theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}>
            {options.map((option) => (
                <Dropdown.Item
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full text-center"
                >
                    {option.label}
                </Dropdown.Item>
            ))}
        </Dropdown>
    );
};

export default SummarySelect;
