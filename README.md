# 🐾 AWC IIT ROPAR — Animal Welfare Committee Web App

> **Slogan:** *"Vasudhaiva Kutumbakam"* (वसुधैव कुटुम्बकम् — *The World is One Family*)

An official, free, open, and secure web application built for **Animal Welfare Committee (AWC), IIT Ropar** to list, track, protect, and document campus dogs, cats, and wild birds.

---

## 🌟 Key Features

1. **Slogan Welcome Screen**: Inspiring welcome screen featuring *"Vasudhaiva Kutumbakam"*.
2. **Visual Selection**: Choose between **Animals** or **Birds** using photo cards.
3. **Dog vs Cat Selection**: Interactive photo cards for **Campus Dogs** and **Campus Cats**.
4. **Comprehensive Campus Listings**: Displays complete details for each campus resident:
   - 🐕 **Name**
   - ⏳ **Approximate Age**
   - 📍 **Permanent Residing Place** (Hostels, Gate, Library, Labs)
   - 😊 **Average Behaviour to Humans** (Friendly, Shy, Gentle, Playful)
   - 💉 **Vaccination Status** (Vaccinated / Pending)
   - ✂️ **Sterilization Status** (Sterilized / Neutered / Unsterilized)
   - ✨ **Speciality & Distinctive Trait**
   - 🦜 **Species & Sub-type** (for Campus Wild Birds)
5. **Community Sighting Form**: Students, faculty, and visitors can report new animals or upload photos. Reports are held in a pending queue until approved by Admin.
6. **Hacker-Proof Security**: 
   - 2-Layer Admin Authentication (Master PIN + Supabase Auth)
   - Database Row Level Security (RLS) — public users cannot manipulate or delete data even if they view site source code.
7. **Custom Photo Upload**: Admin can upload real photos of campus animals or paste photo links directly from the Admin Panel.
8. **100% Free Hosting**: Runs seamlessly on **GitHub Pages** with **₹0 hosting cost**.

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Step 1: Create a GitHub Repository
1. Go to your GitHub account: [https://github.com/AjaiDubey](https://github.com/AjaiDubey)
2. Click **New Repository** (`+` top right).
3. Name it: `awc-iit-ropar` or `animal-welfare`.
4. Keep it **Public** (required for free GitHub Pages).
5. Click **Create Repository**.

### Step 2: Upload Project Files
Push or upload all files from this directory to your repository:
```bash
git init
git add .
git commit -m "Initial commit for AWC IIT Ropar web app"
git branch -M main
git remote add origin https://github.com/AjaiDubey/awc-iit-ropar.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Open your repository on GitHub.
2. Click **Settings** ⚙️ -> **Pages** (left menu).
3. Under **Build and deployment -> Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
5. Your live website URL will be ready in 1 minute:
   `https://ajaidubey.github.io/awc-iit-ropar/` 🎉

---

## 🔒 Admin Security & Default Credentials

- **Admin Portal Button**: Top right header (`🛡️ Admin Portal`)
- **Default Security PIN**: `1234`
- **How to Change PIN**: Log into Admin Dashboard -> Click **Security & Settings** -> Enter your new 4-digit PIN -> Click **Update PIN**.

---

## ☁️ Setting Up Free Supabase Cloud Database (Optional)

The website works out-of-the-box using browser storage! To connect to a live cloud database so data syncs across all devices:

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `awc-iit-ropar`.
3. Go to **SQL Editor** -> paste the code from [`supabase_setup.sql`](file:///c:/Users/ramji/Documents/Let's_do_it/supabase_setup.sql) -> click **Run**.
4. Copy your **Project URL** & **Anon API Key** from Settings -> API.
5. In your web app, open **Admin Portal** -> **Security & Settings** -> Paste URL and Anon Key -> Click **Save**.

---

## 🔮 Adding New Features in the Future

Because this app is built with modular code (`index.html`, `style.css`, `js/app.js`), you can easily ask to add new features anytime! Possible future additions:
- 🏥 **Medical & Treatment Log Tracker** (Vaccination due date reminders)
- 🏡 **Adoption & Fostering Request Form**
- 📞 **Emergency Contact / Helpline Numbers** for sick or injured animals
- 🗺️ **Interactive Campus Map** highlighting animal feeding & territory spots

---

*Made with ❤️ for Animal Welfare at IIT Ropar.*
