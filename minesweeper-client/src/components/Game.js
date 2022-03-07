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
    PointLight,
    BoxGeometry,
    MeshBasicMaterial,
    TextureLoader,
    PerspectiveCamera,
    LoadingManager,
} from 'three'
import Renderer from './Renderer'
import Camera from './Camera'
import Floor from './board/Floor'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import Tile from './board/Tile'
import Player from './Player'
import PlayerController from './PlayerController'
import Board from './board/Board'
import favicon from '../assets/favicon.ico'


export default class Game {
    constructor(container) {
        this.container = container

        // this.ip = 'localhost:5000'
        this.ip = "rubikon.ddns.net:5000"

        // this.server = 'http://' + this.ip
        // this.websocketServer = "ws://" + this.ip + "/websocket/"

        const url = new URL('/websocket', window.location.href);
        url.protocol = url.protocol.replace('http', 'ws');
        this.websocketServer = url.href
        // this.websocketServer = "ws://kw-ak-minesweeper.herokuapp.com/websocket"

        this.server = window.location.href

        this.manager = new LoadingManager();
        this.connect()


        // this.camera = new Camera(75)
        // this.camera.position.set(100, 100, 100)


        this.createWorld()
        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;

        this.camera = new PerspectiveCamera(75, width / height, 0.1, 10000);
        this.camera.position.y = 100
        this.camera.lookAt(new Vector3(0, 0, -100))

        this.scene.add(this.camera)
        this.player = new Player(this)
        this.playerController = new PlayerController(this)


        this.render()
    }

    createGameEndPopup(map) {
        if (document.getElementById("popup")) return
        const popup = document.createElement("div")
        popup.id = "popup"

        const popupContent = document.createElement("div")
        popupContent.id = "popup-content"

        const gameEndedText = document.createElement("div")
        gameEndedText.id = "game-ended-text"
        gameEndedText.innerHTML = "Game ended"
        popupContent.appendChild(gameEndedText)

        const popupLeaderboard = document.createElement("div")
        popupLeaderboard.id = "popup-leaderboard"


        const leaderboadHeader = document.createElement("div")
        leaderboadHeader.id = "header"
        // <div id="header">
        //     <div class="id">ID:</div>
        //     <div class="points">Points:</div>
        // </div>
        const place = document.createElement("div")
        place.classList.add("place")
        place.innerText = "Place:"
        leaderboadHeader.appendChild(place)
        const id = document.createElement("div")
        id.classList.add("id")
        id.innerText = "ID:"
        leaderboadHeader.appendChild(id)
        const points = document.createElement("div")
        points.classList.add("points")
        points.innerText = "Points:"
        leaderboadHeader.appendChild(points)

        popupLeaderboard.appendChild(leaderboadHeader)

        // popupLeaderboard.innerHTML = ""
        this.loadPoints(map, popupLeaderboard)

        popupContent.appendChild(popupLeaderboard)

        const restartText = document.createElement("div")
        restartText.id = "restart-text"
        restartText.innerHTML = "Press <b>r</b> to restart"
        popupContent.appendChild(restartText)



        popup.appendChild(popupContent)

        document.body.appendChild(popup)
    }

