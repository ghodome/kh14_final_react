import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootswatch/dist/litera/bootstrap.min.css";
import "bootstrap";
// import { RecoilRoot } from 'recoil';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';

// axios.defaults.baseURL=process.env.REACT_APP_BASE_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <RecoilRoot>
        <HashRouter>
        <App />
        </HashRouter>
    // </RecoilRoot>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
