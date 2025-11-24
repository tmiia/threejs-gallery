varying vec2 vUv;

uniform float uCurvatureStrength;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 screenPosition = projectionMatrix * viewMatrix * worldPosition;
    
    vec2 ndc = screenPosition.xy / screenPosition.w;
    
    float distanceFromCenter = length(ndc);
    
    float curveFactor = distanceFromCenter * distanceFromCenter;
    
    vec3 curvedPosition = position;
    
    curvedPosition.z -= curveFactor * uCurvatureStrength * 2.0;
    
    float edgeBend = distanceFromCenter * uCurvatureStrength * 0.3;
    curvedPosition.x *= (1.0 - edgeBend);
    curvedPosition.y *= (1.0 - edgeBend);
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(curvedPosition, 1.0);
    
    vUv = uv;
}