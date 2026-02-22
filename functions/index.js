const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// 🔴 TU TOKEN ADMIN
const TOKEN_ADMIN = "feBN2lSHCWbvk59gvXR4AK:APA91bHocobsEw7DUlb9HNq1tshiJOCgfJv8cjf61bgHHm7yer7FSJ05beApz7xisQ6B587_ro-eOk7Hkxb0Lg_-fHaq5JcRoSo8Z-_iZI4DINl_M5xDfBU";

// 🔔 CUANDO SE CREA PEDIDO NUEVO
exports.notificarPedidoNuevo = functions.firestore
  .document("pedidos/{id}")
  .onCreate(async (snap, context) => {

    const pedido = snap.data();

    const payload = {
      notification: {
        title: "🔥 Nuevo pedido",
        body: `${pedido.cliente} - $${pedido.total}`
      }
    };

    try {
      await admin.messaging().sendToDevice(TOKEN_ADMIN, payload);
      console.log("Notificación enviada");
    } catch (error) {
      console.log("Error enviando:", error);
    }
  });