/**
 * =========================================================================
 * 🐾 CAMPUS PAW-SAFARI — REAL-TIME GOOGLE APPS SCRIPT BACKEND & LEADERBOARD
 * =========================================================================
 * Handles real-time submissions, 3-angle photo storage to Google Drive,
 * and maintains an automated LIVE LEADERBOARD with tie-breaker logic.
 * 
 * 🏆 WINNING RULES IMPLEMENTED:
 * 1. Must have all 3 photo angles (Front, Left, Right).
 * 2. Most valid unique dogs/cats spotted wins.
 * 3. Animal must be properly named.
 * 4. Tie-breaker: Earliest timestamp wins!
 * =========================================================================
 */

const DRIVE_FOLDER_NAME = "Campus_Animal_Photos";
const SHEET_TAB_NAME = "Animal_Sightings";
const LEADERBOARD_TAB_NAME = "Live_Leaderboard";

/**
 * Handle HTTP GET requests:
 * - Ping check
 * - Fetch Live Leaderboard JSON for the mobile app
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";

    if (action === "leaderboard") {
      const leaderboardData = computeLeaderboard();
      return responseJSON({
        status: "success",
        leaderboard: leaderboardData,
        timestamp: new Date().toISOString()
      });
    }

    return responseJSON({
      status: "online",
      message: "🐾 Campus Paw-Safari Google Apps Script is LIVE & Ready!",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

/**
 * Handle HTTP POST requests (New Sighting Submitted)
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "No data payload received" });
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Get or create Sightings sheet
    let sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TAB_NAME);
      initSightingsHeaders(sheet);
    } else if (sheet.getLastRow() === 0) {
      initSightingsHeaders(sheet);
    }

    // 2. Validate 3 Photos & Name (Competition Rules)
    const hasFront = !!(data.photoFront && data.photoFront.includes("base64,"));
    const hasLeft = !!(data.photoLeft && data.photoLeft.includes("base64,"));
    const hasRight = !!(data.photoRight && data.photoRight.includes("base64,"));
    const hasName = !!(data.animalName && data.animalName.trim().length > 0 && data.animalName !== "Unnamed");

    const isRuleCompliant = (hasFront && hasLeft && hasRight && hasName);

    // 3. Save photos to Google Drive
    const driveFolder = getOrCreateFolder(DRIVE_FOLDER_NAME);
    const animalNameClean = (data.animalName || "Unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestampClean = new Date().toISOString().replace(/[:.]/g, "-");

    const photoFrontUrl = saveBase64Image(data.photoFront, `${animalNameClean}_FRONT_${timestampClean}.jpg`, driveFolder);
    const photoLeftUrl = saveBase64Image(data.photoLeft, `${animalNameClean}_LEFT_${timestampClean}.jpg`, driveFolder);
    const photoRightUrl = saveBase64Image(data.photoRight, `${animalNameClean}_RIGHT_${timestampClean}.jpg`, driveFolder);

    // 4. Build Map Link
    let mapsLink = "";
    if (data.gpsLat && data.gpsLng) {
      mapsLink = `https://maps.google.com/?q=${data.gpsLat},${data.gpsLng}`;
    }

    const now = new Date();
    const formattedTime = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    // 5. Append row to Sightings sheet
    sheet.appendRow([
      formattedTime,                                             // A: Timestamp (IST)
      data.playerName || "Anonymous Scout",                      // B: Scout Name
      data.playerHostel || "Campus",                             // C: Hostel / Roll
      data.animalType || "Dog",                                  // D: Animal Type
      data.animalName || "Unnamed",                              // E: Animal Name
      data.ageStage || "Adult",                                  // F: Age / Stage
      data.landmark || "Campus Ground",                          // G: Landmark
      (data.gpsLat && data.gpsLng) ? `${data.gpsLat}, ${data.gpsLng}` : "N/A", // H: GPS
      mapsLink ? `=HYPERLINK("${mapsLink}", "📍 View Map")` : "N/A",           // I: Map Link
      data.distinctiveMarks || "None",                           // J: Notes / Traits
      photoFrontUrl ? `=HYPERLINK("${photoFrontUrl}", "📸 Front")` : "Missing", // K: Front
      photoLeftUrl ? `=HYPERLINK("${photoLeftUrl}", "📸 Left")` : "Missing", // L: Left
      photoRightUrl ? `=HYPERLINK("${photoRightUrl}", "📸 Right")` : "Missing", // M: Right
      isRuleCompliant ? "QUALIFIED (3 Angles + Named)" : "DISQUALIFIED (Incomplete)", // N: Rule Check
      data.xpEarned || 100,                                      // O: XP Points
      now.getTime()                                              // P: Raw Milliseconds (for precision tie-breaker)
    ]);

    // 6. Update Leaderboard Sheet Tab
    updateLeaderboardSheet(ss);

    return responseJSON({
      status: "success",
      message: `Successfully logged ${data.animalName}!`,
      row: sheet.getLastRow(),
      isQualified: isRuleCompliant
    });

  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

/**
 * Computes Leaderboard Array sorted by:
 * 1. Most Qualified Sightings (Descending)
 * 2. Earliest Completion Timestamp (Ascending - Tie Breaker Rule 4)
 */
function computeLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  const spotterMap = {};

  data.forEach(row => {
    const spotter = row[1]; // Spotter Name
    const hostel = row[2];  // Hostel / Roll
    const isQualified = (row[13] === "QUALIFIED (3 Angles + Named)");
    const rawTime = Number(row[15]) || new Date(row[0]).getTime();

    const key = spotter.trim().toLowerCase();
    if (!spotterMap[key]) {
      spotterMap[key] = {
        name: spotter,
        hostel: hostel,
        qualifiedCount: 0,
        totalSightings: 0,
        lastQualifiedTimestamp: 0
      };
    }

    spotterMap[key].totalSightings += 1;
    if (isQualified) {
      spotterMap[key].qualifiedCount += 1;
      if (rawTime > spotterMap[key].lastQualifiedTimestamp) {
        spotterMap[key].lastQualifiedTimestamp = rawTime;
      }
    }
  });

  // Convert to array and sort according to tournament rules
  const list = Object.values(spotterMap);
  list.sort((a, b) => {
    // Primary: Maximum qualified animals (Rule 2)
    if (b.qualifiedCount !== a.qualifiedCount) {
      return b.qualifiedCount - a.qualifiedCount;
    }
    // Tie-breaker: Earliest time of reaching that score (Rule 4)
    return a.lastQualifiedTimestamp - b.lastQualifiedTimestamp;
  });

  // Assign titles to top 3
  const titles = [
    "🥇 Grand Alpha Ranger",
    "🥈 Master Whiskers Detective",
    "🥉 Top Bark-Scout"
  ];

  return list.map((item, idx) => ({
    rank: idx + 1,
    title: idx < 3 ? titles[idx] : "Campus Paw-Scout",
    name: item.name,
    hostel: item.hostel,
    score: item.qualifiedCount,
    total: item.totalSightings,
    lastTime: item.lastQualifiedTimestamp ? new Date(item.lastQualifiedTimestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A"
  }));
}

/**
 * Updates the 'Live_Leaderboard' tab in Google Sheets
 */
function updateLeaderboardSheet(ss) {
  let lbSheet = ss.getSheetByName(LEADERBOARD_TAB_NAME);
  if (!lbSheet) {
    lbSheet = ss.insertSheet(LEADERBOARD_TAB_NAME);
  }

  lbSheet.clear();

  // Header row
  const headers = [
    "Rank",
    "Volunteer Honor Title",
    "Scout Name",
    "Hostel / ID",
    "Valid 3-Sided Animals (Score)",
    "Total Sightings",
    "Tie-Breaker Finish Time (IST)"
  ];
  lbSheet.appendRow(headers);

  // Style header
  const headerRange = lbSheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1b4332");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");

  const leaderboard = computeLeaderboard();

  leaderboard.forEach(entry => {
    lbSheet.appendRow([
      `#${entry.rank}`,
      entry.title,
      entry.name,
      entry.hostel,
      entry.score,
      entry.total,
      entry.lastTime
    ]);
  });

  // Highlight Top 3 with Gold, Silver, Bronze rows
  if (leaderboard.length >= 1) {
    lbSheet.getRange(2, 1, 1, headers.length).setBackground("#ffe8cc"); // Gold tint
  }
  if (leaderboard.length >= 2) {
    lbSheet.getRange(3, 1, 1, headers.length).setBackground("#f1f3f5"); // Silver tint
  }
  if (leaderboard.length >= 3) {
    lbSheet.getRange(4, 1, 1, headers.length).setBackground("#ffec99"); // Bronze tint
  }

  lbSheet.setFrozenRows(1);
  try { lbSheet.autoResizeColumns(1, headers.length); } catch (e) { }
}

/**
 * Initialize Headers for Animal_Sightings sheet
 */
function initSightingsHeaders(sheet) {
  const headers = [
    "Timestamp (IST)",
    "Scout Name",
    "Hostel / ID",
    "Category",
    "Animal Name",
    "Age / Stage",
    "Landmark",
    "GPS Lat, Lng",
    "Map Link",
    "Notes & Traits",
    "Photo 1: Front",
    "Photo 2: Left Side",
    "Photo 3: Right Side",
    "Competition Status",
    "XP Points",
    "Raw Timestamp (ms)"
  ];
  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#2d6a4f");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * Helper to save base64 image into Google Drive
 */
function saveBase64Image(base64String, fileName, folder) {
  if (!base64String || typeof base64String !== "string" || !base64String.includes("base64,")) {
    return "";
  }
  try {
    const parts = base64String.split("base64,");
    const contentType = parts[0].split(":")[1].split(";")[0] || "image/jpeg";
    const decodedBytes = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(decodedBytes, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Error saving photo: " + err.message);
    return "";
  }
}

/**
 * Find or create a folder in Google Drive
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  const newFolder = DriveApp.createFolder(folderName);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

/**
 * Returns formatted JSON response
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
