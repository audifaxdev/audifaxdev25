import {shaderMaterial} from "@react-three/drei";
import {Vector2} from "three";
import * as THREE from "three";

const AfterFxMaterial = shaderMaterial(
  {
    res: new Vector2(0, 0),
    mouseC: new Vector2(0.5, 0.5),
    bufferTexture: null,
    bufferTexture2: null,
    txtTexture: null,
    time: 0,
    dPxRatio: 0,
    fxStrength: 0.,
    fxStrength2: 0.,
    fxMouse: 1.,
    frameCount: 0.
  },
  // vertex shader
  /*glsl*/ `
    precision highp float;
    precision highp int;
  
    uniform vec2 res;
    varying vec2 vUv;
    void main () {
        vUv=uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
  // fragment shader
  /*glsl*/ `
    precision highp float;
    precision highp int;

    uniform float frameCount; 
    uniform float fxStrength; 
    uniform float fxStrength2; 
    uniform float fxMouse; 
    uniform float dPxRatio; 
    uniform float time; 
    uniform vec2 res; //The width and height of our screen
    uniform vec2 mouseC;
    uniform sampler2D bufferTexture;
    uniform sampler2D bufferTexture2;
    uniform sampler2D txtTexture;
    varying vec2 vUv;
    
    float cubicInOut(float t) {
      return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    
    vec2 center = vec2(.5, .5);
    float angle = 1.57;
    float scale = 1.;
    vec2 tSize = vec2(256,256);
    
    float pattern() {
      float s = sin( angle ), c = cos( angle );
      vec2 tex = vUv * tSize - center;
      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;
      return ( sin( point.x ) * sin( point.y ) ) * 4.0;
    }
 
    void main() {
      vec2 viewportUV = gl_FragCoord.xy / res.xy / dPxRatio;
      float viewportAspect = res.x / res.y;
      float circleRadius  = max(0., 50. / res.x);
      float circleRadius3  = max(0., 100. / res.x);
      float circleRadius2  = 1.;

      vec2 shapeUv = viewportUV - mouseC;
      shapeUv /= vec2(1.0, viewportAspect);
      shapeUv += mouseC ;

      float distFromMouse = distance(shapeUv, mouseC);
      float sDistFromMouse = smoothstep(0.001, circleRadius, distFromMouse);
      float sDistFromMouse2 = step(circleRadius3, distFromMouse);
      float sDistFromMouse3 = smoothstep(0.39, circleRadius2, 1.-distFromMouse);

      //y = a(x-h)2 + k
      float a = 50.;
      float k = 0.;
      float h = 1.2 * (.5 + (sin(time)/2.)) - .1;
      float parabol = a*(vUv.x - h)*(vUv.x - h) + k;
      parabol = 1. - parabol;
      
      float shift = max(cubicInOut(parabol), fxMouse- sDistFromMouse) * fxStrength / viewportAspect;
      
      vec4 blue = vec4(0.13, 0.85, 0.80, 1.0);
      vec4 red = vec4(0.82, 0.11, 0.13, 1.0);

      vec4 txColor = texture(bufferTexture, vUv);
      vec4 txColor2 = texture(bufferTexture2, vUv);
      float r = mix(
        texture(bufferTexture, vUv + vec2(shift, 0.)).r, 
        texture(bufferTexture, vUv + vec2(shift, 0.)).g, 
        1.-sDistFromMouse2
      );
      float b = mix(
        texture(bufferTexture, vUv - vec2(shift, 0.)).r, 
        texture(bufferTexture, vUv - vec2(shift, 0.)).g, 
        1.-sDistFromMouse2
      );
      vec4 distorted = red*r + blue*b;

      float x = (viewportUV.x + 4.0 ) * (viewportUV.y + 4.0 ) * (time * 10.0);
      vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * fxStrength2;

      grain *= sDistFromMouse3;
      
      distorted += vec4(vec3(txColor2.r), txColor2.a);

      vec4 bgColor = mix(vec4(vec3(0.),1.), vec4(vec3(.15), 1.), sDistFromMouse3);
      gl_FragColor = max(bgColor, distorted) + grain;
    }
  `
);

export default AfterFxMaterial;