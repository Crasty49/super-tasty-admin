import { useEffect, useState } from "react";
import { auth, messaging } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";

import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Ventas from "./pages/Ventas";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("pedidos");

  // 🔐 Detectar sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔔 Notificaciones push
  useEffect(() => {

    if (!user) return;

    const activarNotificaciones = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {

          const token = await getToken(messaging, {
            vapidKey: "TU_VAPID_KEY_AQUI"
          });

          console.log("🔥 TOKEN ADMIN:");
          console.log(token);
        }

      } catch (error) {
        console.log("Error notific:", error);
      }
    };

    activarNotificaciones();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Notificación recibida:", payload);

      const audio = new Audio("/ding.mp3");
      audio.play().catch(()=>{});
    });

    return () => unsubscribe();

  }, [user]);

  if (loading) return null;

  if (!user) return <Login />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      fontFamily: "Arial",
      color: "white"
    }}>

      {/* HEADER */}
      <div style={{
        background:"#111",
        padding:20,
        display:"flex",
        gap:15,
        alignItems:"center",
        borderBottom:"1px solid #222"
      }}>

        <button
          onClick={()=>setVista("pedidos")}
          style={{
            background: vista==="pedidos" ? "#dc2626" : "#222",
            color:"white",
            border:"none",
            padding:"10px 18px",
            borderRadius:12,
            cursor:"pointer",
            fontWeight:"bold",
            transition:"0.2s"
          }}
        >
          🔥 Pedidos
        </button>

        <button
          onClick={()=>setVista("ventas")}
          style={{
            background: vista==="ventas" ? "#22c55e" : "#222",
            color:"white",
            border:"none",
            padding:"10px 18px",
            borderRadius:12,
            cursor:"pointer",
            fontWeight:"bold",
            transition:"0.2s"
          }}
        >
          📊 Ventas
        </button>

        <div style={{marginLeft:"auto"}}>
          <button
            onClick={()=>signOut(auth)}
            style={{
              background:"#333",
              color:"white",
              border:"none",
              padding:"8px 15px",
              borderRadius:10,
              cursor:"pointer"
            }}
          >
            Cerrar sesión
          </button>
        </div>

      </div>

      {/* CONTENIDO */}
      {vista === "pedidos" && <Pedidos />}
      {vista === "ventas" && <Ventas />}

    </div>
  );
}

export default App;