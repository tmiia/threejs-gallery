import * as THREE from "three";
import Experience from "./Experience";

export default class RaycastController {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera.instance;
    this.sizes = this.experience.sizes;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    
    this.intersectableObjects = [];

    this.originalScales = new Map();
    this.hoverScale = 1.05;
    this.scaleSpeed = 0.1;

    this.setupEventListeners();
  }

  setIntersectableObjects(objects) {
    this.intersectableObjects = objects.map(obj => 
      obj.mesh ? obj.mesh : obj
    );
    
    this.intersectableObjects.forEach(mesh => {
      if (!this.originalScales.has(mesh)) {
        this.originalScales.set(mesh, mesh.scale.clone());
      }
    });
  }

  setupEventListeners() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
  }

  onMouseMove(event) {
    if (this.experience.camera.dragControls?.isDragging) {
      return;
    }

    this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;

    this.checkIntersections();
  }

  checkIntersections() {
    if (this.intersectableObjects.length === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.intersectableObjects, false);

    if (intersects.length > 0) {
      const newHovered = intersects[0].object;

      if (this.hoveredObject !== newHovered) {
        if (this.hoveredObject) {
          this.onMouseLeave(this.hoveredObject);
        }

        this.hoveredObject = newHovered;
        this.onMouseEnter(newHovered);
      }
    } else {
      if (this.hoveredObject) {
        this.onMouseLeave(this.hoveredObject);
        this.hoveredObject = null;
      }
    }
  }

  onMouseEnter(mesh) {
    this.canvas.style.cursor = "pointer";
    
    const originalScale = this.originalScales.get(mesh);
    if (originalScale) {
      mesh.userData.targetScale = originalScale.clone().multiplyScalar(this.hoverScale);
      mesh.userData.isHovered = true;
    }
  }

  onMouseLeave(mesh) {
    if (!this.experience.camera.dragControls?.isDragging) {
      this.canvas.style.cursor = "grab";
    }
    
    const originalScale = this.originalScales.get(mesh);
    if (originalScale) {
      mesh.userData.targetScale = originalScale.clone();
      mesh.userData.isHovered = false;
    }
  }

  update() {
    this.intersectableObjects.forEach(mesh => {
      if (mesh.userData.targetScale) {
        mesh.scale.lerp(mesh.userData.targetScale, this.scaleSpeed);
      }
    });
  }

  destroy() {
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    
    this.intersectableObjects.forEach(mesh => {
      const originalScale = this.originalScales.get(mesh);
      if (originalScale) {
        mesh.scale.copy(originalScale);
      }
    });
    
    this.originalScales.clear();
    this.intersectableObjects = [];
    this.hoveredObject = null;
  }
}

