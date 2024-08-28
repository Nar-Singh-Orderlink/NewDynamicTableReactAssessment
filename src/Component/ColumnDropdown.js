

import React from "react";

export default function ColumnDropdown({ columns, handleColumnChange, handleClose }) {
    const handleApply = () => {
        handleClose();
        handleColumnChange(columns);
    };

    const handleReset = () => {
        const resetColumns = columns.map((col) => ({ ...col, visible: true }));
        handleColumnChange(resetColumns);
        handleClose();
    };

    const toggleColumnVisibility = (columnName) => {
        const updatedColumns = columns.map((col) =>
            col.name === columnName ? { ...col, visible: !col.visible } : col
        );
        handleColumnChange(updatedColumns);
    };

    return (
        <div className="absolute top-20 right-0 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-5 max-h-80 overflow-y-auto custom-scrollbar z-50">
            <div
                className="py-2"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
            >
                <div className="flex items-center mb-3">
                    <label className="text-black font-bold">Edit Columns</label>
                </div>
                <p className="text-gray-700 mb-3">
                    Please select the columns to rearrange
                </p>
                {columns.map((col) => (
                    <div
                        key={col.name}
                        className="flex border p-2 items-center mb-2 last:mb-0"
                    >
                        <input
                            type="checkbox"
                            id={col.name}
                            checked={col.visible}
                            onChange={() => toggleColumnVisibility(col.name)}
                            className="mr-2 text-black border border-gray-300 rounded-md w-5 h-5 flex-shrink-0"
                        />
                        <label htmlFor={col.name} className="text-gray-700 cursor-pointer">
                            {col.name}
                        </label>
                    </div>
                ))}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 mr-3"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-custom-blue bg-custom-blue-hover rounded-md text-white hover:bg-custom-blue"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
