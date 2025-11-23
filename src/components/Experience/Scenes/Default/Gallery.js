import Experience from "../../Experience.js";
import Plane from "./Plane/Plane.js";
import { Vector3 } from "three";
import sources from "../../sources.js";

export default class Gallery {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.sceneManager.currentScene.scene;
        this.debug = this.experience.debug;
        this.planes = [];

        this.createGalleryPlanes();
    }
    
    createGalleryPlanes() {
        const galleryTextures = sources.filter(source => 
            source.name.includes("galleryTexture")
        );

        const SPACING = 2;
        const COLUMNS = 4;
        const DEPTH_MIN = -1.5;
        const DEPTH_MAX = 1.5;

        galleryTextures.forEach(( source, index ) => {
            const row = Math.floor(index / COLUMNS);
            const col = index % COLUMNS;

            const depth = DEPTH_MIN + Math.random() * (DEPTH_MAX - DEPTH_MIN);

            const position = new Vector3(
                col * SPACING - (COLUMNS - 1) * SPACING * 0.5,
                row * SPACING - Math.floor(galleryTextures.length / COLUMNS - 1) * SPACING * 0.5,
                depth,
            )

            const plane = new Plane(position, source.name);
            this.planes.push(plane);
        })
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