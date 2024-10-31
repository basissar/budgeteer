import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/macros';
import './achievements.css';

import star from '../../assets/star_icon.svg';
import credit from "../../assets/credit.svg";
import XP from "../../assets/XP.svg";

const Achievements = ({ userId }) => {
  const [userAchievements, setUserAchievements] = useState([]);

  useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        const token = localStorage.getItem('token');
        const userAchievementsResponse = await axios.get(`${API_BASE_URL}/achievements/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        setUserAchievements(userAchievementsResponse.data.achievements);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserAchievements();
  }, [userId]);

  const claimAchievement = async (achievementId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/achievements/${userId}/${achievementId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
      // Update the user achievements list
      setUserAchievements((prevAchievements) =>
        prevAchievements.map((achievement) =>
          achievement.achievementId === achievementId ? { ...achievement, claimed: true } : achievement
        )
      );
    } catch (err) {
      console.error(err);
      alert('An error occurred while claiming the achievement');
    }
  };

  return (
    <div className="achievements-container">
      <h2>User Achievements</h2>
      <div className="achievements-list">
        {userAchievements.map(({ achievement, achievementId, claimed }) => (
          achievement ? (
            <div key={achievementId} className="achievement-item">
              <div className="achievement-header">
                <img src={star} alt="Star" className="achievement-icon" />
                <h3>{achievement.name}</h3>
              </div>
              <p>{achievement.description}</p>
              <p className="achievement-quote">"{achievement.quote}"</p>
              <div className="achievement-rewards">
                <span className="achievement-credits">
                  <img src={credit} alt="Coin" />
                  + {achievement.gainedCredits}
                </span>
                <span className="achievement-xp">
                  <img src={XP} alt="XP" />
                  + {achievement.gainedXp}
                </span>
              </div>
              {claimed ? (
                <button className="claimed-button" disabled>Claimed</button>
              ) : (
                <button className="claim-button" onClick={() => claimAchievement(achievementId)}>Claim</button>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default Achievements;
