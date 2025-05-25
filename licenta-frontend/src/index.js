import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// 👉 Cheia publică (corectă!)
const stripePromise = loadStripe('pk_test_51R4OgA14Om18N7m64OZduIGRm6mxusmATr9NEm3ABCKLiKrLfAkMudT17CoSCivbpyxdQAaHPdjizuwR77Z6l6VK00dGr6Hgng');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Elements stripe={stripePromise}>
            <App />
        </Elements>
    </React.StrictMode>
);

reportWebVitals();
