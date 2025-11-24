varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uRevealProgress;
uniform float uImageScale;

void main() {
    if (vUv.y > uRevealProgress) {
        discard;
    }

    vec2 centeredUv = vUv - 0.5;
    centeredUv /= uImageScale;
    centeredUv += 0.5;

    
    vec4 textureColor = texture2D(uTexture, centeredUv);
    gl_FragColor = textureColor;
}