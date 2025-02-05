const admin = require("firebase-admin");
const { successResponse, errorResponse } = require("../utils/response");

// Store OPC data in Firestore
exports.storeData = async (req, res) => {
  const db = admin.firestore();
  console.log(req.body);
  try {
    // Step 1: Remove the curly braces, single quotes, and trim spaces
    // let formattedString = req.body.replace(/[{}'"]/g, '').trim();
    // Step 2: Remove the empty value after the colon
    // formattedString = formattedString.split(':')[0].trim();
    // console.log(formattedString);

    const receivedObject = req.body;
    // Extract the key from the object
    const key = Object.keys(receivedObject)[0];

    //clean up the key 
    const cleanedKey = key.trim(); // Remove leading/trailing spaces, if necessary

    console.log(cleanedKey); // This will log '7uiqZnLD4iu5wRLzabpe, true, message, count'

    // Split the input string into ID, value, message, and count
    const [id, value, message, count] = cleanedKey.split(', ');

    // Validate extracted data
    if (!id || !value) {
      return errorResponse(res, "Invalid format: expected 'id, value, message, count'", 400);
    }

    // Ensure `value` is either "true" or "false"
    const isOnline = value.trim().toLowerCase();
    console.log(isOnline);
    if (isOnline !== "true" && isOnline !== "false") {
      return errorResponse(res, "Invalid value: 'value' must be 'true' or 'false'", 400);
    }

    if (!isOnline && message) {
      // Update Firestore document
      const docRef = db.collection("systems").doc(id);
      await docRef.update({
        online: isOnline === "true",
        message,
        count: count || '0' // Add count field with default value if not provided
      });
    }
    else if (isOnline && message) {
      const lineSnapshot = await db.collection("systems").doc(id).get();
      const lineData = lineSnapshot.data();
      if (!lineSnapshot.exists) {
        console.error(`Document with ID ${id} does not exist.`);
        return;
      }

      // Update Firestore document
      const docRef = db.collection("systems").doc(id);
      await docRef.update({
        online: isOnline === "true",
        message,
        count: count || '0' // Add count field with default value if not provided
      });

      // Update Firestore document for downed lines
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
        faultMessage: message,
        faultStatus: "warning",
        count: count || '0' // Add count field to downedLines collection
      });
    }

    return successResponse(res, { id }, "Data stored successfully", 201);
  } catch (error) {
    console.error("Error storing data:", error);

    // Handle Firestore errors (e.g., document not found)
    if (error.code === 5) { // Firestore "not-found" error code
      return errorResponse(res, "Document not found", 404);
    }

    return errorResponse(res, "Internal server error", 500);
  }
};

