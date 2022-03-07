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

import Flag from './Flag'
import tileTexture from '../../assets/tiles.png'

export default class Tile {
    constructor(board, x, z) {
        this.board = board
        this.x = x
        this.z = z
        this.game = this.board.game
        this.height = 0.4
        this.scale = this.board.tileSize
        this.flag = null

        this.createConvexMesh()
        this.createFlatMesh()
        this.meshes = [
            this.flatMesh,
            this.convexMesh
        ]
        // this.mesh = this.flatMesh
        this.mesh = this.convexMesh
        // this.mesh = new Mesh(convexGeometry, convexMaterials)
        this.size = new Vector3()
        new Box3().setFromObject(this.mesh).getSize(this.size);

        // this.position.set(0, 0, 0)
        for (let mesh of this.meshes) {
            mesh.position.x = board.tileSize * this.x - board.width * board.tileSize / 2 + board.tileSize / 2
            mesh.position.z = board.tileSize * this.z - board.height * board.tileSize / 2 + board.tileSize / 2
        }
        this.value = "empty"
        this.flag = new Flag(this)

    }

    toggleFlag() {
        // console.log(this.isOpen())
        // if (!this.isOpen()) {
        //     if (this.flag) {
        //         this.flag.toggle()
        //     } else {
        //         this.flag = new Flag(this)
        //     }
        // }
        if (!this.isOpen()) {
            this.flag.toggle()
        }
    }



    createConvexMesh() {


        this.angle = Math.PI / 3 // 60 stopni
        this.slope = 1 - this.height / Math.tan(this.angle)
        let convexVertices = new Float32Array([
            // left
            -1, 0, -1,
            -1, 0, 1,
            -this.slope, this.height, -this.slope,

            -1, 0, 1,
            -this.slope, this.height, -this.slope,
            -this.slope, this.height, this.slope,

            // right
            this.slope, this.height, -this.slope,
            this.slope, this.height, this.slope,
            1, 0, -1,

            this.slope, this.height, this.slope,
            1, 0, -1,
            1, 0, 1,

            // back
            -this.slope, this.height, -this.slope,
            this.slope, this.height, -this.slope,
            -1, 0, -1,

            this.slope, this.height, -this.slope,
            -1, 0, -1,
            1, 0, -1,

            // front
            -1, 0, 1,
            1, 0, 1,
            -this.slope, this.height, this.slope,

            1, 0, 1,
            -this.slope, this.height, this.slope,
            this.slope, this.height, this.slope,

            // top
            this.slope, this.height, -this.slope,
            this.slope, this.height, this.slope,
            -this.slope, this.height, -this.slope,

            this.slope, this.height, this.slope,
            -this.slope, this.height, -this.slope,
            -this.slope, this.height, this.slope,
        ])
        convexVertices = convexVertices.map(el => el * this.scale / 2)
        let convexUvs = new Float32Array([
            // left
            // 0, 0,
            // 0, 1,
            // 0, 1,
            // this.height / Math.tan(this.angle), this.height / Math.tan(this.angle),
            // this.height / Math.tan(this.angle), 1 - this.height / Math.tan(this.angle),
            1, 0,
            0, 0,
            // 2 * (1 - this.height / Math.tan(this.angle)), 2 * (1 - this.height / Math.tan(this.angle)),
            1, 1,
            0, 0,
            1, 1,
            0, 1,

            // right
            0, 0,
            0, 1,
            this.height / Math.tan(this.angle), this.height / Math.tan(this.angle),
            0, 1,
            this.height / Math.tan(this.angle), this.height / Math.tan(this.angle),
            this.height / Math.tan(this.angle), 1 - this.height / Math.tan(this.angle),

            // back
            0, 0,
            0, 1,
            this.height / Math.tan(this.angle), this.height / Math.tan(this.angle),
            0, 1,
            this.height / Math.tan(this.angle), this.height / Math.tan(this.angle),
            1 - this.height / Math.tan(this.angle), 1 - this.height / Math.tan(this.angle),

            // front
            // 0, 0,
            // 0, 1,
            // this.height / Math.tan(this.angle) / 2, this.height / Math.tan(this.angle) / 2,
            // 0, 1,
            // this.height / Math.tan(this.angle) / 2, this.height / Math.tan(this.angle) / 2,
            // this.height / Math.tan(this.angle) / 2, 1 - this.height / Math.tan(this.angle) / 2,
            0, 0,
            1, 0,
            this.height / Math.tan(this.angle) / 2, this.height / Math.tan(this.angle) / 2,
            1, 0,
            this.height / Math.tan(this.angle) / 2, this.height / Math.tan(this.angle) / 2,
            // 0, 1,
            1, 1,
            // 1 - this.height / Math.tan(this.angle) / 2, 1 - this.height / Math.tan(this.angle) / 2,
            // 1, this.height / Math.tan(this.angle) / 2,

            // top
            1, 1,
            1, 0,
            0, 1,
            1, 0,
            0, 1,
            0, 0,
        ])
        const convexGeometry = new BufferGeometry();
        convexGeometry.setAttribute("position", new BufferAttribute(convexVertices, 3))
        convexGeometry.setAttribute("uv", new BufferAttribute(convexUvs, 2))
        convexGeometry.computeVertexNormals()

        convexGeometry.addGroup(0, 24, 0)
        convexGeometry.addGroup(24, 6, 1)



        this.texture = new TextureLoader().load(tileTexture)
        this.texture.magFilter = NearestFilter;
        this.texture.minFilter = LinearMipMapLinearFilter;
        this.texture.offset.set(0.0625 * 0, 0)
        this.texture.repeat.set(.0625, 1)

        const texture = new TextureLoader().load(tileTexture)
        texture.magFilter = NearestFilter;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.offset.set(0.0625 * 0, 0)
        texture.repeat.set(.0625, 1)

        const convexMaterials = [
            // side
            new MeshPhongMaterial({
                // color: "#f28a00",
                color: "#7f7f7f",
                specular: 0xffffff,
                shininess: 10,
                side: DoubleSide,
                // map: new TextureLoader().load('src/textures/prototype_orange.png'),
            }),
            // top
            new MeshPhongMaterial({
                color: "white",
                specular: 0xffffff,
                shininess: 10,
                side: DoubleSide,
                map: texture,
            }),
        ]
        // super(convexGeometry, convexMaterials)
        this.convexMesh = new Mesh(convexGeometry, convexMaterials)
        this.convexMesh.parentObject = this
    }

