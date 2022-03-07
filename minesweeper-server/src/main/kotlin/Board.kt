
import java.util.concurrent.TimeUnit

import java.io.IOException


class Board(
    val width: Int = 20,
    val height: Int = 20
) {
////    val width = 9
////    val height = 9
//    val width = 40
//    val height = 40
    val bombsDensity = 0.13
    val bombsCount = (width * height * bombsDensity).toInt()
    private val bombs: MutableList<Pair<Int, Int>> = mutableListOf()
    val tiles: MutableList<Tile> = mutableListOf()
    var changedTiles: MutableSet<Tile> = mutableSetOf()
    init {
        generateBombs()
        generateTiles()
        setTileValues()
    }

    private fun generateBombs() {
        repeat (bombsCount) {
            var x: Int
            var z: Int
            do {
                x = (Math.random() * width).toInt()
                z = (Math.random() * height).toInt()
            } while (bombs.contains(Pair(x, z)))
            bombs += Pair(x, z)
        }
    }

    private fun generateTiles() {
        repeat (width) { x ->
            repeat (height) { z ->
                tiles += Tile(this, x, z)
            }
        }
    }

    private fun setTileValues() {
        tiles.forEach { tile ->
            if (bombs.any { bomb -> bomb.first == tile.x && bomb.second == tile.z }) {
                tile.value = "bomb"
            }
        }
        for (tile in tiles) {
            if (tile.value != "bomb") {
                var neighbourBombs = 0
                for (neighbour in tile.getNeighbours()) {
                    if (neighbour.value == "bomb") {
                        neighbourBombs++
                    }
                }
                if (neighbourBombs > 0) {
                    tile.value = neighbourBombs.toString()
                }
            }
        }
    }

    fun getTile(x: Int, z: Int): Tile {
        return tiles.first { it.x == x && it.z == z }
    }

    fun open(x: Int, z: Int): String {
        val tile = getTile(x, z)
        tile.open()
        return tile.value
    }

    fun flag(x: Int, z: Int) {
        val tile = getTile(x, z)
        changedTiles.add(tile)
        tile.flag()
    }
    fun unflag(x: Int, z: Int) {
        val tile = getTile(x, z)
        changedTiles.add(tile)
        tile.unflag()
    }

    fun getAllTilesData(): MutableList<TileData> {
        val data: MutableList<TileData> = mutableListOf()
        for (tile in board.tiles) {
            data += tile.getData()
        }
        return data
    }
    fun getChangedTilesData(): MutableList<TileData> {
        val data: MutableList<TileData> = mutableListOf()
        for (tile in board.changedTiles) {
            data += tile.getData()
        }
        board.changedTiles.clear()
        return data
    }

    fun isFinished(): Boolean {
        for (tile in board.tiles) {
            if (
                !(
                    (tile.opened) ||
                    (tile.value == "bomb" && tile.flag)
                )
            ) {
                return false
            }
        }
        return true
    }
}
