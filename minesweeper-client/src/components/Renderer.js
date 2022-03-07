import {
    WebGLRenderer,
    PCFSoftShadowMap
} from 'three'

export default class Renderer extends WebGLRenderer {
    constructor() {
        super({ antialias: true })
        this.setClearColor(0xffffff)
        this.shadowMap.enabled = false
        this.shadowMap.type = PCFSoftShadowMap

        this.updateSize()
        document.addEventListener('DOMContentLoaded', () => this.updateSize())
        window.addEventListener('resize', () => this.updateSize())
    }

    updateSize() {
        this.setSize(window.innerWidth, window.innerHeight)
    }
}