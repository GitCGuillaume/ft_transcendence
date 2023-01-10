import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Counter from "./components/Counter";
import Homepage from "./components/Homepage";
import WebSocketTestGc from './TestWebSocketGc'
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="/ws" element={<WebSocketTestGc id={0} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
