import {
    Scene,
    AmbientLight,
    AxesHelper,
    Clock,
    Vector3,
    PolyhedronGeometry,
    Mesh,
    MeshNormalMaterial,
    DoubleSide,
    BufferGeometry,
    BufferAttribute,
    MeshPhongMaterial,
    TextureLoader,
    MeshBasicMaterial,
    RepeatWrapping,
    ImageLoader,
    Vector2,
    Box3,
    NearestFilter,
    LinearMipMapLinearFilter,
    PlaneGeometry,
} from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import obj from '../../assets/flag.obj'
import mtl from '../../assets/flag.mtl'

export default class Flag {
    constructor(tile, x, z) {
        this.tile = tile
        this.board = this.tile.board
        this.x = this.tile.x
        this.z = this.tile.z
        this.game = this.board.game
        // this.load()
    }

    static preload(manager, f) {
        manager.itemStart("flag")
        const mtlLoader = new MTLLoader()
        // mtlLoader.setPath('src/assets/')
        // mtlLoader.load("flag.mtl", materials => {
        mtlLoader.load(mtl, materials => {
            materials.preload()
            const objLoader = new OBJLoader()
            objLoader.setMaterials(materials)
            // objLoader.setPath('src/assets/')
            // objLoader.load('flag.obj', flag => {
            objLoader.load(obj, flag => {
                f(flag)
                manager.itemEnd("flag")
            })
        })
    }

    load() {
        console.log(this.board.preloadedFlag)
        this.mesh = this.board.preloadedFlag.clone()
        // this.game.scene.add(this.mesh)
        this.setPosition()
    }

    setPosition() {
        // object.position.y = - 95;
        // this.mesh.position.set(35, 35, 35)


        const box = new Box3().setFromObject(this.mesh);
        this.size = new Vector3()
        box.getSize(this.size)
        // console.log(this.size);
        // console.log(this.mesh)
        this.mesh.children[0].material.side = DoubleSide
        this.mesh.children[1].material.side = DoubleSide
        this.mesh.children[0].material.color.set("red")
        // this.mesh.children[1].material.transparent = false

        this.mesh.position.x = this.board.tileSize * this.x - this.board.width * this.board.tileSize / 2 + this.board.tileSize / 2
        this.mesh.position.z = this.board.tileSize * this.z - this.board.height * this.board.tileSize / 2 + this.board.tileSize / 2
        // mesh.position.x = board.tileSize * this.x - board.width * board.tileSize / 2 + board.tileSize / 2
        // mesh.position.z = board.tileSize * this.z - board.width * board.tileSize / 2 + board.tileSize / 2
        // this.mesh.scale.set(35, 35, 35)
        // this.mesh.position.y = -1300
        this.tile = this.board.tiles.filter(tile => tile.x == this.x && tile.z == this.z)[0]
        this.mesh.position.y = this.tile.size.y
    }

    isVisible() {
        if (!this.mesh) {
            return false
        }
        return this.mesh.parent == this.game.scene
    }

    toggle() {
        if (this.isVisible()) {
            this.hide()
        } else {
            this.show()
        }
    }

    show(silent = false) {
        if (this.board.blockActions) return
        if (!this.mesh) {
            this.load()
        }
        if (!this.isVisible()) {
            console.log("SHOWFLAG", this.z, this.z)
            if (!silent) {
                this.game.ws.send(JSON.stringify({
                    type: "flag",
                    x: this.x,
                    z: this.z
                }))
            }
            // console.log(this.mesh)
            this.game.scene.add(this.mesh);


            // let points = parseInt(document.getElementById("points").innerText)
            // if (this.tile.value == "bomb") {
            //     points += 50
            // } else if (this.tile.value == "empty") {
            //     points -= 75
            // } else {
            //     points -= 75
            // }
            // document.getElementById("points").innerText = points
        }
    }

    hide(silent = false) {
        if (this.board.blockActions) return
        if (this.isVisible()) {
            console.log("HIDEFLAG", this.x, this.z)
            if (!silent) {
                this.game.ws.send(JSON.stringify({
                    type: "unflag",
                    x: this.x,
                    z: this.z
                }))
            }
            this.game.scene.remove(this.mesh);
        }
        // let points = parseInt(document.getElementById("points").innerText)
        // if (this.tile.value == "empty") {
        //     points += 75
        // } else {
        //     points -= 75
        // }
        // document.getElementById("points").innerText = points
    }

    set(visible) {
        if (visible) {
            this.show()
        } else {
            this.hide()
        }
    }
    setSilent(visible) {
        if (visible) {
            this.show(true)
        } else {
            this.hide(true)
        }
    }
}