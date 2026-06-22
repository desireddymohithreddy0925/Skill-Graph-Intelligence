import React from 'react';
import './Loading.css';

const Loading = ({ message = "Loading...", fullScreen = false }) => {
  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loader">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-glow"></div>
      </div>
      <h2 className="loading-text gradient-text">{message}</h2>
    </div>
  );
};

export default Loading;
