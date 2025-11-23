varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uRevealProgress;

void main() {
    if (vUv.y > uRevealProgress) {
        discard;
    }
    
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = textureColor;
}