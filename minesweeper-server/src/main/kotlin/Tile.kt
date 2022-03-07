class Tile(
    val board: Board,
    val x: Int,
    val z: Int,
) {
    var value = "empty"
    var flag = false
    var opened = false

    fun getNeighbours() = sequence {
        val xs = this@Tile.x - 1 .. this@Tile.x + 1
        val zs = this@Tile.z - 1 .. this@Tile.z + 1
        for (x in xs) {
            for (z in zs) {
                if (x != this@Tile.x || z != this@Tile.z) {
                    if (x >= 0 && z >= 0) {
                        if (x < board.width && z < board.height) {
                            yield(board.tiles.first { tile -> tile.x == x && tile.z == z })
                        }
                    }
                }
            }
        }
    }

    fun getData(): TileData {
        return TileData(
            x,
            z,
            value,
            flag,
            opened,
        )
    }

    fun open() {
        if (!flag && !opened) {
            opened = true
            board.changedTiles.add(this)
            if (value == "empty") {
                for (neighbour in getNeighbours()) {
                    neighbour.open()
                }
            }
        }
    }

    fun flag() {
        flag = true
    }

    fun unflag() {
        flag = false
    }


//    override fun toString(): String {
//        return "x: $x, z: $z, value: $value, flag: $flag"
//    }
}
