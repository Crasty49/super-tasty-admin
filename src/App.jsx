import { useEffect, useState } from "react";
import { auth, messaging } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";

import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Ventas from "./pages/Ventas";
import Productos from "./pages/Productos";
import Salsas from "./pages/Salsas";
import Horario from "./pages/Horario";
import Mensaje from "./pages/Mensaje";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("pedidos");
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔐 LOGIN
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔔 NOTIFICACIONES
  useEffect(() => {
    const activar = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "TU_VAPID"
          });
          console.log("TOKEN:", token);
        }
      } catch {}
    };

    activar();

    onMessage(messaging, () => {
      const audio = new Audio("/ding.mp3");
      audio.play().catch(()=>{});
    });

  }, []);

  if (loading) return null;
  if (!user) return <Login />;

  const Item = ({id,icon,text}) => (
    <div
      onClick={()=>{
        setVista(id);
        setMenuOpen(false);
      }}
      style={{
        padding:"16px 18px",
        cursor:"pointer",
        fontWeight:"600",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        background: vista===id
          ? "linear-gradient(90deg,#22c55e,#16a34a)"
          : "transparent",
        transition:"0.2s"
      }}
    >
      {icon} {text}
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#020617,#09090b,#020617)",
      color:"white",
      fontFamily:"-apple-system,BlinkMacSystemFont,Arial"
    }}>

      {/* HEADER PREMIUM */}
      <div style={{
        padding:18,
        backdropFilter:"blur(20px)",
        background:"rgba(0,0,0,0.7)",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        display:"flex",
        alignItems:"center",
        gap:15,
        position:"sticky",
        top:0,
        zIndex:5
      }}>

        {/* MENU BTN */}
        <div
          onClick={()=>setMenuOpen(true)}
          style={{fontSize:26,cursor:"pointer"}}
        >
          ☰
        </div>

        <div style={{
          fontWeight:"bold",
          fontSize:18,
          letterSpacing:1
        }}>
          🍗 Super Tasty Admin
        </div>

        <div style={{marginLeft:"auto"}}>
          <button
            onClick={()=>signOut(auth)}
            style={{
              background:"linear-gradient(45deg,#ef4444,#dc2626)",
              border:"none",
              padding:"10px 16px",
              borderRadius:12,
              color:"white",
              fontWeight:"bold",
              cursor:"pointer",
              boxShadow:"0 0 15px rgba(239,68,68,0.4)"
            }}
          >
            Salir
          </button>
        </div>

      </div>

      {/* CONTENIDO */}
      <div style={{
        padding:20,
        maxWidth:1000,
        margin:"0 auto"
      }}>
        {vista==="pedidos" && <Pedidos/>}
        {vista==="ventas" && <Ventas/>}
        {vista==="productos" && <Productos/>}
        {vista==="salsas" && <Salsas/>}
        {vista==="horario" && <Horario/>}
        {vista==="mensaje" && <Mensaje/>}
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          onClick={()=>setMenuOpen(false)}
          style={{
            position:"fixed",
            top:0,left:0,
            width:"100%",
            height:"100%",
            background:"rgba(0,0,0,0.7)",
            backdropFilter:"blur(6px)",
            zIndex:9
          }}
        />
      )}

      {/* SIDEBAR PREMIUM */}
      <div style={{
        position:"fixed",
        top:0,
        left: menuOpen ? 0 : -290,
        width:270,
        height:"100%",
        background:"rgba(10,10,10,0.95)",
        backdropFilter:"blur(20px)",
        zIndex:10,
        transition:"0.35s",
        boxShadow:"0 0 40px black"
      }}>

        <div style={{
          padding:25,
          fontSize:20,
          fontWeight:"bold",
          borderBottom:"1px solid rgba(255,255,255,0.05)"
        }}>
          ⚙️ Panel admin
        </div>

        <Item id="pedidos" icon="🔥" text="Pedidos"/>
        <Item id="ventas" icon="📊" text="Ventas"/>
        <Item id="productos" icon="🍔" text="Productos"/>
        <Item id="salsas" icon="🌶️" text="Salsas"/>
        <Item id="horario" icon="⏰" text="Horario"/>
        <Item id="mensaje" icon="💬" text="Mensaje tienda"/>

      </div>

    </div>
  );
}

export default App;