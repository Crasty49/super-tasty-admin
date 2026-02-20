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

  // 🔐 detectar login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔔 ACTIVAR NOTIFICACIONES PUSH
  useEffect(() => {

    const activar = async () => {

      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {

          const token = await getToken(messaging, {
            vapidKey: "BAPH2hIg5RaM0zlcZGWPF-gwjw5_t1X8XfSuv-alz4e76N4cPV-uyC-Nkp53v_Xi9GyfNPUAm0Lxp8s03qTloao"
          });

          console.log("🔥 TOKEN CELULAR ADMIN:");
          console.log(token);
        }

      } catch (err) {
        console.log("Error notific:", err);
      }
    };

    activar();

    // 🔊 cuando llega notificación con app abierta
    onMessage(messaging, (payload) => {
      console.log("Notificación recibida:", payload);

      const audio = new Audio("/ding.mp3");
      audio.play().catch(()=>{});
    });

  }, []);

  if (loading) return null;

  // 🔒 si no está logueado
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
            background: vista==="pedidos" ? "red" : "#222",
            color:"white",
            border:"none",
            padding:"10px 18px",
            borderRadius:10,
            cursor:"pointer",
            fontWeight:"bold"
          }}
        >
          🔥 Pedidos
        </button>

        <button
          onClick={()=>setVista("ventas")}
          style={{
            background: vista==="ventas" ? "limegreen" : "#222",
            color:"white",
            border:"none",
            padding:"10px 18px",
            borderRadius:10,
            cursor:"pointer",
            fontWeight:"bold"
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
              borderRadius:8,
              cursor:"pointer"
            }}
          >
            Cerrar sesión xd
          </button>
        </div>

      </div>

      {vista === "pedidos" && <Pedidos />}
      {vista === "ventas" && <Ventas />}

    </div>
  );
}

export default App;