import { PlaneGeometry, Mesh, ShaderMaterial, Vector3 } from "three";
import Experience from "../../../Experience.js";
import vertexShader from "./vertexShader.glsl";
import fragmentShader from "./fragmentShader.glsl";
import gsap from "gsap";

export default class Plane {
    constructor(position = new Vector3(0, 0, 0), textureName = "galleryTexture01") {
        this.experience = new Experience();
        this.scene = this.experience.sceneManager.currentScene.scene;
        this.debug = this.experience.debug;
        this.sizes = this.experience.sizes;
        this.position = position;
        this.textureName = textureName;
        this.texture = this.experience.resources.items[this.textureName];

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        const aspectRatio = this.texture.image.width / this.texture.image.height;
        
        const baseHeight = 6;
        const width = baseHeight * aspectRatio;
        
        this.geometry = new PlaneGeometry(width, baseHeight);
    }

    setMaterial() {
        this.material = new ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTexture: { value: this.texture },
                uRevealProgress: { value: 0.0 },
                uImageScale: { value: 1.0 },
            },
            transparent: true,
        })
    }

    setMesh() {
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.z = 0;
        this.mesh.rotation.x = 0;
        this.mesh.rotation.y = 0;
        
        const scale = this.sizes.isMobile ? 0.15 : 0.25;
        this.mesh.scale.set(scale, scale, scale);

        this.scene.add(this.mesh);

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("Plane");
            this.debugFolder.close();

            this.debugFolder.add(this.mesh.position, "x").name("positionX").min(-5).max(5).step(0.001);
            this.debugFolder.add(this.mesh.position, "y").name("positionY").min(-5).max(5).step(0.001);
            this.debugFolder.add(this.mesh.position, "z").name("positionZ").min(-5).max(5).step(0.001);
            this.debugFolder.add(this.material.uniforms.uRevealProgress, "value").name("Reveal Progress").min(0).max(1).step(0.01);
        }
    }
    
    playRevealAnimation(delay = 0) {
        gsap.to(this.material.uniforms.uRevealProgress, {
            value: 1.0,
            duration: 0.75,
            delay: delay,
           ease: "sine.in"
        });
    }

    update() {
    }

    destroy() {
        gsap.killTweensOf(this.material.uniforms.uRevealProgress);
        
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.mesh) this.scene.remove(this.mesh);
        if (this.debugFolder) this.debug.ui.removeFolder(this.debugFolder);
    }
}