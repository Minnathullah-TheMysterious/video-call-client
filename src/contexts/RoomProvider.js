import { createContext, useContext, useState } from "react";

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState('');

  return (
    <RoomContext.Provider value={[room, setRoom]}>
      {children}
    </RoomContext.Provider>
  );
};
