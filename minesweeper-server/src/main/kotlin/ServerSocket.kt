import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.*
import com.google.gson.Gson
import kotlinx.coroutines.*

@WebSocket
class WSHandler {
    @OnWebSocketConnect
    fun connected(session: Session) {
        println("user connected to websocket")
        addUserToDB(session)

        session.idleTimeout = 15 * 60 * 1000

        sendAllBoard(session=session)
        removeClosedUsers()

        println("lista użytkowników:")
        println(Clients.sessionUserMap.map{"${it.value} - ${it.key.isOpen}"})

        Clients.broadcastMessageExcept(Gson().toJson(mapOf(
            "type" to "connect",
            "allPoints" to getPoints(),
        )), session)


        sendGameResultIfBoardFinished()
    }

    private fun addUserToDB(session: Session) {
        val conn = connect()
        val stmt = conn.createStatement()
        stmt.executeUpdate("INSERT INTO users DEFAULT VALUES;", arrayOf("id"))
        val rs = stmt.generatedKeys
        if (rs.next()) {
            val id = rs.getInt("id")
            Clients.sessionUserMap[session] = User(session, id)
            println("Użytkownik $id połączył się")
        }
        conn.close()
    }

    @OnWebSocketClose
    fun closed(session: Session, statusCode: Int, reason: String?) {
        println("CLOSEEEED")
//        Clients.clientsMap.remove(client)
//        Clients.clientsMap = Clients.clientsMap.filter { it.value != client } as ConcurrentHashMap<Session, String>
        removeClosedUsers()
        println("lista użytkowników:")
        println(Clients.sessionUserMap.map{it.value})
    }

    fun removeClosedUsers() {
        val conn = connect()
        val stmt = conn.createStatement()
        Clients.sessionUserMap.forEach {
            if (!it.key.isOpen) {
                Clients.sessionUserMap.remove(it.key)
                println("Użytkownik ${it.value} rozłączył się")
                stmt.executeUpdate("DELETE FROM users WHERE id=${it.value.id};")
            }
        }
        conn.close()
    }

    @OnWebSocketError
    fun onWebSocketError(session: Session?, ex: Throwable) {
        println("ERRORRRRRRRRRRR")
        println(ex.message)
    }

    @OnWebSocketMessage
    fun message(session: Session, messageStringified: String){
//        println("SESJA")
//        println(user)
//        println("remoteAddress")
//        println(Clients.userUsernameMap[user])
        val message = Gson().fromJson(messageStringified, MutableMap::class.java)
        when(message["type"]){
            "info" -> println(message["text"])
            "iAmAlive" -> println("${Clients.sessionUserMap[session]!!.id} is alive")
            "open" -> {
                board.open((message["x"] as Double).toInt(), (message["z"] as Double).toInt())
//                sendBoard

                sendChangedTilesUpdatingPoints(session)
            }
            "flag" -> {
                board.flag((message["x"] as Double).toInt(), (message["z"] as Double).toInt())
                sendChangedTilesUpdatingPoints(session)
            }
            "unflag" -> {
                board.unflag((message["x"] as Double).toInt(), (message["z"] as Double).toInt())
                sendChangedTilesUpdatingPoints(session)
            }
            "newBoard" -> {
                println(message)
                board = Board((message["width"] as Double).toInt(), (message["height"] as Double).toInt())
                sendNewBoard()
            }
        }
//        Clients.broadcastMessage("fromserver", message!!)
    }

