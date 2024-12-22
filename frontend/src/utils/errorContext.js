import React, {Children, createContext, useContext, useState} from 'react';
import messages from '../messages/messages.json';

const ErrorContext = createContext();

export const ErrorProvider = ({children}) => {
    const [errorMessage, setErrorMessage] = useState('');

    const getErrorMessage = (key) => {
        return messages.errorMessages[key] || messages.errorMessages.default;
    }

    return (
        <ErrorContext.Provider value={{ errorMessage, setErrorMessage, getErrorMessage }}>
          {children}
        </ErrorContext.Provider>
      );
}

export const useError = () => useContext(ErrorContext);