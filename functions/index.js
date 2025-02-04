const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });


const express = require("express");
const cors = require("cors");
const opcRoutes = require("./routes/opcRoutes");

// Main app
const app = express();
app.set('trust proxy', true); 
app.use(cors({origin: true}));
app.use(express.json());

// Routes
app.use("/api/opc", opcRoutes);
app.use("/", (req, res) => res.send("Hello from Firebase!"));

exports.app = functions.https.onRequest(app);


