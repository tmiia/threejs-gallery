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
    this.scaleSpeed = 0.03;

    this.clickedObject = null;
    this.originalPositions = new Map();
    this.animationSpeed = 0.05;
  
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
    this.boundClick = this.onClick.bind(this);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("click", this.boundClick);
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
      // mesh.userData.targetScale = originalScale.clone().multiplyScalar(this.hoverScale);
      mesh.userData.targetImageScale = 1.45;
      mesh.userData.isHovered = true;
    }
  }

  onMouseLeave(mesh) {
    if (!this.experience.camera.dragControls?.isDragging) {
      this.canvas.style.cursor = "grab";
    }
    
    const originalScale = this.originalScales.get(mesh);
    if (originalScale) {
      // mesh.userData.targetScale = originalScale.clone();
      mesh.userData.targetImageScale = 1.3;
      mesh.userData.isHovered = false;
    }
  }

  onClick(event) {
    if (this.experience.camera.dragControls?.isDragging) {
      return;
    }

    this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.intersectableObjects, false);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      
      if (this.clickedObject === clickedMesh) {
        this.returnPlaneToOriginal(clickedMesh);
      } else {

        if (this.clickedObject) {
          this.returnPlaneToOriginal(this.clickedObject);
        }

        this.animatePlaneToCamera(clickedMesh);
      }
    } else {
      if (this.clickedObject) {
        this.returnPlaneToOriginal(this.clickedObject);
      }
    }
  }

  animatePlaneToCamera(mesh) {
    if (this.clickedObject) {
      return;
    }

    if (!this.originalPositions.has(mesh)) {
      this.originalPositions.set(mesh, {
        position: mesh.position.clone(),
        parent: mesh.parent
      });
    }

    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    
    const distance = this.sizes.isMobile ? 6 : 5;
    const targetWorldPosition = this.camera.position.clone().add(
      cameraDirection.multiplyScalar(distance)
    );

    const parent = mesh.parent;
    if (parent) {
      const worldPosition = new THREE.Vector3();
      mesh.getWorldPosition(worldPosition);
      
      parent.remove(mesh);
      this.experience.sceneManager.currentScene.scene.add(mesh);
      
      mesh.position.copy(worldPosition);
    }

    mesh.userData.targetPosition = targetWorldPosition;
    mesh.userData.isAnimating = true;
    this.clickedObject = mesh;
  }

  returnPlaneToOriginal(mesh) {
    const originalData = this.originalPositions.get(mesh);
    if (!originalData) return;

    const targetWorldPosition = new THREE.Vector3();
    if (originalData.parent) {
      const parentWorldPosition = new THREE.Vector3();
      originalData.parent.getWorldPosition(parentWorldPosition);
      
      targetWorldPosition.copy(parentWorldPosition).add(originalData.position);
    }

    mesh.userData.targetPosition = targetWorldPosition;
    mesh.userData.isReturning = true;
    mesh.userData.originalData = originalData;
  }

  update() {
    this.intersectableObjects.forEach(mesh => {
      if (mesh.userData.targetImageScale != undefined && mesh?.material?.uniforms.uImageScale) {
        const current = mesh.material.uniforms.uImageScale.value;
        const target = mesh.userData.targetImageScale;
        mesh.material.uniforms.uImageScale.value += (target - current) * this.scaleSpeed;
      }

      if (mesh.userData.isAnimating && mesh.userData.targetPosition) {
        mesh.position.lerp(mesh.userData.targetPosition, this.animationSpeed);
        
        if (mesh.position.distanceTo(mesh.userData.targetPosition) < 0.01) {
          mesh.userData.isAnimating = false;
        }
      }

      if (mesh.userData.isReturning && mesh.userData.targetPosition) {
        mesh.position.lerp(mesh.userData.targetPosition, this.animationSpeed);
        
        if (mesh.position.distanceTo(mesh.userData.targetPosition) < 0.01) {
          mesh.userData.isReturning = false;
          
          const originalData = mesh.userData.originalData;
          if (originalData && originalData.parent) {
            if (mesh.parent) {
              mesh.parent.remove(mesh);
            }
            
            originalData.parent.add(mesh);
            mesh.position.copy(originalData.position);
          }
          
          mesh.userData.originalData = null;
          this.clickedObject = null;
        }
      }
    });
  }

  destroy() {
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("click", this.boundClick);
    
    this.intersectableObjects.forEach(mesh => {
      const originalScale = this.originalScales.get(mesh);
      if (originalScale) {
        mesh.scale.copy(originalScale);
      }

      const originalData = this.originalPositions.get(mesh);
      if (originalData) {
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        
        if (originalData.parent) {
          originalData.parent.add(mesh);
          mesh.position.copy(originalData.position);
        }
      }
    });
    
    this.originalScales.clear();
    this.originalPositions.clear();
    this.intersectableObjects = [];
    this.hoveredObject = null;
    this.clickedObject = null;
  }
}

