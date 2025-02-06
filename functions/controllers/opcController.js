const admin = require("firebase-admin");
const { successResponse, errorResponse } = require("../utils/response");

// Store OPC data in Firestore
exports.storeData = async (req, res) => {
  const db = admin.firestore();
  console.log("Received body:", req.body);

  try {
    let id, value, message, count;

    // Check if the input is a simple key-value pair (external API format)
    if (typeof req.body === 'object' && Object.keys(req.body).length === 1) {
      const key = Object.keys(req.body)[0];
      const cleanedKey = key.trim();

      // Try to split by comma first (Postman format)
      if (cleanedKey.includes(',')) {
        [id, value, message, count] = cleanedKey.split(', ');
      } else {
        // Handle external API format (assuming format: "7uiqZnLD4iu5wRLzabpe TRUE")
        const parts = cleanedKey.split(' ');
        id = parts[0];
        value = parts[1]?.toLowerCase();
        message = parts[2] || '';
        count = parts[3] || '0';
      }
    } else {
      return errorResponse(res, "Invalid request format", 400);
    }

    console.log("Parsed values:", { id, value, message, count });

    // Validate ID
    if (!id) {
      return errorResponse(res, "Invalid format: ID is required", 400);
    }

    // Normalize the boolean value
    const isOnline = value === 'true' || value === 'TRUE';
    console.log("Is online:", isOnline);

    // Get the document reference
    const docRef = db.collection("systems").doc(id);
    const lineSnapshot = await docRef.get();

    if (!lineSnapshot.exists) {
      console.error(`Document with ID ${id} does not exist.`);
      return errorResponse(res, "System not found", 404);
    }

    const lineData = lineSnapshot.data();

    // Update the systems collection
    await docRef.update({
      online: isOnline,
      message: message || '',
      count: count || '0',
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    });


    // If system is offline, add to downedLines collection
    if (!isOnline) {
      await db.collection("downedLines").add({
        lineId: id,
        lineName: lineData.line_Name || "Unknown Line",
        timestamp: new Date(),
        status: 'unresolved',
        notificationTimestamps: [],
        technicianId: '',
        managerId: '',
        totalDownTime: '',
        supervisorId: '',
        supervisorName: '',
        faultMessage: message || 'System Offline',
        faultStatus: "warning",
        count: count || '0'
      });
    }

    return successResponse(res, { id, status: isOnline }, "Data stored successfully", 201);
  } catch (error) {
    console.error("Error storing data:", error);
    return errorResponse(res, "Internal server error", 500);
  }
};

