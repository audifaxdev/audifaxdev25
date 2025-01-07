import {useRef, useEffect, forwardRef, useState, useMemo, useCallback, useLayoutEffect} from 'react';
import {
  Html,
  useTexture,
} from '@react-three/drei';

import {
  Clock,
  NearestMipmapNearestFilter,
  Vector3,
} from 'three';
import {useControls} from 'leva';
import {extend, useFrame, useThree} from '@react-three/fiber';
import {TextGeometry as BMFTextGeometry} from "three-bmfont-text-es/";
import MSDFShaderMaterial from './MSDFShaderMaterial.jsx';
import font from "./assets/LatoBlack.msdf.json";
import * as THREE from "three";
import {Center} from '@react-three/drei';

extend({BMFTextGeometry})
extend({MSDFShaderMaterial})

const horizontalTxt = `Software Engineer`;

const fixLayout = (bGeo) => {
  bGeo.scale(fontScale, -fontScale, -fontScale);
  bGeo.computeBoundingBox();
  const b = bGeo.boundingBox;
  let min = b.min;
  let size = new Vector3();
  b.getSize(size);
  size = size.multiplyScalar(0.5);
  bGeo.translate(-min.x-size.x, -min.y-size.y, -min.z-size.z);
  bGeo.attributes.position.needsUpdate = true;
  bGeo.computeBoundingBox();
  bGeo.computeBoundingSphere();
}

const getRespScale = () => {
  if (window.innerWidth < 480) {
    return 1.5;
  } else if (window.innerWidth >= 480 && window.innerWidth < 600) {
    return 2.;
  } else if (window.innerWidth >= 600 && window.innerWidth < 1024) {
    return 2.5;
  } else {
    return 3.;
  }
}

const margin = .5;
const fontScale = 1;
const TextFx = forwardRef((props, ref) => {
  const { width, height } = useThree((state) => state.viewport)
  const textRef = useRef();
  const matRef = useRef();
  const [scale, setScale] = useState(getRespScale());
  const axesHelper = useRef();
  const [text, setText] = useState(horizontalTxt);
  const map = useTexture("./LatoBlack.msdf.png");
  map.minFilter = NearestMipmapNearestFilter;
  const clock = new Clock();
  clock.getElapsedTime();

  useFrame(() => {
    if (matRef.current) {
      // matRef.current.uniforms.time.value += .1;
    }
  });
  useEffect(() => {
    const handleResize = () => {
      if (matRef.current) {
        const respScale = getRespScale();
        if (respScale !== scale) {
          setScale(respScale)
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setScale,scale]);
  const bmFTextStableRef = useRef(null);

  useLayoutEffect(() => {
    if (!bmFTextStableRef.current) {
      console.log('bmFTextStableRef is null');
      return;
    }
    const bGeo = bmFTextStableRef.current;
    fixLayout(bGeo);
  }, [bmFTextStableRef.current]);

  return (
    <>
      {/*<axesHelper />*/}
      <color args={["black"]} attach="background"/>
      <mesh ref={textRef} position={[0, 0 -20*scale, 0]} scale={[scale/2, scale/2, scale/2]}>
        <bMFTextGeometry ref={bmFTextStableRef} args={[{
          text,
          font,
          align: 'center',
          lineHeight: 40,
          flipY: map.flipY,
          tabSize: .25
        }]}/>
        <mSDFShaderMaterial ref={matRef} args={[{
          map,
          transparent: true,
          color: '#ff0000',
          negate: false,
        }]}/>
      </mesh>
    </>
  );
});

export default TextFx;