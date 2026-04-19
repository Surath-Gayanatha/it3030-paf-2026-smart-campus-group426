import React, { useState, useEffect } from 'react';

const LiveTimer = ({ startTime, endTime }) => {
    const [status, setStatus] = useState('');
    const [timeLeft, setTimeLeft] = useState('');

    const parseDateObj = (dateVal) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
        }
        return new Date(dateVal);
    };

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const start = parseDateObj(startTime).getTime();
            const end = parseDateObj(endTime).getTime();

            if (now < start) {
                const diff = start - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                
                setStatus('UPCOMING');
                if (days > 0) {
                    setTimeLeft(`Starts in: ${days}d ${hours}h ${minutes}m`);
                } else {
                    setTimeLeft(`Starts in: ${hours}h ${minutes}m ${seconds}s`);
                }
            } else if (now >= start && now <= end) {
                const diff = end - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                
                setStatus('IN_PROGRESS');
                if (days > 0) {
                    setTimeLeft(`🟢 IN PROGRESS - ${days}d ${hours}h ${minutes}m remaining`);
                } else {
                    setTimeLeft(`🟢 IN PROGRESS - ${hours}h ${minutes}m ${seconds}s remaining`);
                }
            } else {
                setStatus('COMPLETED');
                setTimeLeft('Historic Booking');
            }
        };

        // Run immediately then every 1 second
        calculateTime();
        const intervalId = setInterval(calculateTime, 1000);

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
