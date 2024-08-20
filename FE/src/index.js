import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // 정확한 경로 설정
import App from './App'; // App.js가 같은 디렉토리에 존재함

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);