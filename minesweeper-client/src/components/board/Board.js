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
    CylinderGeometry,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Box3
} from 'three'
import Tile from './Tile'
import Flag from './Flag'
// import flag from "../../assets/flag.obj"
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export default class Board {
    constructor(game) {
        this.game = game
        // this.width = 9
        // this.height = 9
        this.width = 20
        this.height = 20
        this.tileSize = 35
        this.bombsDensity = 0.13
        this.bombsCount = Math.floor(this.width * this.height * this.bombsDensity)
        this.adjacentEmptyTiles = []
        // this.generateBombs()
        this.tiles = []
        // this.setTileValues()
        Flag.preload(this.game.manager, flag => {
            this.preloadedFlag = flag
        })
        this.game.manager.itemStart("board")
        this.toBeOpenedLater = []
        // this.getAndLoadTiles()
    }

    preloadFlag() {
        // const mtlLoader = new MTLLoader()
        // mtlLoader.setPath('src/assets/')
        // mtlLoader.load("flag.mtl", materials => {
        //     materials.preload()
        //     const objLoader = new OBJLoader()
        //     objLoader.setMaterials(materials)
        //     objLoader.setPath('src/assets/')
        //     objLoader.load('flag.obj', flag => {
        //         this.preloadedFlag = flag
        //     })
        // })
    }

    generateBombs() {
        this.bombs = []
        for (let i = 0; i < this.bombsCount; i++) {
            let coords = { x: null, z: null }
            do {
                coords.x = Math.floor(Math.random() * this.width)
                coords.z = Math.floor(Math.random() * this.height)
            } while (this.bombs.filter(bomb => bomb.x == coords.x && bomb.z == coords.z).length > 0)
            this.bombs.push(coords)
        }
        console.log(this.bombs)
    }

    generateTiles() {
        // for (let x = 0; x < this.width; x++) {
        //     for (let z = 0; z < this.height; z++) {
        //         const tile = new Tile(this, x, z)
        //         this.tiles.push(tile)
        //         this.game.scene.add(tile.mesh)
        //     }
        // }
    }

    setTileValues() {
        // for (let tile of this.tiles) {
        //     if (this.bombs.filter(bomb => bomb.x == tile.x && bomb.z == tile.z).length > 0) {
        //         tile.set("bomb")
        //     }
        // }
        // for (let tile of this.tiles) {
        //     if (tile.value != "bomb") {
        //         let neighbourBombs = 0
        //         for (let neighbour of tile.getNeighbours()) {
        //             if (neighbour.value == "bomb") {
        //                 neighbourBombs++
        //             }
        //         }
        //         if (neighbourBombs > 0) {
        //             tile.set(neighbourBombs)
        //         }
        //     }
        //     // console.log(tile.x, tile.z, tile.getNeighbours())
        // }
        // console.log("Dodane liczby")
        // console.log(this.tiles.map(t => { return { x: t.x, z: t.z, value: t.value } }))
    }

    getAndLoadTiles() {
        // fetch(this.game.server + "/board")
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log("DATAAA")
        //         console.log(data)
        //         this.loadTiles(data)
        //     })
        // const tiles = await response.json()
        // return tiles

    }

    removeFlags() {
        for (let tile of this.tiles) {
            tile.flag.hide(true)
        }
    }

    loadTiles(tiles) {

        // this.generateTiles()
        for (let tile of tiles) {
            // const tileToSet = this.tiles.filter(t => t.x == tile.x && t.z == tile.z)[0]
            // if (!isNaN(parseFloat(tile.value)) && !isNaN(tile.value - 0)) {
            //     tile.value = parseInt(tile.value)
            // }
            let tileToSet = this.getTile(tile.x, tile.z)
            if (!tileToSet) {
                tileToSet = new Tile(this, tile.x, tile.z)
                this.tiles.push(tileToSet)
                this.game.scene.add(tileToSet.mesh)
            }

            // console.log("Ustawiam pole w którym jest " + tile.value + ":", tileToSet)
            // console.log(tile.value)
            // tileToSet.set(tile.value)
            tileToSet.flag.setSilent(tile.flag)
            tileToSet.set(tile.value)
            if (tile.opened) {
                tileToSet.openSilent()
            }
        }
        for (let tile of tiles) {
            let tileToSet = this.getTile(tile.x, tile.z)
            if (tile.opened) {
                tileToSet.openSilent()
            }
        }
    }

    getTile(x, z) {
        const tiles = this.tiles.filter(tile => tile.x == x && tile.z == z)
        if (tiles.length == 0) {
            return null
        } else {
            return tiles[0]
        }
    }

    closeAll() {
        for (let tile of this.tiles) {
            tile.close()
        }
    }
}