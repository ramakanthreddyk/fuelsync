const { v4: uuidv4 } = require("uuid");
const pool = require("../models/db");
const { BlobServiceClient } = require("@azure/storage-blob");
const axios = require("axios");

const uploadFile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Upload to Azure Blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("uploads");
    const blobName = `${userId}_${Date.now()}_${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer);
    console.log(`[UPLOAD] Uploaded to Azure: ${blobName}`);

    // OCR Processing
    const visionEndpoint =
      process.env.AZURE_VISION_ENDPOINT + "vision/v3.2/read/analyze";
    const visionKey = process.env.AZURE_VISION_KEY;
    const ocrResponse = await axios.post(visionEndpoint, file.buffer, {
      headers: {
        "Ocp-Apim-Subscription-Key": visionKey,
        "Content-Type": "application/octet-stream",
      },
    });
    const operationUrl = ocrResponse.headers["operation-location"];
    console.log("[OCR] Waiting for Azure OCR results...");
    let ocrResult = null;
    for (let i = 0; i < 10; i++) {
      const result = await axios.get(operationUrl, {
        headers: { "Ocp-Apim-Subscription-Key": visionKey },
      });
      if (result.data.status === "succeeded") {
        ocrResult = result.data.analyzeResult.readResults.flatMap((r) =>
          r.lines.map((line) => line.text)
        );
        console.log("[OCR] Extracted text lines:", ocrResult);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (!ocrResult)
      return res.status(500).json({ message: "OCR failed or timed out" });

    // Parse OCR Data (Python logic ported)
    let pumpSno = null,
      date = null,
      timeStr = null;
    let nozzles = { 1: null, 2: null, 3: null, 4: null };
    const fuelMap = { 1: "Petrol", 2: "Diesel", 3: "Petrol", 4: "Diesel" };

    // Pump Sno Extraction
    for (const line of ocrResult) {
      const match = line.match(/\b\d{7,}\b/);
      if (match) {
        pumpSno = match[0];
        console.log(`[OCR] Found Pump Sno: ${pumpSno}`);
        break;
      }
    }

    // Date and Time Extraction
    for (const line of ocrResult) {
      const cleanedLine = line.replace(/[:,-]/g, ""); // Remove colons, commas, dashes
      if (!date) {
        const match = cleanedLine.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (match) {
          date = match[0].split("/").reverse().join("-");
          console.log(`[OCR] Found Date: ${date}`);
        }
      }
      if (!timeStr) {
        const match = line.match(/(\d{1,2}:\d{1,2}:\d{1,2})/);
        if (match) {
          timeStr = match[0];
          console.log(`[OCR] Found Time: ${timeStr}`);
        }
      }
    }

    // Nozzle Detection and Cumulative Extraction
    let currentNozzle = null;
    for (let i = 0; i < ocrResult.length; i++) {
      const line = ocrResult[i].toLowerCase().replace(/\s+/g, "");
      const nozzleMatch =
        line.match(/nozzle\s*no?\s*([0-9a-zA-Z]+)/) ||
        line.match(/no\s*([0-9a-zA-Z]+)/);
      if (nozzleMatch) {
        const nozzleRaw = nozzleMatch[1];
        const cleaned = nozzleRaw.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
        if (["nol", "no1", "noi", "l", "1"].includes(cleaned))
          currentNozzle = 1;
        else if (["noz", "no2", "z", "2"].includes(cleaned)) currentNozzle = 2;
        else if (["no3", "3"].includes(cleaned)) currentNozzle = 3;
        else if (["no4", "4"].includes(cleaned)) currentNozzle = 4;
        console.log(`[OCR] Found Nozzle ${currentNozzle}`);
      }
      if (currentNozzle) {
        for (let j = i; j < Math.min(i + 5, ocrResult.length); j++) {
          const nearby = ocrResult[j].toLowerCase().replace(/\s+/g, "");
          if (nearby.includes("cumvolume")) {
            const nextLine = ocrResult[j + 1]
              ?.replace(/\s+/g, "")
              .replace(/,/g, "");
            const numMatch = nextLine?.match(/(\d+\.\d+)/);
            if (numMatch) {
              nozzles[currentNozzle] = parseFloat(numMatch[1]);
              console.log(
                `[OCR] Nozzle ${currentNozzle} CumVolume: ${nozzles[currentNozzle]}`
              );
            }
          }
        }
      }
    }

    // Save in DB
    const uploadId = uuidv4();
    const insertQuery = `
      INSERT INTO uploads
      (upload_id, user_id, blob_name, original_filename, status, pump_sno, date, time, nozzle_1, nozzle_2, nozzle_3, nozzle_4)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      uploadId,
      userId,
      blobName,
      file.originalname,
      "uploaded",
      pumpSno,
      date,
      timeStr,
      nozzles[1],
      nozzles[2],
      nozzles[3],
      nozzles[4],
    ];
    const dbResult = await pool.query(insertQuery, values);
    console.log("[UPLOAD] DB Record Saved:", dbResult.rows[0]);

    res.status(201).json({
      message: "File uploaded, OCR processed, data saved",
      data: dbResult.rows[0],
    });
  } catch (err) {
    console.error("[UPLOAD] Error:", err);
    res.status(500).json({ message: "Error during upload/OCR" });
  }
};

const getUploads = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      `SELECT * FROM uploads WHERE user_id = $1 ORDER BY uploaded_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[UPLOADS] Fetch error:", err);
    res.status(500).json({ message: "Error fetching uploads" });
  }
};

module.exports = { uploadFile, getUploads };
