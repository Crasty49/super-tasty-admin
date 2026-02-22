import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./config"; // usa tu firebase ya creado

// 🔔 ACTIVAR NOTIFICACIONES
export const activarNotificaciones = async () => {

  const permiso = await Notification.requestPermission();

  if (permiso !== "granted") {
    console.log("❌ Permiso denegado");
    return;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: "BAPH2hIg5RaM0zlcZGWPF-gwjw5_t1X8XfSuv-alz4e76N4cPV-uyC-Nkp53v_Xi9GyfNPUAm0Lxp8s03qTloao"
    });

    console.log("🔥 TOKEN ADMIN:", token);

  } catch (error) {
    console.log("Error obteniendo token", error);
  }
};

// 🔔 CUANDO APP ABIERTA
export const escucharForeground = () => {
  onMessage(messaging, (payload) => {

    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/icon-192.png"
    });

  });
};