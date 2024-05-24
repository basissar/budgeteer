import React from 'react';
import Select from 'react-select';

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minWidth: '200px',
        margin: '8px 0',
        border: '1px solid #4B6D4E',
        borderRadius: '5px',
        boxShadow: 'none',
        '&:hover': {
            border: '1px solid #8bc34a',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#4B6D4E' : state.isFocused ? '#e8f5e9' : 'white', 
        color: state.isSelected ? 'white' : 'black',
        padding: '10px 20px',
        '&:hover': {
            backgroundColor: '#9BC995',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#4B6D4E', 
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#4B6D4E', 
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '5px',
        marginTop: '0',
        border: '1px solid #4B6D4E',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '0',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: '#8bc34a',
        '&:hover': {
            color: '#8bc34a',
        }
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
};

export const CustomSelect = ({ options, value, onChange }) => {
    const formattedOptions = options.map(option => ({
        value: option.id,
        label: option.name,
    }));

    const handleChange = (selectedOption) => {
        onChange(selectedOption);
    };

    const selectedValue = formattedOptions.find(option => option.value === value);

    return (
        <Select
            styles={customStyles}
            options={formattedOptions}
            value={selectedValue}
            onChange={handleChange}
        />
    );
};

