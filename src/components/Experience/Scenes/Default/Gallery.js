import Experience from "../../Experience.js";
import Plane from "./Plane/Plane.js";
import { Vector3 } from "three";
import sources from "../../sources.js";

export default class Gallery {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.sceneManager.currentScene.scene;
        this.sizes = this.experience.sizes;
        this.debug = this.experience.debug;
        this.planes = [];

        this.createGalleryPlanes();
        this.calculateBoundaries();
    }
    
    createGalleryPlanes() {
        const galleryTextures = sources.filter(source => 
            source.name.includes("galleryTexture")
        );

        this.SPACING = this.sizes.isMobile ? 1.35 : 2;
        this.COLUMNS = 4;
        const DEPTH_MIN = -1.5;
        const DEPTH_MAX = 1.5;

        galleryTextures.forEach(( source, index ) => {
            const row = Math.floor(index / this.COLUMNS);
            const col = index % this.COLUMNS;

            const depth = DEPTH_MIN + Math.random() * (DEPTH_MAX - DEPTH_MIN);

            const position = new Vector3(
                col * this.SPACING - (this.COLUMNS - 1) * this.SPACING * 0.5,
                row * this.SPACING - Math.floor(galleryTextures.length / this.COLUMNS - 1) * this.SPACING * 0.5,
                depth,
            )

            const plane = new Plane(position, source.name);
            this.planes.push(plane);
        })

        this.totalRows = Math.ceil(galleryTextures.length / this.COLUMNS);

        if (this.experience.raycastController) {
            this.experience.raycastController.setIntersectableObjects(this.planes);
        }
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
    }

    destroy() {
        this.planes.forEach(plane => {
            plane.destroy();
        })
        this.planes = [];
    }
}