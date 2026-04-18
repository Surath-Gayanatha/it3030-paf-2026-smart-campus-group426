import React, { useState, useEffect } from 'react';

const LiveTimer = ({ startTime, endTime }) => {
    const [status, setStatus] = useState('');
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const start = new Date(startTime).getTime();
            const end = new Date(endTime).getTime();

            if (now < start) {
                const diff = start - now;
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setStatus('UPCOMING');
                if (diff < (1000 * 60 * 60 * 24)) {
                   setTimeLeft(`Starts in: ${hours}h ${minutes}m`);
                } else {
                   setTimeLeft("");
                }
            } else if (now >= start && now <= end) {
                const diff = end - now;
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setStatus('IN_PROGRESS');
                setTimeLeft(`🟢 IN PROGRESS - ${hours}h ${minutes}m remaining`);
            } else {
                setStatus('COMPLETED');
                setTimeLeft('Historic Booking');
            }
        };

        // Run immediately then every 60 seconds
        calculateTime();
        const intervalId = setInterval(calculateTime, 60000);

        return () => clearInterval(intervalId);
    }, [startTime, endTime]);

    if (!timeLeft) return null;

    return (
        <span style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            backgroundColor: status === 'IN_PROGRESS' ? '#dcfce7' : '#f3f4f6',
            color: status === 'IN_PROGRESS' ? '#166534' : '#4b5563',
            animation: status === 'IN_PROGRESS' ? 'pulse 2s infinite' : 'none'
        }}>
            {timeLeft}
        </span>
    );
};

export default LiveTimer;
