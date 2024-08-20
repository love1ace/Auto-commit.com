import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './index.css';
import Loading from './components/Loading';
import CommitStatus from './components/CommitStatus';
import AdfitLeft from './components/AdfitLeft'; // 왼쪽 세로 광고
import AdfitRight from './components/AdfitRight'; // 오른쪽 세로 광고

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [activeStep, setActiveStep] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minCommits, setMinCommits] = useState('');
  const [maxCommits, setMaxCommits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`https://auto-commit.com/auth/check`, {withCredentials: true})
      .then(response => {
        if (response.data.authenticated) {
          setIsLoggedIn(true);
          setUser(response.data.user);
          fetchContributions();
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const fetchContributions = () => {
    axios.get(`https://auto-commit.com/auth/contributions`, {withCredentials: true})
      .then(response => {
        // Handle the response if needed
      })
      .catch(error => {
        console.error('Error fetching contributions:', error);
      });
  };

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = `https://auto-commit.com/auth/github`;
    }, 2000);
  };

  const handleLogout = () => {
    axios.get(`https://auto-commit.com/auth/logout`, {withCredentials: true})
      .then(() => {
        setIsLoggedIn(false);
        setUser(null);
        setStep(1);
        setActiveStep(1);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!minCommits || !maxCommits) {
      return;
    }

    const data = {
      githubId: user.username,
      startDate,
      endDate,
      minCommits,
      maxCommits,
    };

    axios.post(`https://auto-commit.com/api/commits`, data, {withCredentials: true})
      .then(response => {
        setCommitStatus({
          ...data,
          success: true,
          totalCommits: response.data.totalCommits,
          repoUrl: response.data.repoUrl
        });
        setIsSubmitting(false);
        fetchContributions();
      })
      .catch(error => {
        setCommitStatus({...data, success: false});
        setIsSubmitting(false);
      });
  };

  const nextStep = () => {
    const nextActiveStep = activeStep + 1;
    setActiveStep(nextActiveStep);
    setStep(prevStep => prevStep + 1);
    setTimeout(() => {
      document.getElementById(`step-${nextActiveStep}`).classList.remove('animate-step');
    }, 500);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  if (isLoading || isSubmitting) {
    return <Loading/>;
  }

  if (commitStatus) {
    return (
      <div>
        <CommitStatus status={commitStatus}/>
      </div>
    );
  }

  return (
    <>
      <div className="container-wrapper">
        <AdfitLeft/> {/* 좌측 세로 광고 */}
        <div className="main-container">
          <div className="App container">
            <div className="steps-container">
              <div className={`step ${step >= 1 ? 'active' : ''} ${activeStep === 1 ? 'animate-step' : ''}`}
                   id="step-1">1
              </div>
              <div className={`steps-line ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${activeStep === 2 ? 'animate-step' : ''}`}
                   id="step-2">2
              </div>
              <div className={`steps-line ${step >= 3 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 3 ? 'active' : ''} ${activeStep === 3 ? 'animate-step' : ''}`}
                   id="step-3">3
              </div>
            </div>
            <div className="content">
              <main className="main-content">
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div>
                      <div>
                        {isLoggedIn && user ? (
                          <div className="user-info">
                            <p>Welcome, {user.username}</p>
                          </div>
                        ) : (
                          <button type="button" onClick={handleLogin}>Login with GitHub</button>
                        )}
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div>
                      <div>
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div>
                      <div>
                        <label>Min Commits</label>
                        <input
                          type="number"
                          name="minCommits"
                          value={minCommits}
                          onChange={(e) => setMinCommits(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Max Commits</label>
                        <input
                          type="number"
                          name="maxCommits"
                          value={maxCommits}
                          onChange={(e) => setMaxCommits(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="button-group">
                    {step === 1 && <button type="button" onClick={handleLogout} disabled={!isLoggedIn}>Logout</button>}
                    {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
                    {step < 3 && <button type="button" onClick={nextStep} disabled={(step === 1 && !isLoggedIn)}>Save &
                      Continue</button>}
                    {step === 3 && <button type="submit" disabled={!minCommits || !maxCommits}>Create Commits</button>}
                  </div>
                </form>
              </main>
            </div>
          </div>
        </div>
        <AdfitRight/> {/* 우측 세로 광고 */}
      </div>
    </>
  );
}

export default App;