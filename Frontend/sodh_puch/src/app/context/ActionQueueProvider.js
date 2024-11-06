// src/context/ActionQueueProvider.js

import { createContext, useContext, useState } from 'react';

const ActionQueueContext = createContext();

export const ActionQueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);

  const addAction = (action) => {
    setQueue((prevQueue) => [...prevQueue, action]);
  };

  const removeAction = (actionId) => {
    setQueue((prevQueue) => prevQueue.filter((action) => action.id !== actionId));
  };

  return (
    <ActionQueueContext.Provider value={{ queue, addAction, removeAction }}>
      {children}
    </ActionQueueContext.Provider>
  );
};

export const useActionQueue = () => useContext(ActionQueueContext);
