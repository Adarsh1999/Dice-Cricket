import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/main.css';
import App from './App';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './Header';
import Landing from './Landing';
import Summary from './Summary';
import { StateProvider } from './StateProvider';
import reducer, { initialState } from './reducer';

ReactDOM.render(
    <React.StrictMode>
        <StateProvider initialState={initialState} reducer={reducer}>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Header />
                        <Landing />
                    </Route>
                    <Route path="/match" component={App} />
                    <Route path="/Summary" component={Summary} />
                </Switch>
            </Router>
        </StateProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);
