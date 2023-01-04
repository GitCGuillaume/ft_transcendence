import { useState } from "react";
import transcendencelogo from "../assets/transcendence.png";
import "../App.css";
import { useNavigate } from "react-router-dom";

function CounterButton() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/counter");
  }

  return (
    <button type="button" onClick={handleClick}>
      Counter
    </button>
  );
}

const Homepage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="Logo">
      <div>
        <a>
          <img
            src={transcendencelogo}
            className="logo transcendence"
            alt="Transcendence logo"
          />
        </a>
      </div>
      <div>{CounterButton()}</div>
    </div>
  );
};

export default Homepage;
