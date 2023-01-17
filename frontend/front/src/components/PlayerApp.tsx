import { useState } from "react";
import AudioPlayer from 'react-h5-audio-player';

//Royalty-free music!!
//Fizzy Honey Lemon Soda 350ml - しゃろう
import Fizzy from '../assets/FizzySharou.mp3';
//10°C - しゃろう
import TenC from '../assets/10CSharou.mp3';
//Summer Triangle - しゃろう
import SummerTriangle from '../assets/SummerTriangleSharou.mp3';

import './PlayerApp.css';
import 'react-h5-audio-player/lib/styles.css';
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

const playlist = [
  { src: Fizzy },
  { src: TenC },
  { src: SummerTriangle },
]

const PlayerApp = () => {
  const [currentTrack, setTrackIndex] = useState(0)
  const handleClickNext = () => {
      console.log('click next')
        setTrackIndex((currentTrack) =>
            currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
        );
    };
  
  const handleEnd = () => {
    console.log('end')
    setTrackIndex((currentTrack) =>
            currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
        );
  }
  return (
      <div className="container">
        <AudioPlayer
          src={playlist[currentTrack].src}
          showSkipControls
          onClickNext={handleClickNext}
          onEnded={handleEnd}
          // Try other props!
        />
      </div>
    );
}

export default PlayerApp;