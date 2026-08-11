/* ==========================================================================
   AWC IIT ROPAR — Supabase Configuration & Data Service Layer
   Supports direct Supabase Cloud Sync with fallback to Local Data Store
   ========================================================================== */

const SUPABASE_CONFIG = {
  // Replace these with your Supabase project credentials from https://supabase.com
  url: localStorage.getItem('awc_supabase_url') || '',
  anonKey: localStorage.getItem('awc_supabase_key') || ''
};

let supabaseClient = null;

// Initialize Supabase if credentials exist and CDN script is loaded
function initSupabase() {
  if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('⚡ Connected to Supabase Cloud Database');
      return true;
    } catch (e) {
      console.warn('⚠️ Supabase init error, using local fallback store', e);
    }
  }
  return false;
}

// Initial Sample Data for Campus Animals & Birds at IIT Ropar
const INITIAL_DEMO_DATA = [
  {
    id: 'dog-1',
    type: 'dog',
    name: 'Sheru',
    photo_url: 'images/dog-card.jpg',
    approx_age: '3.5 Years',
    permanent_location: 'Near Main Gate & Security Post',
    avg_behavior: 'Friendly & Welcoming to all students',
    vaccination_status: 'Vaccinated (Up-to-date)',
    sterilization_status: 'Sterilized',
    speciality: 'Greets students arriving at campus & loves treats!',
    species: 'Indian Pariah Dog',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dog-2',
    type: 'dog',
    name: 'Bruno',
    photo_url: 'images/dog-card.jpg',
    approx_age: '2 Years',
    permanent_location: 'Behind Utility Block & Dining Hall',
    avg_behavior: 'Gentle, Playful & Quiet',
    vaccination_status: 'Vaccinated (Up-to-date)',
    sterilization_status: 'Sterilized',
    speciality: 'Accompanies students during night walks',
    species: 'Mix Breed',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-1',
    type: 'cat',
    name: 'Luna',
    photo_url: 'images/cat-card.jpg',
    approx_age: '1.5 Years',
    permanent_location: 'Library Lawn & Senate Quadrangle',
    avg_behavior: 'Curious, Calm & Loves napping in sun',
    vaccination_status: 'Vaccinated (Up-to-date)',
    sterilization_status: 'Sterilized',
    speciality: 'Enjoys resting near quiet reading areas',
    species: 'Domestic Shorthair Cat',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'bird-1',
    type: 'bird',
    name: 'Indian Peafowl (Mayura)',
    photo_url: 'images/bird-card.jpg',
    approx_age: 'Campus Wild Bird',
    permanent_location: 'Central Lawn & Herbal Garden',
    avg_behavior: 'Majestic & Peaceful',
    vaccination_status: 'Wild Campus Species',
    sterilization_status: 'N/A (Wild Bird)',
    speciality: 'Beautiful courtship dances during monsoon season',
    species: 'Indian Peafowl (Pavo cristatus)',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'bird-2',
    type: 'bird',
    name: 'Rose-ringed Parakeet',
    photo_url: 'images/bird-card.jpg',
    approx_age: 'Campus Wild Bird',
    permanent_location: 'Old Neem & Banyan Trees near Hostels',
    avg_behavior: 'Active & Social Chatterbox',
    vaccination_status: 'Wild Campus Species',
    sterilization_status: 'N/A (Wild Bird)',
    speciality: 'Flocks in colorful groups near canopy trees',
    species: 'Psittacula krameri',
    is_approved: true,
    created_at: new Date().toISOString()
  }
];

// Data Store Abstraction
const DataStore = {
  // Initialize local store if empty
  init: function() {
    if (!localStorage.getItem('awc_animals_data')) {
      localStorage.setItem('awc_animals_data', JSON.stringify(INITIAL_DEMO_DATA));
    }
    if (!localStorage.getItem('awc_admin_pin')) {
      localStorage.setItem('awc_admin_pin', '1234'); // Default PIN, admin can update!
    }
  },

  // Fetch approved animals by type ('dog', 'cat', 'bird')
  fetchAnimals: async function(type) {
    initSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('animals')
          .select('*')
          .eq('type', type)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local storage', e);
      }
    }

    // Local Storage Fallback
    const local = JSON.parse(localStorage.getItem('awc_animals_data') || '[]');
    return local.filter(item => item.type === type && item.is_approved === true);
  },

  // Fetch all items (Admin view)
  fetchAllForAdmin: async function() {
    initSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('animals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase admin fetch error', e);
      }
    }
    return JSON.parse(localStorage.getItem('awc_animals_data') || '[]');
  },

  // Submit new animal/bird report
  submitReport: async function(animalObj) {
    animalObj.id = 'report-' + Date.now();
    animalObj.is_approved = false; // Requires Admin approval
    animalObj.created_at = new Date().toISOString();

    initSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('animals')
          .insert([animalObj]);
        if (!error) return { success: true, message: 'Report submitted for review!' };
      } catch (e) {
        console.warn('Supabase submit report error', e);
      }
    }

    // Fallback Local Storage
    const local = JSON.parse(localStorage.getItem('awc_animals_data') || '[]');
    local.push(animalObj);
    localStorage.setItem('awc_animals_data', JSON.stringify(local));
    return { success: true, message: 'Report submitted successfully for Admin review!' };
  },

  // Add or Update animal (Admin)
  saveAnimal: async function(animalObj) {
    initSupabase();
    if (supabaseClient) {
      try {
        if (animalObj.id && !animalObj.id.startsWith('new-')) {
          const { error } = await supabaseClient
            .from('animals')
            .update(animalObj)
            .eq('id', animalObj.id);
          if (!error) return true;
        } else {
          animalObj.id = 'anim-' + Date.now();
          const { error } = await supabaseClient
            .from('animals')
            .insert([animalObj]);
          if (!error) return true;
        }
      } catch (e) {
        console.warn('Supabase save animal error', e);
      }
    }

    // Local Storage Fallback
    const local = JSON.parse(localStorage.getItem('awc_animals_data') || '[]');
    if (animalObj.id) {
      const idx = local.findIndex(i => i.id === animalObj.id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...animalObj };
      } else {
        animalObj.id = animalObj.id || 'anim-' + Date.now();
        local.push(animalObj);
      }
    } else {
      animalObj.id = 'anim-' + Date.now();
      local.push(animalObj);
    }
    localStorage.setItem('awc_animals_data', JSON.stringify(local));
    return true;
  },

  // Approve animal report (Admin)
  approveReport: async function(id) {
    return this.saveAnimal({ id, is_approved: true });
  },

  // Delete animal (Admin)
  deleteAnimal: async function(id) {
    initSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('animals')
          .delete()
          .eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase delete error', e);
      }
    }

    let local = JSON.parse(localStorage.getItem('awc_animals_data') || '[]');
    local = local.filter(item => item.id !== id);
    localStorage.setItem('awc_animals_data', JSON.stringify(local));
    return true;
  },

  // Verify Admin Security PIN
  verifyPin: function(enteredPin) {
    const storedPin = localStorage.getItem('awc_admin_pin') || '1234';
    return enteredPin === storedPin;
  },

  // Update Admin Security PIN
  updatePin: function(newPin) {
    localStorage.setItem('awc_admin_pin', newPin);
    return true;
  }
};

// Initialize Store
DataStore.init();
