import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";

//Royalty-free music!! ALL FREE TO USE:TM:

//Get Ready - Safu works
import GetReady4Fun from "../assets/GetReady.mp3";
//Memento - MoGura
import Memento from "../assets/memento.mp3";
//Fizzy Honey Lemon Soda 350ml - しゃろう
import Fizzy from "../assets/FizzySharou.mp3";
//10°C - しゃろう
import TenC from "../assets/10CSharou.mp3";
//Summer Triangle - しゃろう
import SummerTriangle from "../assets/SummerTriangleSharou.mp3";
///Superstar - しゃろう
import Superstar from "../assets/SuperstarSharou.mp3";
///Inner Flame - DOVA SYNDROME
import InnerFlame from "../assets/inner_flame.mp3";
import "./PlayerApp.css";
import "react-h5-audio-player/lib/styles.css";

const playlist = [
  { src: GetReady4Fun },
  { src: Memento },
  { src: Fizzy },
  { src: TenC },
  { src: SummerTriangle },
  { src: Superstar },
  { src: InnerFlame },
];

const PlayerApp = () => {
  const [currentTrack, setTrackIndex] = useState(0);
  const handleClickNext = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };
  const handleClickPrevious = () => {
    setTrackIndex((currentTrack) =>
      currentTrack > 0 ? currentTrack - 1 : playlist.length - 1
    );
  };
  const handleEnd = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };
  return (
    <div className="container">
      <AudioPlayer
        src={playlist[currentTrack].src}
        showSkipControls
        onClickNext={handleClickNext}
        onEnded={handleEnd}
        onClickPrevious={handleClickPrevious}
        onPlayError={(e) => console.log("onPlayError", e)}
      //autoPlay={true} works but browsers show a warning they don't like an autoplay
      />
    </div>
  );
};

export default PlayerApp;
