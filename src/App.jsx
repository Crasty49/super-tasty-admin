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

  // 🔐 login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔔 notificaciones
  useEffect(() => {

    const activar = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BAPH2hIg5RaM0zlcZGWPF-gwjw5_t1X8XfSuv-alz4e76N4cPV-uyC-Nkp53v_Xi9GyfNPUAm0Lxp8s03qTloao"
          });

          console.log("🔥 TOKEN ADMIN:");
          console.log(token);
        }

      } catch (err) {
        console.log(err);
      }
    };

    activar();

    onMessage(messaging, () => {
      const audio = new Audio("/ding.mp3");
      audio.play().catch(()=>{});
    });

  }, []);

  if (loading) return null;
  if (!user) return <Login />;

  const Btn = ({id,icon,label}) => (
    <button
      onClick={()=>setVista(id)}
      style={{
        background: vista===id ? "#16a34a" : "#18181b",
        border:"none",
        color:"white",
        padding:"14px",
        borderRadius:14,
        cursor:"pointer",
        fontWeight:"bold",
        fontSize:15,
        display:"flex",
        alignItems:"center",
        gap:10,
        transition:"0.2s",
        boxShadow: vista===id ? "0 0 15px #16a34a" : "none"
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0a0a0a",
      color:"white",
      display:"flex",
      fontFamily:"Arial"
    }}>

      {/* SIDEBAR */}
      <div style={{
        width:220,
        background:"#050505",
        padding:20,
        borderRight:"1px solid #111",
        display:"flex",
        flexDirection:"column",
        gap:12
      }}>

        <h2 style={{marginBottom:10}}>
          🍗 Admin Panel
        </h2>

        <Btn id="pedidos" icon="🔥" label="Pedidos"/>
        <Btn id="ventas" icon="📊" label="Ventas"/>
        <Btn id="productos" icon="🍔" label="Productos"/>
        <Btn id="salsas" icon="🌶️" label="Salsas"/>
        <Btn id="horario" icon="⏰" label="Horario"/>
        <Btn id="mensaje" icon="💬" label="Mensaje tienda"/>

        <div style={{marginTop:"auto"}}>
          <button
            onClick={()=>signOut(auth)}
            style={{
              width:"100%",
              background:"#dc2626",
              border:"none",
              padding:12,
              borderRadius:12,
              color:"white",
              fontWeight:"bold",
              cursor:"pointer"
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{
        flex:1,
        padding:25,
        overflowY:"auto"
      }}>

        {vista==="pedidos" && <Pedidos/>}
        {vista==="ventas" && <Ventas/>}
        {vista==="productos" && <Productos/>}
        {vista==="salsas" && <Salsas/>}
        {vista==="horario" && <Horario/>}
        {vista==="mensaje" && <Mensaje/>}

      </div>

    </div>
  );
}

export default App;