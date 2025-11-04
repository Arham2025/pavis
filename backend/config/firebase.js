const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.LEARNING_FIREBASE);  //For development

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // storageBucket: "learning-1d8dd.firebasestorage.app"  //For development
  storageBucket: "pavis-3ccdf.firebasestorage.app"  
});

const bucket = admin.storage().bucket();

module.exports = bucket;