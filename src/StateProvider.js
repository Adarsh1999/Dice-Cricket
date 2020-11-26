/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { createContext, useContext, useReducer } from 'react';

// Prepares the dataLayer
export const StateContext = createContext();

// Wrap our app and provide the Data layer
// eslint-disable-next-line react/prop-types
export const StateProvider = ({ reducer, initialState, children }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>{children}</StateContext.Provider>
);

// Pull information from the data layer
export const useStateValue = () => useContext(StateContext);
