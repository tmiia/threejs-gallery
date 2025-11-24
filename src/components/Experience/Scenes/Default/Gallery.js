import Experience from "../../Experience.js";
import Plane from "./Plane/Plane.js";
import { Vector3, Group } from "three";
import sources from "../../sources.js";

export default class Gallery {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.sceneManager.currentScene.scene;
        this.sizes = this.experience.sizes;
        this.debug = this.experience.debug;
        this.planes = [];
        this.depthPattern = [];
        this.grid_width = 0;
        this.grid_height = 0;
        this.all_planes = [];

        this.createGalleryPlanes();
        // this.calculateBoundaries();
        this.createGridDuplication();
    }
    
    createGalleryPlanes() {
        const galleryTextures = sources.filter(source => 
            source.name.includes("galleryTexture")
        );

        this.SPACING = this.sizes.isMobile ? 1.35 : 2;
        this.COLUMNS = 4;
        const DEPTH_MIN = -1.2;
        const DEPTH_MAX = 1.1;

        for (let i = 0; i < galleryTextures.length; i++) {
        }
        
        galleryTextures.forEach(( source, index ) => {
            const depth = DEPTH_MIN + Math.random() * (DEPTH_MAX - DEPTH_MIN);
            this.depthPattern.push(depth);

            const row = Math.floor(index / this.COLUMNS);
            const col = index % this.COLUMNS;

            const position = new Vector3(
                col * this.SPACING - (this.COLUMNS - 1) * this.SPACING * 0.5,
                row * this.SPACING - Math.floor(galleryTextures.length / this.COLUMNS - 1) * this.SPACING * 0.5,
                depth,
            )

            const plane = new Plane(position, source.name);
            this.planes.push(plane);
            
            const staggerDelay = Math.random() * 0.5;
            plane.playRevealAnimation(staggerDelay);
        })

        this.totalRows = Math.ceil(galleryTextures.length / this.COLUMNS);
    }

    createGridDuplication() {
        this.grid_width = this.COLUMNS * this.SPACING;
        this.grid_height = this.totalRows * this.SPACING;
    
        this.gallery_group = [];
    
        for (let offsetY = -1; offsetY <= 1; offsetY++) {
            for (let offsetX = -1; offsetX <= 1; offsetX++) {
                const group = new Group();
                
                group.position.set(
                    offsetX * this.grid_width,
                    offsetY * this.grid_height,
                    0
                );
    
                this.planes.forEach(plane => {
                    const clone = plane.mesh.clone();
                    group.add(clone);
                    this.all_planes.push(clone);
                });
    
                this.scene.add(group);
                
                this.gallery_group.push({
                    offset: { x: offsetX, y: offsetY },
                    group: group
                });
            }
        }

        if (this.experience.raycastController) {
            this.experience.raycastController.setIntersectableObjects(this.all_planes);
        }
    }

    setPosition() {
        const currentCameraPosition = this.experience.camera.instance.position;
    
        this.gallery_group.forEach(group => {
            const relativeX = group.offset.x * this.grid_width - currentCameraPosition.x;
            const relativeY = group.offset.y * this.grid_height - currentCameraPosition.y;
            
            if (relativeX < -this.grid_width * 1.5) {
                group.offset.x += 3;
            } else if (relativeX > this.grid_width * 1.5) {
                group.offset.x -= 3;
            }
    
            if (relativeY < -this.grid_height * 1.5) {
                group.offset.y += 3;
            } else if (relativeY > this.grid_height * 1.5) {
                group.offset.y -= 3;
            }
    
            group.group.position.set(
                group.offset.x * this.grid_width,
                group.offset.y * this.grid_height,
                0
            );
        });
    }

    calculateBoundaries() {
        const galleryWidth = (this.COLUMNS - 1) * this.SPACING;
        const galleryHeight = (this.totalRows - 1) * this.SPACING;

        const paddingX = 0.05;
        const paddingY = 0.05;

        const boundaries = {
            minX: -galleryWidth / 2 - paddingX,
            maxX: galleryWidth / 2 + paddingX,
            minY: -galleryHeight / 2 - paddingY,
            maxY: galleryHeight / 2 + paddingY,
        };

        if (this.experience.camera && this.experience.camera.dragControls) {
            this.experience.camera.dragControls.setBoundaries(boundaries);
        }

        if (this.debug.active) {
            console.log('Gallery boundaries:', boundaries);
            console.log('Gallery dimensions:', { 
                width: galleryWidth, 
                height: galleryHeight,
                columns: this.COLUMNS,
                rows: this.totalRows
            });
        }
    }

    update() {
        this.planes.forEach(plane => {
            plane.update();
        })

        this.setPosition();
    }

    destroy() {
        this.planes.forEach(plane => {
            plane.destroy();
        })
        this.planes = [];
    }
}