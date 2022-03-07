import {
    PerspectiveCamera,
    Vector3,
    Raycaster,
    Ray,
    Vector4,
    Euler,
    // OrbitControls
} from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export default class PlayerController {
    constructor(
        game,
        distance = 100,
        angle = Math.PI / 4
    ) {
        this.game = game
        this.renderer = this.game.renderer
        this.scene = this.game.scene
        this.player = this.game.player
        this.config = this.game.config
        this.distance = distance
        this.angle = angle
        this.raycaster = new Raycaster()
        this.attackingEnemies = []


        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;

        this.controls = new PointerLockControls(this.game.camera, document.body);
        document.body.addEventListener('mousedown', e => {
            this.controls.lock()
        })

        this.walkingSpeed = 2
        this.sprintingSpeed = 5
        this.addKeyListeners()

        this.updateSize()
        window.addEventListener('resize', () => this.updateSize());
    }

    // public
    update(delta) {
        if (this.keys["KeyW"]) {
            if (this.keys["ShiftLeft"]) {
                this.controls.moveForward(this.sprintingSpeed)
            } else {
                this.controls.moveForward(this.walkingSpeed)
            }
        }
        if (this.keys["KeyS"]) this.controls.moveForward(-this.walkingSpeed)
        if (this.keys["KeyA"]) this.controls.moveRight(-this.walkingSpeed)
        if (this.keys["KeyD"]) this.controls.moveRight(this.walkingSpeed)
        this.player.update(delta)
    }

    // private
    addKeyListeners() {
        this.keys = {}
        document.addEventListener("keydown", e => {
            this.keys[e.code] = true
            if (e.code == "KeyR") {
                this.game.ws.send(JSON.stringify({
                    type: "newBoard",
                    width: this.game.board.width,
                    height: this.game.board.height,
                }))
            }
        })
        document.addEventListener("keyup", e => {
            this.keys[e.code] = false
        })
        document.addEventListener("mousedown", e => {
            if (this.controls.isLocked) {
                // LMB
                if (e.button == 0) {
                    if (this.player.tileLookedAt) {
                        this.player.tileLookedAt.open()
                    }
                }
                // RMB
                if (e.button == 2) {
                    if (this.player.tileLookedAt) {
                        this.player.tileLookedAt.toggleFlag()
                    }
                }
            }

            // this.keys[e.code] = false
        })
    }

    updateSize() {
        this.game.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
        this.game.camera.updateProjectionMatrix();
    }
}