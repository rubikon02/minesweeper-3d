import org.eclipse.jetty.websocket.api.Session

class User(
    val session: Session,
    val id: Int,
) {
    var points: Int = 0
}