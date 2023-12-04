import { Routes, Route } from "react-router-dom";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";

function App() {
  return (
    <>
      {/* <ul className="flex justify-around my-10 text-lg font-semibold">
        <li className="bg-gray-600 px-3 py-1 rounded-sm text-white hover:cursor-pointer hover:bg-gray-700 active:bg-gray-600">
          <Link to={'/'}>Lobby</Link>
          
        </li>
        <li className="bg-gray-600 px-3 py-1 rounded-sm text-white hover:cursor-pointer hover:bg-gray-700 active:bg-gray-600">
          <Link to={`/room/${room}`}>Room</Link>
          
        </li>
      </ul> */}
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  );
}

export default App;
