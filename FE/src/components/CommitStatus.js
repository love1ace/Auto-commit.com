import React from 'react';
import './CommitStatus.css';
import failIcon from './img/cross.png';
import checkIcon from './img/check.png';

const CommitStatus = ({ status }) => {
  // const isSuccess = status.success;
  const isSuccess = status.success;

  const handleButtonClick = () => {
    window.location.reload();
  };

  return (
    <div className={`commit-status-container ${isSuccess ? 'success' : 'failed'}`}>
      <div className="commit-status-header">
        <div className="status-icon">
          {isSuccess ?
            <img src={checkIcon} alt="Success" className="icon-success" /> :
            <img src={failIcon} alt="Failed" className="icon-failed" />
          }
        </div>
        <h2>{isSuccess ? 'Success!' : 'Error!'}</h2>
      </div>
      <div className="commit-status-message">
        {isSuccess ? (
          <div>
            Everything is working<br />normally.
          </div>
        ) : (
          <div>
            Oops!<br />Something went wrong!
          </div>
        )}
      </div>
      <div className="commit-status-actions">
        <button className={isSuccess ? 'btn-continue' : 'btn-retry'} onClick={handleButtonClick}>
          {isSuccess ? 'CONTINUE' : 'TRY AGAIN'}
        </button>
      </div>
    </div>
  );
};

export default CommitStatus;