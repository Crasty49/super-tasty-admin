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
        padding:"18px",
        cursor:"pointer",
        borderRadius:14,
        marginBottom:6,
        fontWeight:"bold",
        fontSize:15,
        background:
          vista===id
          ? "linear-gradient(90deg,#ff7a18,#ff3d00)"
          : "transparent",
        boxShadow:
          vista===id
          ? "0 10px 25px rgba(255,80,0,0.3)"
          : "none",
        transition:"0.2s"
      }}
    >
      {icon} {text}
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#0f0f0f,#050505)",
      color:"white"
    }}>

      {/* HEADER PREMIUM */}
      <div style={{
        padding:"16px 18px",
        backdropFilter:"blur(14px)",
        background:"rgba(255,255,255,0.03)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex",
        alignItems:"center",
        gap:14,
        position:"sticky",
        top:0,
        zIndex:5
      }}>

        {/* BOTON MENU */}
        <div
          onClick={()=>setMenuOpen(true)}
          style={{
            fontSize:26,
            cursor:"pointer"
          }}
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
              background:"linear-gradient(90deg,#ff7a18,#ff3d00)",
              border:"none",
              padding:"10px 16px",
              borderRadius:12,
              color:"white",
              fontWeight:"bold",
              cursor:"pointer",
              boxShadow:"0 10px 25px rgba(255,80,0,0.35)"
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{
        padding:20,
        maxWidth:1100,
        margin:"auto"
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
            background:"rgba(0,0,0,0.6)",
            zIndex:9
          }}
        />
      )}

      {/* SIDEBAR PREMIUM */}
      <div style={{
        position:"fixed",
        top:0,
        left: menuOpen ? 0 : -280,
        width:270,
        height:"100%",
        background:"rgba(20,20,20,0.95)",
        backdropFilter:"blur(20px)",
        zIndex:10,
        transition:"0.3s",
        padding:20,
        boxShadow:"0 0 40px rgba(0,0,0,0.8)"
      }}>

        <div style={{
          fontSize:22,
          fontWeight:"bold",
          marginBottom:25,
          textAlign:"center"
        }}>
          ⚙️ Panel Admin
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