/* ==========================================================================
   AWC IIT ROPAR — Main Application JavaScript
   Handles Navigation, Data Rendering, Search & Filters, Form Submissions,
   Admin Authentication (Password + Security PIN), CSV/Excel Import, WhatsApp Updates
   ========================================================================== */

const app = {
  currentScreen: 'screen-welcome',
  currentCategory: 'dog', // 'dog', 'cat', or 'bird'
  screenHistory: [],
  activeFilter: 'all',
  cachedAnimals: [],
  isAdminAuthenticated: false,

  init: function() {
    console.log('🐾 AWC IIT Ropar App Initialized');
    this.setupTheme();
    
    // Check if returning from back history
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.screen) {
        this.renderScreen(e.state.screen, false);
      }
    });

    // Populate Supabase credentials if stored
    if (localStorage.getItem('awc_supabase_url')) {
      const urlInput = document.getElementById('setting-supabase-url');
      if (urlInput) urlInput.value = localStorage.getItem('awc_supabase_url');
    }
    if (localStorage.getItem('awc_supabase_key')) {
      const keyInput = document.getElementById('setting-supabase-key');
      if (keyInput) keyInput.value = localStorage.getItem('awc_supabase_key');
    }
  },

  // Navigation Logic
  showScreen: function(screenId, recordHistory = true) {
    if (this.currentScreen === screenId) return;

    if (recordHistory) {
      this.screenHistory.push(this.currentScreen);
      history.pushState({ screen: screenId }, '', `#${screenId}`);
    }

    this.renderScreen(screenId);
  },

  renderScreen: function(screenId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Toggle Back Button Bar
    const backBar = document.getElementById('nav-back-bar');
    if (screenId === 'screen-welcome') {
      backBar.style.display = 'none';
    } else {
      backBar.style.display = 'block';
    }
  },

  goBack: function() {
    if (this.screenHistory.length > 0) {
      const prev = this.screenHistory.pop();
      this.renderScreen(prev);
    } else {
      this.showScreen('screen-welcome', false);
    }
  },

  // Category Listings Navigation
  loadListings: async function(categoryType) {
    this.currentCategory = categoryType;
    this.showScreen('screen-listings');

    // Title and icon customizer
    const titleEl = document.getElementById('listing-heading-title');
    const subTitleEl = document.getElementById('listing-heading-subtitle');

    if (categoryType === 'dog') {
      titleEl.innerHTML = '🐕 Campus Dogs of IIT Ropar';
      subTitleEl.textContent = 'Profiles, vaccination records, territories & traits of campus dogs.';
    } else if (categoryType === 'cat') {
      titleEl.innerHTML = '🐈 Campus Cats of IIT Ropar';
      subTitleEl.textContent = 'Meet our campus cats, their favorite quiet spots & health status.';
    } else if (categoryType === 'bird') {
      titleEl.innerHTML = '🐦 Campus Wild Birds Catalogue';
      subTitleEl.textContent = 'Avian species nesting and flourishing across IIT Ropar grounds.';
    }

    // Fetch animals from DataStore
    this.cachedAnimals = await DataStore.fetchAnimals(categoryType);
    this.renderAnimalCards(this.cachedAnimals);
  },

  // Render Animal Cards Grid
  renderAnimalCards: function(animals) {
    const container = document.getElementById('animals-container');
    container.innerHTML = '';

    if (!animals || animals.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-paw" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No profiles listed yet</h3>
          <p style="color: var(--text-muted);">Be the first to report a ${this.currentCategory} spotted on campus!</p>
          <br>
          <button class="btn-cta" style="font-size: 0.95rem; padding: 0.6rem 1.5rem;" onclick="app.openReportForm()">
            Report New ${this.currentCategory.toUpperCase()}
          </button>
        </div>
      `;
      return;
    }

    animals.forEach(item => {
      const isVax = item.vaccination_status && item.vaccination_status.toLowerCase().includes('vac');
      const photoSrc = item.photo_url || (this.currentCategory === 'bird' ? 'images/bird-card.jpg' : this.currentCategory === 'cat' ? 'images/cat-card.jpg' : 'images/dog-card.jpg');

      // WhatsApp Redirect URL pre-filled message
      const waText = encodeURIComponent(`Hi AWC Team! I want to share an update regarding ${item.name} (${item.species || item.type}) residing near ${item.permanent_location || 'campus'}.`);
      const waUrl = `https://wa.me/?text=${waText}`;

      const cardHTML = `
        <div class="animal-card">
          <div class="animal-card-header">
            <img src="${photoSrc}" alt="${item.name}" onerror="this.src='images/${this.currentCategory}-card.jpg'">
            <span class="tag-species">${item.species || (this.currentCategory.toUpperCase())}</span>
            <span class="tag-vax ${isVax ? 'yes' : 'no'}">
              ${isVax ? '💉 Vaccinated' : '⚠️ Vax Pending'}
            </span>
          </div>

          <div class="animal-card-body">
            <div class="animal-name-title">
              <h3>${item.name}</h3>
              <span class="animal-age">${item.approx_age || 'Age Unknown'}</span>
            </div>

            <div class="details-list">
              <div class="detail-item">
                <i class="fa-solid fa-location-dot"></i>
                <span><strong>Resides:</strong> ${item.permanent_location || 'Campus Grounds'}</span>
              </div>
              <div class="detail-item">
                <i class="fa-solid fa-face-smile"></i>
                <span><strong>Behaviour:</strong> ${item.avg_behavior || 'Gentle'}</span>
              </div>
              <div class="detail-item">
                <i class="fa-solid fa-shield-cat"></i>
                <span><strong>Sterilization:</strong> ${item.sterilization_status || 'Unspecified'}</span>
              </div>
            </div>

            ${item.speciality ? `
              <div class="speciality-box">
                <strong>Speciality:</strong> ${item.speciality}
              </div>
            ` : ''}

            <a href="${waUrl}" target="_blank" class="btn-whatsapp-update" title="Send update on WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> Want to update info about ${item.name}?
            </a>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });
  },

  // Filter & Search Logic
  filterListings: function() {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = this.cachedAnimals.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const locMatch = (item.permanent_location || '').toLowerCase().includes(query);
      const specMatch = (item.speciality || '').toLowerCase().includes(query);
      const breedMatch = (item.species || '').toLowerCase().includes(query);
      return nameMatch || locMatch || specMatch || breedMatch;
    });

    if (this.activeFilter === 'vax') {
      filtered = filtered.filter(i => (i.vaccination_status || '').toLowerCase().includes('vac'));
    } else if (this.activeFilter === 'neutered') {
      filtered = filtered.filter(i => (i.sterilization_status || '').toLowerCase().includes('steril') || (i.sterilization_status || '').toLowerCase().includes('neuter'));
    }

    this.renderAnimalCards(filtered);
  },

  setFilterTag: function(tag, element) {
    this.activeFilter = tag;
    document.querySelectorAll('.pill-filter').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    this.filterListings();
  },

  // Open Report Form
  openReportForm: function() {
    const reportTypeSelect = document.getElementById('report-type');
    reportTypeSelect.value = this.currentCategory || 'dog';
    this.showScreen('screen-report-form');
  },

  // File Upload Helper
  handleFileSelect: function(event, previewId, hiddenInputId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File size must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const previewImg = document.getElementById(previewId);
      const hiddenInput = document.getElementById(hiddenInputId);
      if (previewImg) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'inline-block';
      }
      if (hiddenInput) {
        hiddenInput.value = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  },

  // Public Report Submit Handler
  handleReportSubmit: async function(event) {
    event.preventDefault();

    const reportObj = {
      type: document.getElementById('report-type').value,
      name: document.getElementById('report-name').value.trim(),
      species: document.getElementById('report-species').value.trim(),
      approx_age: document.getElementById('report-age').value.trim(),
      permanent_location: document.getElementById('report-location').value.trim(),
      avg_behavior: document.getElementById('report-behavior').value.trim(),
      vaccination_status: document.getElementById('report-vax').value,
      sterilization_status: document.getElementById('report-sterilization').value,
      speciality: document.getElementById('report-speciality').value.trim(),
      photo_url: document.getElementById('report-photo-url').value,
      reported_by: document.getElementById('report-user').value.trim() || 'Campus Visitor'
    };

    const res = await DataStore.submitReport(reportObj);
    if (res.success) {
      this.showToast('Thank you! Animal report submitted for Admin review.', 'success');
      document.getElementById('report-form').reset();
      document.getElementById('report-photo-preview').style.display = 'none';
      this.loadListings(reportObj.type);
    } else {
      this.showToast('Error submitting report. Please try again.', 'error');
    }
  },

  // Admin Portal Open & Auth
  openAdminPortal: function() {
    if (this.isAdminAuthenticated) {
      this.showScreen('screen-admin-dashboard');
      this.loadAdminDashboard();
    } else {
      this.showScreen('screen-admin-auth');
    }
  },

  focusNextPin: function(current, nextId) {
    if (current.value.length >= 1 && nextId) {
      document.getElementById(nextId).focus();
    }
  },

  verifyAdminPin: function(event) {
    event.preventDefault();
    const p1 = document.getElementById('pin-1').value;
    const p2 = document.getElementById('pin-2').value;
    const p3 = document.getElementById('pin-3').value;
    const p4 = document.getElementById('pin-4').value;
    const enteredPin = `${p1}${p2}${p3}${p4}`;

    if (DataStore.verifyPin(enteredPin)) {
      this.isAdminAuthenticated = true;
      this.showToast('Admin verification successful!', 'success');
      this.showScreen('screen-admin-dashboard');
      this.loadAdminDashboard();
    } else {
      this.showToast('Invalid Security PIN! Please check and retry.', 'error');
      document.querySelectorAll('.pin-digit').forEach(i => i.value = '');
      document.getElementById('pin-1').focus();
    }
  },

  loginWithGoogle: function() {
    if (supabaseClient) {
      supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
      });
    } else {
      this.showToast('Please configure Supabase URL & Key in settings first for Google Auth.', 'info');
    }
  },

  // Admin Dashboard Render & Tabs
  loadAdminDashboard: async function() {
    const allData = await DataStore.fetchAllForAdmin();
    const approvedData = allData.filter(i => i.is_approved === true);
    const pendingData = allData.filter(i => i.is_approved === false);

    document.getElementById('count-all').textContent = approvedData.length;
    document.getElementById('count-pending').textContent = pendingData.length;

    // Render Approved Table
    const tbodyManage = document.getElementById('admin-table-body');
    tbodyManage.innerHTML = '';
    approvedData.forEach(item => {
      const row = `
        <tr>
          <td><img src="${item.photo_url || 'images/' + item.type + '-card.jpg'}" class="thumb-mini" alt="${item.name}"></td>
          <td><strong>${item.name}</strong></td>
          <td><span class="tag-species">${item.type.toUpperCase()}</span></td>
          <td>${item.permanent_location || 'Campus'}</td>
          <td>${item.vaccination_status || 'N/A'}</td>
          <td>
            <button class="btn-icon-action edit" title="Edit" onclick="app.openEditAnimalModal('${item.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon-action delete" title="Delete" onclick="app.deleteAnimalRecord('${item.id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
      tbodyManage.insertAdjacentHTML('beforeend', row);
    });

    // Render Pending Table
    const tbodyPending = document.getElementById('pending-table-body');
    tbodyPending.innerHTML = '';
    if (pendingData.length === 0) {
      tbodyPending.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No pending reports awaiting review.</td></tr>`;
    } else {
      pendingData.forEach(item => {
        const row = `
          <tr>
            <td><img src="${item.photo_url || 'images/' + item.type + '-card.jpg'}" class="thumb-mini" alt="${item.name}"></td>
            <td><strong>${item.name}</strong></td>
            <td><span class="tag-species">${item.type.toUpperCase()}</span></td>
            <td>${item.permanent_location}</td>
            <td>${item.reported_by || 'Anonymous'}</td>
            <td>
              <button class="btn-icon-action approve" title="Approve & Publish" onclick="app.approveReport('${item.id}')"><i class="fa-solid fa-check-double"></i> Approve</button>
              <button class="btn-icon-action delete" title="Reject Report" onclick="app.deleteAnimalRecord('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
            </td>
          </tr>
        `;
        tbodyPending.insertAdjacentHTML('beforeend', row);
      });
    }
  },

  switchAdminTab: function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
  },

  // Batch Excel / CSV Import
  handleExcelImport: function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      let addedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 3) {
          const item = {
            id: 'import-' + Date.now() + '-' + i,
            type: (cols[0] || 'dog').trim().toLowerCase(),
            name: (cols[1] || 'Unnamed').trim(),
            species: (cols[2] || '').trim(),
            approx_age: (cols[3] || '').trim(),
            permanent_location: (cols[4] || 'Campus').trim(),
            avg_behavior: (cols[5] || 'Friendly').trim(),
            vaccination_status: (cols[6] || 'Vaccinated (Up-to-date)').trim(),
            sterilization_status: (cols[7] || 'Sterilized').trim(),
            speciality: (cols[8] || '').trim(),
            photo_url: (cols[9] || '').trim(),
            is_approved: true
          };
          await DataStore.saveAnimal(item);
          addedCount++;
        }
      }
      this.showToast(`Successfully imported ${addedCount} records from file!`, 'success');
      this.loadAdminDashboard();
    };
    reader.readAsText(file);
  },

  // CRUD Actions
  openAddAnimalModal: function() {
    document.getElementById('modal-title').textContent = 'Add New Campus Animal / Bird';
    document.getElementById('admin-animal-form').reset();
    document.getElementById('modal-animal-id').value = '';
    document.getElementById('modal-photo-preview').style.display = 'none';
    this.openModal('animal-modal');
  },

  openEditAnimalModal: async function(id) {
    const all = await DataStore.fetchAllForAdmin();
    const item = all.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modal-title').textContent = 'Edit Animal Profile';
    document.getElementById('modal-animal-id').value = item.id;
    document.getElementById('modal-type').value = item.type;
    document.getElementById('modal-name').value = item.name;
    document.getElementById('modal-species').value = item.species || '';
    document.getElementById('modal-age').value = item.approx_age || '';
    document.getElementById('modal-location').value = item.permanent_location || '';
    document.getElementById('modal-behavior').value = item.avg_behavior || '';
    document.getElementById('modal-vax').value = item.vaccination_status || 'Vaccinated (Up-to-date)';
    document.getElementById('modal-sterilization').value = item.sterilization_status || 'Sterilized';
    document.getElementById('modal-speciality').value = item.speciality || '';
    document.getElementById('modal-photo-url').value = item.photo_url || '';

    if (item.photo_url) {
      const prevImg = document.getElementById('modal-photo-preview');
      prevImg.src = item.photo_url;
      prevImg.style.display = 'inline-block';
    }

    this.openModal('animal-modal');
  },

  handleAdminSaveAnimal: async function(event) {
    event.preventDefault();

    const animalObj = {
      id: document.getElementById('modal-animal-id').value,
      type: document.getElementById('modal-type').value,
      name: document.getElementById('modal-name').value.trim(),
      species: document.getElementById('modal-species').value.trim(),
      approx_age: document.getElementById('modal-age').value.trim(),
      permanent_location: document.getElementById('modal-location').value.trim(),
      avg_behavior: document.getElementById('modal-behavior').value.trim(),
      vaccination_status: document.getElementById('modal-vax').value,
      sterilization_status: document.getElementById('modal-sterilization').value,
      speciality: document.getElementById('modal-speciality').value.trim(),
      photo_url: document.getElementById('modal-photo-url').value || document.getElementById('modal-photo-url-input').value.trim(),
      is_approved: true
    };

    await DataStore.saveAnimal(animalObj);
    this.closeModal('animal-modal');
    this.showToast('Animal profile saved successfully!', 'success');
    this.loadAdminDashboard();
  },

  approveReport: async function(id) {
    await DataStore.approveReport(id);
    this.showToast('Report approved & published to live registry!', 'success');
    this.loadAdminDashboard();
  },

  deleteAnimalRecord: async function(id) {
    if (confirm('Are you sure you want to delete this profile record?')) {
      await DataStore.deleteAnimal(id);
      this.showToast('Record deleted successfully.', 'success');
      this.loadAdminDashboard();
    }
  },

  // Security & Settings Update
  saveNewPin: function() {
    const newPin = document.getElementById('setting-pin').value.trim();
    if (newPin.length !== 4 || isNaN(newPin)) {
      this.showToast('Security PIN must be a 4-digit number', 'error');
      return;
    }
    DataStore.updatePin(newPin);
    this.showToast('Admin Security PIN updated successfully!', 'success');
    document.getElementById('setting-pin').value = '';
  },

  saveSupabaseConfig: function() {
    const url = document.getElementById('setting-supabase-url').value.trim();
    const key = document.getElementById('setting-supabase-key').value.trim();
    
    localStorage.setItem('awc_supabase_url', url);
    localStorage.setItem('awc_supabase_key', key);
    
    this.showToast('Supabase configuration saved!', 'success');
  },

  exportDataBackup: async function() {
    const data = await DataStore.fetchAllForAdmin();
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", jsonStr);
    dlAnchorElem.setAttribute("download", `awc_iit_ropar_backup_${Date.now()}.json`);
    dlAnchorElem.click();
    this.showToast('JSON backup file downloaded!', 'success');
  },

  resetDemoData: function() {
    if (confirm('Reset to initial IIT Ropar campus demo dataset?')) {
      localStorage.removeItem('awc_animals_data');
      DataStore.init();
      this.showToast('Demo data restored!', 'success');
      this.loadAdminDashboard();
    }
  },

  // Modal & Toast Helpers
  openModal: function(modalId) {
    document.getElementById(modalId).classList.add('active');
  },

  closeModal: function(modalId) {
    document.getElementById(modalId).classList.remove('active');
  },

  showToast: function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Theme Switcher
  setupTheme: function() {
    const savedTheme = localStorage.getItem('awc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme: function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('awc_theme', next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon: function(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }
};

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => app.init());
