import React from 'react';
import { createRoot } from 'react-dom/client';
import { legacy_createStore as createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import App from './containers/App';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/solarized.css';
import 'font-awesome/css/font-awesome.css';
import './stylesheets/style.scss';

const store = createStore(rootReducer);

createRoot(document.getElementById('revealexpress')).render(
    <Provider store={store}><App/></Provider>
);
