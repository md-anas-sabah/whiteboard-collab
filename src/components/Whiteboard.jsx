import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const Whiteboard = () => {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [strokeSize, setStrokeSize] = useState(2);
  const [sessionName, setSessionName] = useState("");
  const [showDialog, setShowDialog] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = strokeSize;
    contextRef.current = context;

    const newSocket = io("https://whiteboard-collab-backend.onrender.com", {
      query: { roomId },
      transports: ["websocket"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("join_room", roomId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleDraw = ({ x, y, color, strokeSize, type }) => {
      const context = contextRef.current;
      if (!context) return;

      context.strokeStyle = color;
      context.lineWidth = strokeSize;

      if (type === "start") {
        context.beginPath();
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
        context.stroke();
      }
    };

    const handleSaveSuccess = () => {
      setSuccess("Session saved successfully");
      setLoading(false);
      setError("");
    };

    const handleSaveError = (error) => {
      setError(error || "Failed to save session");
      setLoading(false);
      setSuccess("");
    };

    const handleLoadSession = (imageData) => {
      const image = new Image();
      image.onload = () => {
        contextRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        contextRef.current.drawImage(image, 0, 0);
        setSuccess("Session loaded successfully");
        setLoading(false);
        setError("");
      };
      image.src = imageData;
    };

    const handleLoadError = (error) => {
      setError(error || "Failed to load session");
      setLoading(false);
      setSuccess("");
    };

    socket.on("draw", handleDraw);
    socket.on("save_success", handleSaveSuccess);
    socket.on("save_error", handleSaveError);
    socket.on("load_session", handleLoadSession);
    socket.on("load_error", handleLoadError);

    return () => {
      socket.off("draw", handleDraw);
      socket.off("save_success", handleSaveSuccess);
      socket.off("save_error", handleSaveError);
      socket.off("load_session", handleLoadSession);
      socket.off("load_error", handleLoadError);
    };
  }, [socket]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current || !socket) return;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    socket.emit("draw", {
      x: offsetX,
      y: offsetY,
      color,
      strokeSize,
      type: "start",
      roomId,
    });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !contextRef.current || !socket) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    socket.emit("draw", {
      x: offsetX,
      y: offsetY,
      color,
      strokeSize,
      type: "draw",
      roomId,
    });
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Session management functions
  const saveSession = () => {
    if (!sessionName.trim()) {
      setError("Please enter a session name");
      return;
    }

    if (!socket || !canvasRef.current) {
      setError("Connection error. Please try again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const imageData = canvasRef.current.toDataURL();
    socket.emit("save_session", {
      roomId,
      sessionName: sessionName.trim(),
      imageData,
    });
  };

  const loadSession = () => {
    if (!sessionName.trim()) {
      setError("Please enter a session name");
      return;
    }

    if (!socket) {
      setError("Connection error. Please try again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    socket.emit("load_session", { roomId, sessionName: sessionName.trim() });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy room ID");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Room ID</h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomId}
                readOnly
                className="w-full p-2 border rounded bg-gray-50"
              />
              <button
                onClick={copyRoomId}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        {loading && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
            Processing...
          </div>
        )}

        <div className="flex justify-between mb-4">
          <div className="space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={strokeSize}
              onChange={(e) => setStrokeSize(e.target.value)}
              className="w-32"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name"
              className="border rounded px-2 py-1"
            />
            <button
              onClick={saveSession}
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save
            </button>
            <button
              onClick={loadSession}
              disabled={loading}
              className={`bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Load
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="border rounded-lg w-full h-[600px]"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
