import React from 'react';

export const ProgressBar = ({ percentage, color }) => {
    return (
        <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }}>
            </div>
        </div>
    );
};