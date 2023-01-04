import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Counter from "./components/Counter";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Counter />} />
      </Routes>
    </Router>
  )
}

export default App
