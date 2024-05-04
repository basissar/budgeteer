import React, { useState } from 'react';

export default function CustomWalletSelect({label, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (option, e) => {
        setSelectedOption(option);
        onChange(option, e);
        setIsOpen(false);
    }

    return (
        <div className="custom-select-container">
            <label htmlFor="customSelect">{label}</label>
            <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-option">{selectedOption || 'Select an option'}</div>
                {isOpen && (
                    <div className="options">
                        {options.map(option => (
                            <div key={option} className="option" onClick={(e) => handleOptionClick(option,e)}>
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}