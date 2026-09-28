import React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/css/main.css';
import './styles/theme.css';
import App from './App';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import ScrollToTop from './components/layout/ScrollToTop';
import Landing from './Landing';
import Summary from './Summary';
import { StateProvider } from './StateProvider';
import reducer, { initialState } from './reducer';
import MatchHistory from './MatchHistory';
import Past from './Past';
const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <StateProvider initialState={initialState} reducer={reducer}>
            <Router>
                <ScrollToTop />
                <AppHeader />
                <Switch>
                    <Route exact path="/">
                        <Landing />
                    </Route>
                    <Route path="/match" component={App} />
                    <Route path="/Summary" component={Summary} />
                    <Route path="/history/:id" component={Past} />
                    <Route path="/history" component={MatchHistory} />
                </Switch>
            </Router>
        </StateProvider>
    </React.StrictMode>
);
