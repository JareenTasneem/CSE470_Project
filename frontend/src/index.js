import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
<<<<<<< HEAD
=======
import { CustomizeProvider } from "./CustomizeContext";
>>>>>>> 2d5f677e73468b7f60912c946a23119414a2ed2a

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
<<<<<<< HEAD
      <App />
=======
      <CustomizeProvider>
        <App />
      </CustomizeProvider>
>>>>>>> 2d5f677e73468b7f60912c946a23119414a2ed2a
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