    fun sendChangedTilesUpdatingPoints(session: Session) {
        val tiles = board.getChangedTilesData()
        println("Wysyłam pola - ${tiles.size}: $tiles")
        var pointsChange = 0
        for (tile in tiles) {
//            pointsChange += when(tile.value) {
//                "bomb" -> -250
//                "empty" -> 1
//                else -> tile.value.toInt()
//            }
            pointsChange += if (tile.opened) {
                when (tile.value) {
                    "bomb" -> -250
                    "empty" -> 1
                    else -> tile.value.toInt()
                }
            } else {
                if (tile.flag) {
                    when (tile.value) {
                        "bomb" -> 50
                        "empty" -> -75
                        else -> -75
                    }
                } else {
                    when (tile.value) {
                        "bomb" -> -50
                        else -> 0
//                        "empty" -> 75
//                        else -> 75
                    }
                }
            }
        }
//            when(tile.value) {
//                "bomb" -> {
//                    if (tile.opened) {
//                        pointsChange += -250
//                    }
//                    if (tile.flag) {
//                        pointsChange += 50
//                    }
//                }
//                "empty" -> {
//                    if (tile.opened) {
//                        pointsChange += 1
//                    }
//                    if (tile.flag) {
//                        pointsChange += -75
//                    }
//                }
//                else -> {
//                    if (tile.opened) {
//                        pointsChange += tile.value.toInt()
//                    }
//                    if (tile.flag) {
//                        pointsChange += -75
//                    }
//                }
//        }
//        for (tile in tiles) {
//            when(tile.value) {
//                "bomb" -> pointsChange -= 1000
//                else -> pointsChange += 100
//            }
//        }

        Clients.sessionUserMap[session]!!.points += pointsChange
        println("punkty podliczone")
//        Gson().toJson(
            mapOf(
                "type" to "tiles",
                "tiles" to tiles,
                "allPoints" to getPoints(),
            )
//        )
        println("json zrobiony")



//        val conn = connect()
//        val stmt = conn.createStatement()
//        val id = Clients.sessionUserMap[session]!!.id
//        stmt.executeUpdate("UPDATE users SET points = points + $pointsChange WHERE id = $id;", arrayOf("points"))
//        val rs = stmt.generatedKeys
//        rs.next()
//        val points = rs.getString("points")
//        conn.close()

        Clients.broadcastMessageExcept(Gson().toJson(
            mapOf(
                "type" to "tiles",
                "tiles" to tiles,
                "allPoints" to getPoints(),
                )
        ), session)

        Clients.sendMessage(Gson().toJson(mapOf(
            "type" to "tiles",
            "tiles" to tiles,
            "points" to Clients.sessionUserMap[session]!!.points,
            "id" to Clients.sessionUserMap[session]!!.id,
            "allPoints" to getPoints(),
        )), session)
        sendGameResultIfBoardFinished()
    }

    fun sendAllBoard(session: Session) {
        Clients.sendMessage(Gson().toJson(
            mapOf(
                "type" to "board",
                "width" to board.width,
                "height" to board.height,
                "tiles" to board.getAllTilesData(),
                "id" to Clients.sessionUserMap[session]!!.id,
                "allPoints" to getPoints(),
            )
        ), session)
        sendGameResultIfBoardFinished()
    }

    fun sendNewBoard() {
//        val conn = connect()
//        val stmt = conn.createStatement()
//        stmt.executeUpdate("DELETE FROM users WHERE points = 0;")
        Clients.sessionUserMap.forEach { (_, user) ->
            user.points = 0
        }
//        stmt.executeUpdate("UPDATE users SET points = 0 WHERE 1 = 1;")
//        conn.close()
//        Clients.userIdMap.forEach { (user, _) ->
//            addUserToDB(user)
//        }


        Clients.broadcastMessage(Gson().toJson(
            mapOf(
                "type" to "newBoard",
                "width" to board.width,
                "height" to board.height,
                "tiles" to board.getAllTilesData(),
                "allPoints" to getPoints(),
            )
        ))
        sendGameResultIfBoardFinished()
    }

    fun sendGameResultIfBoardFinished() {
        if (board.isFinished()) {
            println("BOARD FINISHED")
            Clients.broadcastMessage(Gson().toJson(
                mapOf(
                    "type" to "finish",
                    "winner" to board.width,
                    "height" to board.height,
                    "tiles" to board.getAllTilesData(),
                    "allPoints" to getPoints(),
                )
            ))
        }
    }
}