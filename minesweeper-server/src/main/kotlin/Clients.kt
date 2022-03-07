import com.google.gson.Gson
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.WebSocketException
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap

object Clients {
//    val userIdMap = ConcurrentHashMap<Session, String>()
    val sessionUserMap = ConcurrentHashMap<Session, User>()

    init {
        setInterval(10000) {
            val conn = connect()
            val stmt = conn.createStatement()
            sessionUserMap.forEach { (_, user) ->
                    stmt.executeUpdate("UPDATE users SET points = ${user.points} WHERE id = ${user.id};")
            }
            conn.close()
        }
    }

    fun getOpenUsers(): Map<Session, User> {
        return sessionUserMap.filter{ (session, _) -> session.isOpen }
    }

    fun broadcastMessage(message: String) {
        getOpenUsers()
            .forEach { (session, _) ->
                sendMessage(message, session)
            }
    }

    fun broadcastMessageExcept(message: String, session: Session) {
        println("broadcastMessageExcept")
        getOpenUsers()
            .minus(session)
            .forEach { (session, _) ->
                sendMessage(message, session)
            }
    }

    fun sendMessage(message: String, session: Session) {
        println("Wysyłam wiadomość do usera z id ${sessionUserMap[session]}")
        try {
            session.remote.sendString(
                Gson().toJson(message)
            )
        } catch (e: WebSocketException) {
            e.printStackTrace()
        }
    }
}