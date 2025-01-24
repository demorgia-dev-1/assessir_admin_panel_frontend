
import { useState } from 'react';
import Select from 'react-select';
const QuestionSetSelector = ({ id, label, value, options, onChange, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSelectChange = (e) => {
        onChange(e);
        setIsEditing(false);
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.5)' : 'none',
            '&:hover': {
                borderColor: '#4F46E5',
            },
            borderRadius: '0.5rem',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#E0E7FF' : 'white',
            color: state.isSelected ? 'white' : 'black',
            '&:hover': {
                backgroundColor: '#E0E7FF',
            },
        }),
    };

    return (
        <div className="flex flex-col flex-1">
            <label htmlFor={id} className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">{label}</label>
            {isEditing || !value ? (
                <Select
                    id={id}
                    value={value ? { value: value._id, label: value.name } : null}
                    options={options.map(option => ({ value: option._id, label: option.name }))}
                    onChange={handleSelectChange}
                    className="w-full text-sm border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-auto"
                    styles={customStyles}
                    isDisabled={disabled}
                    placeholder="Select"
                    isClearable
                />
            ) : (
                <input
                    id={id}
                    value={value.name}
                    readOnly
                    className="px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    onClick={handleEditClick}
                />
            )}
        </div>
    );
};

export default QuestionSetSelector;