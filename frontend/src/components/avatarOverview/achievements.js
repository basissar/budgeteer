import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/macros';
import './achievements.css';

import { Modal } from 'flowbite-react';

import Star from '../../assets/star_icon.svg?react';
import Credit from "../../assets/credit.svg?react";
import XP from "../../assets/XP.svg?react";
import { useUserContext } from "../security/userProvider";

const Achievements = ({ userId }) => {
  const [userAchievements, setUserAchievements] = useState([]);

  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useUserContext();

  useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        const userAchievementsResponse = await axios.get(`${API_BASE_URL}/achievements/${user.id}`, {
          withCredentials: true
        });

        setUserAchievements(userAchievementsResponse.data.achievements);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserAchievements();
  }, [user, userId]);

  const claimAchievement = async (achievementId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/achievements/${user.id}/${achievementId}`, {}, {
        withCredentials: true
      });

      setModalMessage(response.data.message);
      setIsModalOpen(true);

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
      {userAchievements.length === 0 ? (
        <div className='flex flex-col items-center'>
          <p>You don't have any achievements yet.</p>
          <p>Create more expenses or add some money to your savings goals.</p>
        </div>

      ) : (
        <div className="achievements-list">
          {userAchievements.map(({ achievement, achievementId, claimed }) => (
            achievement ? (
              <div key={achievementId} className="achievement-item">
                <div className="achievement-header">
                  <Star />
                  <h3>{achievement.name}</h3>
                </div>
                <p>{achievement.description}</p>
                <p className="achievement-quote">"{achievement.quote}"</p>
                <div className="achievement-rewards">
                  <span className="achievement-credits">
                    <Credit />
                    + {achievement.gainedCredits}
                  </span>
                  <span className="achievement-xp">
                    <XP />
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
      )}

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>Achievement</Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Close</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Achievements;
