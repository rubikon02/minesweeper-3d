import java.sql.DriverManager
import com.google.gson.Gson
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import spark.Spark.*
import java.sql.Connection



var board = Board()

fun getPort(): Int {
    val processBuilder = ProcessBuilder()
    return if (processBuilder.environment()["PORT"] != null) {
        processBuilder.environment()["PORT"]!!.toInt()
    } else 5000
}

fun main() {
    val conn = connect()
    val stmt = conn.createStatement()
    stmt.executeUpdate("DELETE FROM users WHERE 1 = 1;")
    conn.close()


    staticFileLocation("/public")
    port(getPort())

    webSocket("/websocket", WSHandler::class.java)
    enableCORS("*", "*", "*")

    get("/board") { _, _ -> Gson().toJson(board.getAllTilesData()) }
}


//fun connect(): Connection {
//    return DriverManager.getConnection("jdbc:postgresql://localhost/fps", "postgres", "admin")
////    return DriverManager.getConnection("jdbc:h2:tcp://localhost/./fps", "sa", "")
//}
//get board
fun getPoints(): Map<Int, Int> {
//    val conn = connect()
//    val stmt = conn.createStatement()
//    val rs = stmt.executeQuery("SELECT * FROM users")
//    val points: Map<Int, Int> = sequence {
//        while (rs.next()) {
//            yield(rs.getInt("id") to rs.getInt("points"))
//        }
//    }.toMap()
//    conn.close()


    return Clients.sessionUserMap.map { it.value.id to it.value.points }.toMap()
}

fun enableCORS(origin: String, methods: String, headers: String) {
    options("/*") { request, response ->
        val accessControlRequestHeaders = request.headers("Access-Control-Request-Headers")
        if (accessControlRequestHeaders != null) {
            response.header("Access-Control-Allow-Headers", accessControlRequestHeaders)
        }
        val accessControlRequestMethod = request.headers("Access-Control-Request-Method")
        if (accessControlRequestMethod != null) {
            response.header("Access-Control-Allow-Methods", accessControlRequestMethod)
        }
        "OK"
    }
    before({ _, response ->
        response.header("Access-Control-Allow-Origin", origin)
        response.header("Access-Control-Request-Method", methods)
        response.header("Access-Control-Allow-Headers", headers)
        // Note: this may or may not be necessary in your particular application
        response.type("application/json")
    })
}

fun connect(): Connection {
    return DriverManager.getConnection(
        "jdbc:postgresql://dpg-cidtvb59aq0ce38g16b0-a.frankfurt-postgres.render.com:5432/minesweeper",
        "minesweeper_user",
        "MVatHQX16zCicweZJDlKjy7RSRwSIIYF")
//    return DriverManager.getConnection(
//        "jdbc:postgresql://localhost:5432/minesweeper",
//        "postgres",
//        "admin")
}

fun setInterval(timeMillis: Long, handler: () -> Unit) = GlobalScope.launch {
    while (true) {
        delay(timeMillis)
        handler()
    }
}