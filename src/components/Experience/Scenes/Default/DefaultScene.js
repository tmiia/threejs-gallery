import * as THREE from "three";
import Scene from "../Scene.js";
import Cube from "./Cube/Cube.js";
import Plane from "./Plane/Plane.js";
import Environement from "./Environment.js";
import Gallery from "./Gallery.js";

export default class DefaultScene extends Scene {
  init() {
    this.resources = this.experience.resources;

    // this.cube = new Cube(new THREE.Vector3(2, 0.5, 0));

    if (this.resources.toLoad === this.resources.loaded) {
      this.onResourcesLoaded();
    } else {
      this.resources.on("loaded", () => this.onResourcesLoaded());
    }
  }

  onResourcesLoaded() {
    // this.plane = new Plane(new THREE.Vector3(0, 0, 0));
    this.gallery = new Gallery();
    this.environement = new Environement();
  }

  update() {
    // if (this.cube) this.cube.update();
    if (this.gallery) this.gallery.update();
  }

  destroy() {
    // if (this.cube) this.cube.destroy();
    if (this.gallery) this.gallery.destroy();
  }
}