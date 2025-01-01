import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Whiteboard from "./components/Whiteboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:roomId" element={<Whiteboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
