import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import WebSocketTestGc from './TestWebSocketGc'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <React.Fragment>
      <App />
      <BrowserRouter>
        <WebSocketTestGc />
      </BrowserRouter>
    </React.Fragment>
  </React.StrictMode>,
)
