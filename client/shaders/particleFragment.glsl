varying vec3 vColor;
varying float vPulse;

// Ordered dithering matrix (4x4 Bayer matrix)
float dither4x4(vec2 position, float brightness) {
  int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;
  float limit = 0.0;
  
  if (index == 0) limit = 0.0625;
  else if (index == 1) limit = 0.5625;
  else if (index == 2) limit = 0.1875;
  else if (index == 3) limit = 0.6875;
  else if (index == 4) limit = 0.8125;
  else if (index == 5) limit = 0.3125;
  else if (index == 6) limit = 0.9375;
  else if (index == 7) limit = 0.4375;
  else if (index == 8) limit = 0.25;
  else if (index == 9) limit = 0.75;
  else if (index == 10) limit = 0.125;
  else if (index == 11) limit = 0.625;
  else if (index == 12) limit = 1.0;
  else if (index == 13) limit = 0.5;
  else if (index == 14) limit = 0.875;
  else if (index == 15) limit = 0.375;
  
  return brightness < limit ? 0.0 : 1.0;
}

void main() {
  // Create circular particle shape
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  if (dist > 0.5) {
    discard;
  }
  
  // Star glow with chromatic aberration
  float glow = 1.0 - dist * 2.0;
  glow = pow(glow, 2.0);
  
  // Chromatic aberration offset
  vec3 chromaticColor = vColor;
  float aberration = 0.02;
  
  // Red channel offset
  float distR = length(center - vec2(aberration, 0.0));
  float glowR = 1.0 - distR * 2.0;
  glowR = pow(max(glowR, 0.0), 2.0);
  
  // Blue channel offset
  float distB = length(center + vec2(aberration, 0.0));
  float glowB = 1.0 - distB * 2.0;
  glowB = pow(max(glowB, 0.0), 2.0);
  
  vec3 finalColor = vec3(
    vColor.r * glowR,
    vColor.g * glow,
    vColor.b * glowB
  );
  
  // Apply pulse
  finalColor *= (0.7 + 0.3 * vPulse);
  
  // Core bright spot
  float core = 1.0 - smoothstep(0.0, 0.2, dist);
  finalColor += vec3(1.0) * core * 0.5;
  
  // Dithering for retro aesthetic
  float brightness = (finalColor.r + finalColor.g + finalColor.b) / 3.0;
  float dither = dither4x4(gl_FragCoord.xy, brightness);
  
  // Apply dithering subtly
  finalColor = mix(finalColor, finalColor * dither, 0.15);
  
  gl_FragColor = vec4(finalColor, glow * (0.8 + 0.2 * vPulse));
}
