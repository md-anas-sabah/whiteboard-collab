import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [newRoomId, setNewRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const generatedRoomId = uuidv4();
    setNewRoomId(generatedRoomId);
    navigate(`/board/${generatedRoomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Collaborative Whiteboard
        </h1>
        <div className="space-y-4">
          <div>
            <button
              onClick={createRoom}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Create New Board
            </button>
            {newRoomId && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                Room ID: {newRoomId}
              </div>
            )}
          </div>
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={() => roomId && navigate(`/board/${roomId}`)}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Join Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
