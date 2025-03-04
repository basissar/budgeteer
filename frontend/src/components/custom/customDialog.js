import React from 'react';
import Credits from "../../assets/credit.svg?react";

export default function CustomDialog ({ show, onClose, message, earnedCredits, earnedXP }) {
    if (!show) {
        return null;
    }

        return (
            <div className="dialog-overlay">
                <div className="dialog-content">
                    <button className="close" onClick={onClose}>&times;</button>
                    <p>{message}</p>
                    <div className="reward-info">
                        <div className="credit-info">
                            {/* <img src={icon} alt="Credits" />  */}
                            <Credits/>
                            <span>+ {earnedCredits}</span>
                        </div>
                        <div className="xp-info">
                            <span>XP + {earnedXP}</span>
                        </div>
                    </div>
                    <button className="dialog-button" onClick={onClose}>Wohoo</button>
                </div>
            </div>
        );

}
