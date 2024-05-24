// ProgressBar.js
import React from 'react';
import './progressbar.css';

export const ProgressBar = ({ percentage, color }) => {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }}>
                </div>
            </div>
        </div>
    );
};