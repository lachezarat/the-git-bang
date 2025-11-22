uniform float uTime;
uniform float uPixelRatio;

attribute float size;
attribute vec3 color;
attribute float pulse;
attribute float activity;

varying vec3 vColor;
varying float vPulse;

void main() {
  vColor = color;
  
  // Pulsing animation based on activity
  float pulseIntensity = 0.5 + 0.5 * sin(uTime * activity * 2.0 + pulse * 6.28318);
  vPulse = pulseIntensity;
  
  // Position
  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition;
  
  // Size attenuation with distance + pulse
  gl_PointSize = size * uPixelRatio * (300.0 / -viewPosition.z) * (0.8 + 0.4 * pulseIntensity);
}
