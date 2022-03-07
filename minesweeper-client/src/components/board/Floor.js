// import {
//     TextureLoader,
//     RepeatWrapping,
//     MeshPhongMaterial,
//     DoubleSide,
//     PlaneGeometry,
//     Mesh
// } from 'three'

// export default class Floor extends Mesh {
//     constructor() {
//         const size = 1000
//         const repeat = 10
//         const texture = new TextureLoader().load('src/textures/prototype_gray.png')

//         texture.wrapS = RepeatWrapping
//         texture.wrapT = RepeatWrapping
//         texture.repeat.set(repeat, repeat)

//         const material = new MeshPhongMaterial({
//             color: "white",
//             specular: 0xffffff,
//             shininess: 10,
//             // side: DoubleSide,
//             map: texture,
//         })

//         const geometry = new PlaneGeometry(size, size)

//         super(geometry, material)
//         this.rotateX(-Math.PI / 2)
//         this.receiveShadow = true
//         // this.castShadow = true
//     }
// }