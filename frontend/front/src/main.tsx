import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import WebSocketTestGc from './TestWebSocketGc'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/user_stat" element={<WebSocketTestGc id={0} />} />
          <Route path="/ws" element={<WebSocketTestGc id={0} />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  </React.StrictMode>,
)
