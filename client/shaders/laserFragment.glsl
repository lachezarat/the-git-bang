uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Simple noise function
float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Fresnel effect (brighter at edges)
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  // Core to edge gradient (radial from center)
  float radial = abs(vUv.x - 0.5) * 2.0;
  float core = 1.0 - smoothstep(0.0, 0.8, radial);
  
  // Animated scan effect moving along beam
  float scan = fract(vUv.y * 2.0 - uTime * 0.5);
  scan = smoothstep(0.0, 0.1, scan) * smoothstep(0.3, 0.2, scan);
  
  // Animated noise for energy feel
  vec2 noiseCoord = vUv * 10.0 + vec2(0.0, uTime * 0.3);
  float noiseValue = noise(noiseCoord) * 0.3;
  
  // Combine effects
  float brightness = core * (0.6 + fresnel * 0.4) + scan * 0.4 + noiseValue;
  brightness *= uIntensity;
  
  // Pulsing
  float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
  brightness *= pulse;
  
  vec3 finalColor = uColor * brightness;
  float alpha = brightness * (0.7 + fresnel * 0.3);
  
  gl_FragColor = vec4(finalColor, alpha);
}
