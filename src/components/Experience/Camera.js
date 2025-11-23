import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Experience from "./Experience";
import DragControls from "./DragControls";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.instance = null;

    // this.scene = this.experience.sceneManager.currentScene.scene;

    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      20,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.instance.position.set(0, 0, 10);
    // this.scene.add(this.instance);
  }

  setControls() {
    // this.controls = new OrbitControls(this.instance, this.canvas);
    // this.controls.enableDamping = true;
    // this.controls.enableZoom = false;

    this.dragControls = new DragControls(this.instance);
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    // this.controls.update();
    if (this.dragControls) {
      this.dragControls.update();
    }
  }

  destroy() {
    if (this.dragControls) {
      this.dragControls.destroy();
    }
  }
}