    connect() {
        clearInterval(this.iAmAliveInterval)
        this.ws = new WebSocket(this.websocketServer);
        console.log("tworzę nowe połączzenie z websocketem")
        this.ws.onmessage = e => {
            // console.log(e.data) // komunikat z serwera
            const data = JSON.parse(JSON.parse(e.data))
            console.log("Przyszły dane typu " + data.type + ":")
            console.log(data)
            // console.log("Oryginał:")
            // console.log(e.data)
            // console.log("parse:")
            // console.log(data)
            // console.log("podwójny parse:")
            // console.log(JSON.parse(data))
            // console.log(data)

            if (data.id) {
                this.player.id = data.id
            }

            if (data.type == "open") {
                this.board.getTile(data.x, data.z).open()
            } else if (data.type == "board") {
                console.log("wczytuję planszę")
                this.manager.onLoad = () => {
                    this.board.loadTiles(data.tiles)
                }
                this.manager.itemEnd("board")
            } else if (data.type == "tiles") {
                console.log("wczytuję pola")
                if (data.points) {
                    console.log("data.points")
                    console.log(data.points)

                    document.getElementById("pointsChangeContainer").innerHTML = ""
                    const pointsChange = document.createElement("div")
                    pointsChange.id = "pointsChange"
                    setTimeout(() => {
                        pointsChange.classList.add("hidden")
                    }, 1000)
                    document.getElementById("pointsChangeContainer").appendChild(pointsChange)



                    const difference = data.points - parseInt(document.getElementById("points").innerText)
                    if (difference > 0) {
                        document.getElementById("pointsChange").innerText = "+" + difference
                        document.getElementById("pointsChange").style.color = "green"
                    } else if (difference < 0) {
                        document.getElementById("pointsChange").innerText = difference
                        document.getElementById("pointsChange").style.color = "red"
                    }


                    document.getElementById("points").innerText = data.points
                }
                this.board.loadTiles(data.tiles)
            } else if (data.type == "newBoard") {
                if (document.getElementById("popup")) {
                    this.board.blockActions = false
                    document.getElementById("popup").remove()
                }
                console.log("wczytuję newBoard")
                document.getElementById("points").innerText = "0"
                this.board.width = data.width
                this.board.height = data.height
                this.board.loadTiles(data.tiles)
                this.board.removeFlags()
                this.board.closeAll()
            } else if (data.type == "finish") {
                console.log("GRA ZAKOŃCZONA")
                this.board.blockActions = true
                this.createGameEndPopup(data.allPoints)
            }
            if (data.allPoints) {
                document.getElementById("leaderboad-content").innerHTML = ""
                this.loadPoints(data.allPoints, document.getElementById("leaderboad-content"))
            }
        }
        this.ws.onopen = () => {
            // this.ws.send(JSON.stringify({ type: "info", text: 'websocket klient podlaczyl sie do serwera' }))
        }
        this.ws.onerror = e => {
            console.error("WebSocket error observed:", e)
        }
        this.ws.onclose = e => {
            console.error("WebSocket is closed now.", e)
            setTimeout(() => {
                // this.connect()
            }, 1000)
        }

        this.iAmAliveInterval = setInterval(() => {
            this.ws.send(JSON.stringify({
                type: "ping",
            }))
        }, 5000);

    }

    loadPoints(map, container) {
        map = new Map([...Object.entries(map)].sort((a, b) => b[1] - a[1]));
        map.length = 5
        let firstN = 1
        for (let [idValue, pointsValue] of map.entries()) {
            const player = document.createElement("div")
            player.classList.add("player")
            player.id = "player" + idValue

            const place = document.createElement("div")
            place.classList.add("place")
            place.innerText = firstN + "."
            player.appendChild(place)


            const id = document.createElement("div")
            id.classList.add("id")
            // console.log(this.player.id)

            if (this.player.id == idValue) {
                id.innerHTML = `<b>${idValue} (You)<b>`
            } else {
                id.innerText = idValue
            }
            player.appendChild(id)

            const points = document.createElement("div")
            points.classList.add("points")
            points.innerText = pointsValue
            player.appendChild(points)

            container.appendChild(player)
            if (++firstN > 5) break

        }
    }

    createWorld() {
        this.clock = new Clock()

        this.scene = new Scene()

        // this.floor = new Floor()
        // this.scene.add(this.floor)

        this.renderer = new Renderer(this)
        console.log('renderer created')
        console.log(this.renderer)
        this.container.appendChild(this.renderer.domElement)

        const light = new AmbientLight("white", 1)
        this.scene.add(light)

        const pointLight = new PointLight("white", 0.1)
        pointLight.position.y = 100
        pointLight.position.x = 50
        this.scene.add(pointLight)

        // const axes = new AxesHelper(1000)
        // this.scene.add(axes)

        this.board = new Board(this)
        // console.log(this.board.tiles[0].getAdjacentEmpty())
        // console.log(this.board.tiles[0])
        // const controls = new OrbitControls(this.camera, this.renderer.domElement)
        // this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)
    }

    render() {
        const delta = this.clock.getDelta()

        this.playerController.update(delta)


        // this.playerController.controls.update(delta)
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this))
        // console.log(this.camera.rotation)
    }
}
