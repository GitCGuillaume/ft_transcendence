import { useState } from 'react'
import reactLogo from './assets/react.svg'
import nestLogo from './assets/logo-small.ede75a6b.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Vite + React + Nest.js</h1>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={nestLogo} className="logo" alt="Nest.js logo" />
        </a>
      </div>
      <button className="login">LOG IN WITH 42</button>
    </div>
  )
}

export default App
