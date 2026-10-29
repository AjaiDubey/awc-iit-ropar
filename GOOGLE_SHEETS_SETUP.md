# 🐾 The Great Campus Paw-Safari: Morning Sprint (3 Hours)
## Google Sheet Control, Live Leaderboard & Tournament Rules Guide

---

## 🔒 1. Will You Have Full Control Over the Google Sheet?

**YES, 100% TOTAL CONTROL.**
- The Google Sheet and Google Drive folder (`Campus_Animal_Photos`) live entirely inside **your personal Google Account**.
- During the 3-hour game, the Google Apps Script simply acts as a secure volunteer assistant that writes incoming entries into rows in real time.
- **After the 3-hour event ends, you can:**
  1. **Edit, rename, or delete any row** (e.g. merge duplicates, fix typo names).
  2. **Add extra columns** (e.g., *Sterilization Tag ID*, *Medical Notes*, *Feeding Schedule*, *Vaccination Date*).
  3. **Freeze or lock submissions** anytime by pausing the script or setting the event timer.
  4. **Export all data & photos** as an Excel spreadsheet (`.xlsx`), CSV, or PDF report.
  5. **Sync with the website**: You can copy-paste the final verified dogs/cats directly into the AWC website database.

---

## 🏆 2. Pet-Friendly Event Name & Winner Volunteer Titles

### 🌟 Event Name:
> **"The Great Campus Paw-Safari: Morning Sprint"**  
*(A 3-hour community race to document, identify, and protect our four-legged campus residents)*

### 🎖️ The 3 Pet-Friendly Winner Volunteer Titles:
| Rank | Honor Title | Badge | Meaning |
|---|---|---|---|
| **1st Place (Gold)** | **Grand Alpha Ranger** | 🥇🐾 | Supreme protector and top spotter of the campus pack |
| **2nd Place (Silver)** | **Master Whiskers Detective** | 🥈🐈 | Sharpest scout in tracking and cataloging campus residents |
| **3rd Place (Bronze)** | **Top Campus Bark-Scout** | 🥉🐕 | Elite guardian and volunteer hero |

---

## 📜 3. The 4 Golden Winning Rules (Enforced in Code & Sheet)

| Rule # | Rule Name | How It Is Handled |
|---|---|---|
| **Rule 1** | **Strict 3-Sided Photos** | The mobile app checks that **Front Face**, **Left Flank**, and **Right Flank** are all captured before allowing submission. In the sheet, missing angles are marked `DISQUALIFIED`. |
| **Rule 2** | **Maximum Coverage** | The volunteer who accurately documents the highest count of qualifying campus animals takes 1st place. |
| **Rule 3** | **All Animals Must Be Named** | Animals cannot be left unnamed. The app requires a name (or a quick 🎲 Dice roll for a cute name like *Sheru, Oreo, Biscuit, Goldie*). |
| **Rule 4** | **Tie-Breaker: Earliest Time Wins** | If two volunteers spot the same number of animals, the script compares the exact millisecond timestamp of their final qualifying sighting — **the one who finished earlier in the morning wins!** |

---

## 📊 4. How the Live Leaderboard Works

1. **In Google Sheets**:
   - A dedicated tab named **`Live_Leaderboard`** is automatically generated.
   - It lists volunteers in descending rank order with custom gold, silver, and bronze highlights, showing their score, total sightings, and tie-breaker finish time (IST).
2. **Inside the Mobile Game App (`spotter.html`)**:
   - Tap the **🏆 Live Leaderboard** tab at the top.
   - Displays a dynamic 3D-style **Podium Stand** with 🥇, 🥈, and 🥉 avatars, titles, and live counts.
   - Tapping the **Sync** button fetches the latest standings straight from the Google Apps Script in real time.
3. **Big Screen / Projector (Optional)**:
   - You can project the `Live_Leaderboard` tab on a screen at the student center/mess to show live scores during the 3 hours!

---

## ⏱️ 5. Next Steps to Launch

### Step 1: Deploy the Updated Script
1. Open your Google Sheet -> **Extensions** -> **Apps Script**.
2. Replace everything in `Code.gs` with the updated [`google_apps_script.js`](file:///c:/Users/ramji/Documents/Let's_do_it/google_apps_script.js).
3. Click **Deploy** -> **Manage deployments** -> edit the deployment (or **New deployment**) -> Click **Deploy**.
4. Copy the Web App URL.

### Step 2: Set the 3-Hour Window in the Game
1. Open [`spotter.html`](file:///c:/Users/ramji/Documents/Let's_do_it/spotter.html).
2. Tap the **⚙️ Settings Gear Icon** at the top right.
3. Paste your Google Apps Script URL.
4. Select **3 Hours (Early Morning Sprint)** and tap **Start/Reset 3h Timer**.
5. The live countdown ticker `02:59:59` will start ticking down. When time runs out, submissions are automatically closed!

### Step 3: Spread the Word
1. Share the link `https://<your-username>.github.io/<repo>/spotter.html` or generate a QR code for campus WhatsApp groups, hostels, and noticeboards.
2. Instruct volunteers to open the link on their mobile phones and tap "Add to Home Screen".
3. Kick off the 3-hour morning sprint and watch the Google Sheet and Live Leaderboard populate in real time!
