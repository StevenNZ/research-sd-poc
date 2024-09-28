import WavesurferPlayer from "@wavesurfer/react";
import React from "react";
import WaveSurfer from "wavesurfer.js";
interface waveProps {
  height: number;
  waveColor: string;
  url: string;
  onReady: (ws: WaveSurfer) => void;
  onPlay: () => void;
  onPause: () => void;
}

const Wave = (props: waveProps) => {
  return (
    <div>
      <WavesurferPlayer
        height={props.height}
        waveColor={props.waveColor}
        url={props.url}
        onReady={props.onReady}
        onPlay={props.onPlay}
        onPause={props.onPause}
      />
    </div>
  );
};

export default Wave;