    createFlatMesh() {
        const geometry = new PlaneGeometry(this.scale, this.scale);
        const material = new MeshPhongMaterial({
            color: "white",
            specular: 0xffffff,
            shininess: 10,
            side: DoubleSide,
            map: this.texture,
        })
        this.flatMesh = new Mesh(geometry, material);
        this.flatMesh.rotation.x = Math.PI * 3 / 2
        this.flatMesh.position.y = 0.05
        this.flatMesh.parentObject = this
        // scene.add( plane );
    }

    set(name) {
        // console.log("value set to: ", name)
        if (!isNaN(name)) {
            name = parseInt(name)
        }
        this.value = name
        let num = null
        if (name == "bomb") {
            num = 1
        } else if (typeof name == "number") {
            if (name >= 1 && name <= 8) {
                num = name + 2
            }
        }
        this.texture.offset.x = 0.0625 * num
    }

    * getNeighbours() {
        for (let x = this.x - 1; x <= this.x + 1; x++) {
            for (let z = this.z - 1; z <= this.z + 1; z++) {
                if (x != this.x || z != this.z) {
                    if (x >= 0 && z >= 0) {
                        if (x < this.board.width && z < this.board.height) {
                            console.log(`x: ${x} z: ${z}`)
                            console.log(this.board.tiles.filter(tile => tile.x == x && tile.z == z))
                            const neighbour = this.board.tiles.filter(tile => tile.x == x && tile.z == z)[0]
                            if (neighbour) {
                                yield neighbour
                            }
                        }
                    }
                }
            }
        }
    }

    open(silent = false) {
        if (this.board.blockActions) return
        // this.set("bomb")
        if (!this.flag.isVisible() && !this.isOpen()) {
            if (!silent) {
                this.game.ws.send(JSON.stringify({
                    type: "open",
                    x: this.x,
                    z: this.z
                }))
            }
            this.game.scene.remove(this.mesh)
            this.mesh = this.flatMesh
            this.game.scene.add(this.mesh)
            if (this.value == "empty") {
                this.openNeighbours(true)
            }
            // let points = parseInt(document.getElementById("points").innerText)
            // console.log("DANE POLA:")
            // console.log(this.value, this.isOpen(), this.flag.isVisible())
            // if (this.value == "bomb") {
            //     points -= 250
            // } else if (this.value == "empty") {
            //     points += 1
            // } else {
            //     points += parseInt(this.value)
            // }
            // if (this.value == "bomb") {
            //     if (this.isOpen()) {
            //         points -= 250
            //     } else if (this.flag.isVisible()) {
            //         points += 50
            //     }
            // } else if (this.value == "empty") {
            //     if (this.isOpen()) {
            //         points += 1
            //     } else if (this.flag.isVisible()) {
            //         points -= 75
            //     }
            // } else {
            //     if (this.isOpen()) {
            //         points += parseInt(this.value)
            //     } else if (this.flag.isVisible()) {
            //         points -= -75
            //     }
            // }

            // document.getElementById("points").innerText = points
        }
    }

    close() {
        if (this.board.blockActions) return
        this.game.scene.remove(this.mesh)
        this.mesh = this.convexMesh
        this.game.scene.add(this.mesh)
    }

    openSilent() {
        this.open(true)
    }

    openNeighbours(silent) {
        console.log("SĄSIEDZIII")
        for (let neighbour of this.getNeighbours()) {
            if (!neighbour.isOpen()) {
                neighbour.open(silent)
            }
        }
    }

    isOpen() {
        return this.mesh == this.flatMesh
    }

    // getAdjacentEmpty() {
    //     console.log(this)
    //     if (this.value == "empty") {
    //         if (!this.board.adjacentEmptyTiles.includes(this)) {
    //             console.log(this, "ADDED")
    //             this.board.adjacentEmptyTiles.push(this)
    //         }

    //         let toCheck = []
    //         for (let x = this.x - 1; x <= this.x + 1; x++) {
    //             for (let z = this.z - 1; z <= this.z + 1; z++) {
    //                 if (x >= 0 && z >= 0) {
    //                     if (x < this.board.width && z < this.board.height) {
    //                         if (x != this.x || z != this.z) {
    //                             const tile = this.board.tiles.filter(tile => tile.x == x && tile.z == z)[0]
    //                             if (!this.board.adjacentEmptyTiles.includes(tile)) {
    //                                 if (!toCheck.includes(tile)) {
    //                                     toCheck.push(tile)
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         console.log(toCheck)
    //         for (let field of toCheck) {
    //             field.getAdjacentEmpty()
    //         }
    //         return this.board.adjacentEmptyTiles
    //     } else {
    //         return []
    //     }
    // }
}