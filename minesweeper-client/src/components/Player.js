// import { MD2Loader } from './MD2Loader.js';
import {
    Mesh,
    TextureLoader,
    MeshPhongMaterial,
    AnimationMixer,
    Vector3,
    BoxHelper,
    Raycaster,
    Vector2,
    LineBasicMaterial,
    Line,
    BufferGeometry,
    BufferAttribute,

} from "three"
// import texture from "../assets/bill.png"
// import md2 from "../assets/bill.md2"

export default class Player {
    constructor(game) {
        this.game = game
        this.scene = this.game.scene;
        this.manager = this.game.manager;
        this.mesh = null;
        this.geometry = null
        this.animationMixer = null
        this.animation = null
        // this.load()

        this.raycaster = new Raycaster();
        this.mouse = new Vector2();

        this.createCrosshair()

    }

    load() {
        new MD2Loader(this.manager).load(
            md2,
            geometry => {
                this.geometry = geometry;
                this.mesh = new Mesh(geometry, new MeshPhongMaterial({
                    map: new TextureLoader().load(texture),
                    morphTargets: true // animowanie materiału modelu
                }))
                this.mesh.position.y = 26
                this.animationMixer = new AnimationMixer(this.mesh);
                // this.scene.add(this.mesh);
                this.mesh.castShadow = true
                this.mesh.receiveShadow = true
                // this.playAnimation('stand')
            },
        );
    }

    unload() {
        this.scene.remove(this.mesh);
    }

    playAnimation(animation = this.animation) {
        if (animation != this.animation) {
            this.animation = animation
            this.animationMixer.uncacheRoot(this.mesh)
            this.animationMixer.clipAction(this.animation).play()
        }
    }

    update(delta) {
        // if (this.animationMixer) {
        //     this.animationMixer.update(delta);
        // }
        let direction = new Vector3()
        this.game.camera.getWorldDirection(direction)
        let angle = Math.atan2(direction.z, direction.x)
        this.lookingDirection = ""
        if (angle >= -Math.PI * 3 / 4 && angle <= -Math.PI / 4) {
            this.lookingDirection = "zNegative"
        } else if (angle >= -Math.PI / 4 && angle <= Math.PI / 4) {
            this.lookingDirection = "xPositive"
        } else if (angle >= Math.PI / 4 && angle <= Math.PI * 3 / 4) {
            this.lookingDirection = "zPositive"
        } else if (angle >= Math.PI * 3 / 4 || angle <= -Math.PI * 3 / 4) {
            this.lookingDirection = "xNegative"
        }
        // console.log(angle)
        // console.log(this.lookingDirection)

        var vector = new Vector3(0, 0, - 1);
        vector.applyQuaternion(this.game.camera.quaternion);
        // let angle = vector.angleTo( target.position );

        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        const intersects = this.raycaster.intersectObjects(this.game.board.tiles.map(tile => tile.mesh))
        if (intersects[0]) {
            this.tileLookedAt = intersects[0].object.parentObject
            // console.log(intersects[0])
        } else {
            this.tileLookedAt = null
        }
    }

    createCrosshair() {
        const material = new LineBasicMaterial({
            color: 0xFF0000,
            linewidth: 20,
        });
        const crosshairSize = 0.005
        const x = crosshairSize
        const y = crosshairSize;

        var geometry = new BufferGeometry();

        // crosshair
        let vertices = new Float32Array([
            0, y, 0,
            0, -y, 0,
            0, 0, 0,
            x, 0, 0,
            -x, 0, 0,
        ])
        geometry.setAttribute("position", new BufferAttribute(vertices, 3))
        var crosshair = new Line(geometry, material);

        // place it in the center
        var crosshairPercentX = 50;
        var crosshairPercentY = 50;
        var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

        crosshair.position.x = crosshairPositionX * this.game.camera.aspect;
        crosshair.position.y = crosshairPositionY;
        crosshair.position.z = -0.3;

        this.game.camera.add(crosshair);
    }
}