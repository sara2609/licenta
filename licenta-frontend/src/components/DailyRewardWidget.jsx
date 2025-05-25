import React from 'react';

const DailyRewardWidget = ({ reward, onClaim, message }) => {
    return (
        <div>
            <h3>🏆 Punctele tale</h3>
            {reward ? (
                <>
                    <p>Ultima revendicare: {reward.lastClaimedDate}</p>
                    <p>Streak curent: {reward.currentStreak}</p>
                    <p>Total puncte: {reward.totalPoints}</p>
                    <button onClick={onClaim}>Revindecă puncte</button>
                    <p style={{ color: "green" }}>{message}</p>
                </>
            ) : (
                <p>Se încarcă datele...</p>
            )}
        </div>
    );
};

export default DailyRewardWidget;
