import React from 'react';
import '../css/Snowfall.css';

const Snowfall = () => {
const createSnowflake = () => {
    const size = Math.random() * 5;
    const animationDuration = Math.random() * 10 + 5;
    const snowflakeStyle = {
    width: `${size}px`,
    height: `${size}px`,
      left: `${Math.random() * 100}%`,
    animationDuration: `${animationDuration}s`,
    };

    return <div className="snowflake" style={snowflakeStyle} key={Math.random()} />;
};

const snowflakes = Array.from({ length: 50 }, createSnowflake);

return <div className="snowfall">{snowflakes}</div>;
};

export default Snowfall;
