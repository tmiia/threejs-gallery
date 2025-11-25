import * as THREE from "three";
import Experience from "./Experience";

export default class DragControls {
  constructor(camera) {
    this.experience = new Experience();
    this.camera = camera;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.currentMousePosition = { x: 0, y: 0 };
    this.velocity = new THREE.Vector2(0, 0);

    this.targetPosition = new THREE.Vector3();
    this.targetPosition.copy(this.camera.position);
    this.smoothing = 0.1;

    this.sensitivity = 0.005;

    this.baseFOV = 20;
    this.grabFOV = 26;
    this.currentFOV = this.baseFOV;
    this.targetFOV = this.baseFOV;
    this.fovSmoothness = 0.05;
    this.fovResetTimeout = null;
    this.fovResetDelay = 150;

    this.boundaries = {
      minX: -3,
      maxX: 3,
      minY: -3,
      maxY: 3,
    };

    this.raycastController = null;

    this.setupEventListeners();
  }

  setRaycastController(raycastController) {
    this.raycastController = raycastController;
  }

  // setBoundaries(boundaries) {
  //   this.boundaries = boundaries;
  // }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.onMouseUp.bind(this));

    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));

    this.canvas.addEventListener("dragstart", (e) => e.preventDefault());
  }

  onMouseDown(event) {
    if (this.raycastController && this.raycastController.hoveredObject) {
      return;
    }

    this.isDragging = true;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    this.velocity.set(0, 0);
    this.canvas.style.cursor = "grabbing";
    
    if (this.fovResetTimeout) {
      clearTimeout(this.fovResetTimeout);
      this.fovResetTimeout = null;
    }
    
    this.targetFOV = this.grabFOV;
  }

  onMouseMove(event) {
    if (!this.isDragging) {
      if (!this.raycastController || !this.raycastController.hoveredObject) {
        this.canvas.style.cursor = "grab";
      }
      return;
    }

    this.currentMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };

    const deltaX = this.currentMousePosition.x - this.previousMousePosition.x;
    const deltaY = this.currentMousePosition.y - this.previousMousePosition.y;

    this.updateCameraTarget(deltaX, deltaY);

    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.velocity.set(deltaX, deltaY);
  }

  onMouseUp() {
    this.isDragging = false;
    if (!this.raycastController || !this.raycastController.hoveredObject) {
      this.canvas.style.cursor = "grab";
    }
    
    if (this.fovResetTimeout) {
      clearTimeout(this.fovResetTimeout);
    }
    
    this.fovResetTimeout = setTimeout(() => {
      this.targetFOV = this.baseFOV;
      this.fovResetTimeout = null;
    }, this.fovResetDelay);
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      if (this.raycastController && this.raycastController.hoveredObject) {
        return;
      }

      this.isDragging = true;
      this.previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      this.velocity.set(0, 0);
      
      if (this.fovResetTimeout) {
        clearTimeout(this.fovResetTimeout);
        this.fovResetTimeout = null;
      }
      
      this.targetFOV = this.grabFOV;
    }
  }

  onTouchMove(event) {
    if (!this.isDragging || event.touches.length !== 1) return;

    event.preventDefault();

    this.currentMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };

    const deltaX = this.currentMousePosition.x - this.previousMousePosition.x;
    const deltaY = this.currentMousePosition.y - this.previousMousePosition.y;

    this.updateCameraTarget(deltaX, deltaY);

    this.previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };

    this.velocity.set(deltaX, deltaY);
  }

  onTouchEnd() {
    this.isDragging = false;
    
    if (this.fovResetTimeout) {
      clearTimeout(this.fovResetTimeout);
    }
    
    this.fovResetTimeout = setTimeout(() => {
      this.targetFOV = this.baseFOV;
      this.fovResetTimeout = null;
    }, this.fovResetDelay);
  }

  updateCameraTarget(deltaX, deltaY) {
    const moveX = -deltaX * this.sensitivity;
    const moveY = deltaY * this.sensitivity;

    this.targetPosition.x += moveX;
    this.targetPosition.y += moveY;

    // this.targetPosition.x = Math.max(
    //   this.boundaries.minX,
    //   Math.min(this.boundaries.maxX, this.targetPosition.x)
    // );
    // this.targetPosition.y = Math.max(
    //   this.boundaries.minY,
    //   Math.min(this.boundaries.maxY, this.targetPosition.y)
    // );
  }

  update() {
    this.currentFOV += (this.targetFOV - this.currentFOV) * this.fovSmoothness;
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();

    this.camera.position.x +=
      (this.targetPosition.x - this.camera.position.x) * this.smoothing;
    this.camera.position.y +=
      (this.targetPosition.y - this.camera.position.y) * this.smoothing;
  }

  destroy() {
    if (this.fovResetTimeout) {
      clearTimeout(this.fovResetTimeout);
      this.fovResetTimeout = null;
    }
    
    this.canvas.removeEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.removeEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.removeEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.removeEventListener("mouseleave", this.onMouseUp.bind(this));

    this.canvas.removeEventListener(
      "touchstart",
      this.onTouchStart.bind(this)
    );
    this.canvas.removeEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.removeEventListener("touchend", this.onTouchEnd.bind(this));
  }
}

