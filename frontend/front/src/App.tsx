import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Counter from "./components/Counter";
import Homepage from "./components/Homepage";
import ListChannel from "./components/ListChannel";
import Chat from "./components/Chat";
import WebSocketTestGc from './TestWebSocketGc'
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="/ws" element={<WebSocketTestGc id={0} />} />
          <Route path="/channels" element={<ListChannel />}>
            <Route path=":id" element={<ErrorBoundary><Chat /></ErrorBoundary>} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
