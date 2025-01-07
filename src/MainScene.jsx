import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {
  useFrame,
  useThree,
  extend,
} from "@react-three/fiber";
import {
  OrthographicCamera,
  PerspectiveCamera, RenderTexture
} from "@react-three/drei";
import {isMobile} from 'react-device-detect';
import TextScene from "./TextScene.jsx";
import AfterFxMaterial from './AfterFxMaterial.jsx';
import TextScene2 from "./TextScene2.jsx";

extend({AfterFxMaterial})
//wave shift
const getFxStrength = () => {
  if (window.innerWidth < 480) {
    return .004 ;
  } else if (window.innerWidth >= 480 && window.innerWidth < 600) {
    return .004;
  } else if (window.innerWidth >= 600 && window.innerWidth < 1024) {
    return .004;
  } else {
    return .005;
  }
}
//grain
const getFxStrength2 = () => {
  if (window.innerWidth < 480) {
    return 20 ;
  } else if (window.innerWidth >= 480 && window.innerWidth < 600) {
    return 20;
  } else {
    return 20;
  }
}
//mouse proximity shift
const getFxStrength3 = () => {
  if (window.innerWidth < 480) {
    return 1.3 ;
  } else if (devicePixelRatio > 1) {
    return 1.2;
  } else {
    return 1.;
  }
}
const Scene = () => {
  const {size, camera, viewport, scene} = useThree();
  const [txtFrame, setTextFrame] = useState(null);
  const [txtFrame2, setTextFrame2] = useState(null);
  const [fxStrength, setFxStrength] = useState(getFxStrength());
  const [fxStrength2, setFxStrength2] = useState(getFxStrength2());
  const afterFxMaterialRef = useRef(null);
  const textSceneCameraRef = useRef(null);
  const textSceneCameraRef2 = useRef(null);
  const textSceneRef = useRef(null);
  const textSceneRef2 = useRef(null);
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const planeHeight = 1;
  const distance = 1;
  const aspecRatio = size.width / size.height;
  const fov = 2 * Math.atan((planeHeight / 2) / distance) * (180 / Math.PI);

  useFrame((state, delta) => {
    if (afterFxMaterialRef.current) {
      afterFxMaterialRef.current.uniforms.time.value += delta;
      afterFxMaterialRef.current.uniforms.frameCount.value += .01;
    }
  })

  window.addEventListener('pointermove',  (e) => {
      pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      if (afterFxMaterialRef.current) {
        camera.updateMatrixWorld();
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects( scene.children, false );
        if (intersects.length) {
          afterFxMaterialRef.current.uniforms.mouseC.value = intersects[0].uv;
        }
      }
    });
  window.addEventListener('touchstart',  (e) => {
    let lastTouch = e.touches[0];
    pointer.x = ( lastTouch.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( lastTouch.clientY / window.innerHeight ) * 2 + 1;
    if (afterFxMaterialRef.current) {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects( scene.children, false );
      if (intersects.length) {
        afterFxMaterialRef.current.uniforms.mouseC.value = intersects[0].uv;
      }
    }
  });

  useEffect(() => {
    const handleResize = () => {

      if (afterFxMaterialRef.current) {
        afterFxMaterialRef.current.uniforms.res.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        afterFxMaterialRef.current.uniforms.dPxRatio.value = Math.min(devicePixelRatio, 2);
        afterFxMaterialRef.current.uniforms.fxStrength.value = getFxStrength();
        afterFxMaterialRef.current.uniforms.fxStrength2.value = getFxStrength2();
      }
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
    <>
      <PerspectiveCamera
        makeDefault
        position={[0,0,1]}
        fov={fov}
        aspect={aspecRatio}
        near={.1}
        far={1000}
      />
      <mesh>
        <planeGeometry args={[size.width/size.height, 1, 1, 1]} attach="geometry" />
        <afterFxMaterial frameCount={0.}
                         fxStrength={fxStrength}
                         fxStrength2={fxStrength2}
                         fxMouse={getFxStrength3()}
                         ref={afterFxMaterialRef}
                         res={new THREE.Vector2(size.width,size.height)}
                         dPxRatio={devicePixelRatio}
                         bufferTexture={txtFrame}
                         bufferTexture2={txtFrame2}
        />
      </mesh>
      <RenderTexture frames={1} onUpdate={frame => setTimeout(() => setTextFrame(frame), 0)}>
        <TextScene visible={true} ref={textSceneRef} />
        <OrthographicCamera
          makeDefault
          position={[0, 0, 1]}
          args={[
            -1, 1, 1, -1, 1, 1000
          ]}
          aspect={size.width / size.height}
          zoom={1}
          ref={textSceneCameraRef}
        />
      </RenderTexture>
      <RenderTexture frames={1} onUpdate={frame => setTimeout(() => setTextFrame2(frame), 0)}>
        <TextScene2 visible={true} ref={textSceneRef2} />
        <OrthographicCamera
          makeDefault
          position={[0, 0, 1]}
          args={[
            -1, 1, 1, -1, 1, 1000
          ]}
          aspect={size.width / size.height}
          zoom={1}
          ref={textSceneCameraRef2}
        />
      </RenderTexture>
    </>
  )
}

export default Scene;