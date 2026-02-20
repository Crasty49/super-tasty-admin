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
        padding:"16px",
        borderBottom:"1px solid #222",
        cursor:"pointer",
        background: vista===id ? "#16a34a" : "transparent",
        fontWeight:"bold"
      }}
    >
      {icon} {text}
    </div>
  );

  return (
    <div style={{background:"#0b0b0b",minHeight:"100vh",color:"white"}}>

      {/* HEADER */}
      <div style={{
        padding:15,
        background:"#050505",
        display:"flex",
        alignItems:"center",
        gap:15,
        borderBottom:"1px solid #111"
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

        <div style={{fontWeight:"bold",fontSize:18}}>
          🍗 Super Tasty Admin
        </div>

        <div style={{marginLeft:"auto"}}>
          <button
            onClick={()=>signOut(auth)}
            style={{
              background:"#dc2626",
              border:"none",
              padding:"8px 14px",
              borderRadius:10,
              color:"white",
              fontWeight:"bold"
            }}
          >
            Salir
          </button>
        </div>

      </div>

      {/* CONTENIDO */}
      <div style={{
        padding:15,
        minHeight:"calc(100vh - 70px)",
        background:"#0b0b0b"
      }}>
        {vista==="pedidos" && <Pedidos/>}
        {vista==="ventas" && <Ventas/>}
        {vista==="productos" && <Productos/>}
        {vista==="salsas" && <Salsas/>}
        {vista==="horario" && <Horario/>}
        {vista==="mensaje" && <Mensaje/>}
      </div>

      {/* OVERLAY NEGRO */}
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

      {/* SIDEBAR SLIDE */}
      <div style={{
        position:"fixed",
        top:0,
        left: menuOpen ? 0 : -270,
        width:260,
        height:"100%",
        background:"#050505",
        zIndex:10,
        transition:"0.3s",
        boxShadow:"0 0 25px black"
      }}>

        <div style={{
          padding:20,
          fontSize:20,
          fontWeight:"bold",
          borderBottom:"1px solid #222"
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