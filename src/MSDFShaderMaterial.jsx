import {DoubleSide, RawShaderMaterial, Vector2} from "three";
import { Texture, Color, GLSL3 } from 'three'

class MSDFShaderMaterial extends RawShaderMaterial {
  constructor(opt) {
    opt = opt || {}
    let opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
    let color = opt.color
    let map = opt.map
    let gradMap = opt.gradMap
    // remove to satisfy r73
    delete opt.map
    delete opt.gradMap
    delete opt.color
    delete opt.precision
    delete opt.opacity
    delete opt.negate

    super( Object.assign({
      glslVersion: GLSL3,
      side: DoubleSide,
      uniforms: {
        opacity: { type: 'f', value: opacity },
        map: { type: 't', value: map || new Texture() },
        gradMap: { type: 't', value: gradMap || new Texture() },
        color: { type: 'c', value: new Color(color) },
      },
      vertexShader: `
        precision highp float;
        precision highp int;
      
        in vec2 uv;
        in vec4 position;
        out vec2 vUv;
        
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * position;
        }
      `,
      fragmentShader: `
        #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
        #endif

        precision highp float;
        precision highp int;
        
        uniform float opacity;
        uniform vec3 color;
        uniform sampler2D map;
        
        in vec2 vUv;
        out vec4 fragColor;
        
        #define width .30
        
        float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
        }

        void main() {
          vec3 s = texture(map, vUv).rgb;
          float sigDist = median(s.r, s.g, s.b) - 0.5;
          float fill = clamp((sigDist/fwidth(sigDist)) + 0.5, 0.0, 1.0);
          float border = fwidth(sigDist);
          float inside = smoothstep(0., border, sigDist);
          float outside = 1. - smoothstep(width-border, width, sigDist);
          float outline = inside * outside;

          fragColor = vec4(fill, outline, 0., fill) ;

          if (fragColor.a < .001) discard;
        }
      `
    }, opt));
  }
}

export default MSDFShaderMaterial;