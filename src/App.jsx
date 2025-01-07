import React, {useEffect, useState} from 'react';
import Scene from "./MainScene.jsx";
import {
  Canvas,
} from "@react-three/fiber";
import * as THREE from "three";

export default function () {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      console.log("Resize", window.innerWidth, window.innerHeight);
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    screen.orientation.addEventListener("change", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      screen.orientation.removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <div className="App">
      <Canvas width={canvasWidth} height={canvasHeight}>
        <Scene/>
      </Canvas>
      <div className="wrapper">
        <div className="social-links">
          <a target="_blank" href="https://www.linkedin.com/in/audifaxdev/"><img alt="LinkedIn"
                                                                                 src="/linkedin.png"/></a>
          <a target="_blank" href="https://github.com/audifaxdev"><img alt="GitHub" src="/github.svg"/></a>
          <a target="_blank" href="https://x.com/Audifaxdev"><img alt="X" src="/x.png"/></a>
        </div>
      </div>
    </div>
  )
}
