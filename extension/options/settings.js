document.addEventListener('DOMContentLoaded', () => {
  const defaultSettings = {
    protectionLevel: 'balanced',
    whitelistedDomains: ['example.com'],
    disabledCategories: []
  };

  const categories = [
    { id: 'data_privacy', name: '🔒 Data Selling & Sharing' },
    { id: 'arbitration', name: '⚖️ Mandatory Arbitration' },
    { id: 'unilateral_changes', name: '📝 Unilateral Term Changes' },
    { id: 'auto_renewal', name: '🔄 Auto-Renewal Billing' },
    { id: 'ip_ownership', name: '💡 IP & Content License' },
    { id: 'ai_training', name: '🤖 AI Model Training' },
    { id: 'biometric_tracking', name: '👁️ Biometric Data' },
    { id: 'location_tracking', name: '📍 Location Tracking' },
    { id: 'liability_cap', name: '🛡️ No Breach Liability' },
    { id: 'account_deletion', name: '❌ Immediate Termination' },
    { id: 'marketing_spam', name: '📧 Marketing & Tracking' },
    { id: 'jurisdiction', name: '🏛️ Foreign Jurisdiction' }
  ];

  const categoryGrid = document.getElementById('categoryGrid');
  const whitelistTags = document.getElementById('whitelistTags');
  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const saveToast = document.getElementById('saveToast');

  let currentSettings = { ...defaultSettings };

  // Load initial settings from chrome.storage or localStorage
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['tc_settings'], (result) => {
        if (result.tc_settings) {
          currentSettings = { ...defaultSettings, ...result.tc_settings };
        }
        renderUI();
      });
    } else {
      const stored = localStorage.getItem('tc_settings');
      if (stored) {
        currentSettings = { ...defaultSettings, ...JSON.parse(stored) };
      }
      renderUI();
    }
  }

  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ tc_settings: currentSettings }, () => {
        showToast();
      });
    } else {
      localStorage.setItem('tc_settings', JSON.stringify(currentSettings));
      showToast();
    }
  }

  function showToast() {
    saveToast.classList.remove('hidden');
    setTimeout(() => {
      saveToast.classList.add('hidden');
    }, 2000);
  }

  function renderUI() {
    // Protection level radio buttons
    const radios = document.querySelectorAll('input[name="protectionLevel"]');
    radios.forEach(radio => {
      radio.checked = radio.value === currentSettings.protectionLevel;
      radio.parentElement.classList.toggle('selected', radio.checked);
    });

    // Render Categories
    categoryGrid.innerHTML = '';
    categories.forEach(cat => {
      const isChecked = !currentSettings.disabledCategories.includes(cat.id);
      const item = document.createElement('label');
      item.className = 'category-item';
      item.innerHTML = `
        <input type="checkbox" data-cat="${cat.id}" ${isChecked ? 'checked' : ''}>
        <span>${cat.name}</span>
      `;
      categoryGrid.appendChild(item);
    });

    // Render Whitelist
    whitelistTags.innerHTML = '';
    currentSettings.whitelistedDomains.forEach(domain => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `
        <span>${domain}</span>
        <span class="tag-remove" data-domain="${domain}">✕</span>
      `;
      whitelistTags.appendChild(tag);
    });
  }

  // Event Listeners
  document.querySelectorAll('input[name="protectionLevel"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentSettings.protectionLevel = e.target.value;
      saveSettings();
      renderUI();
    });
  });

  categoryGrid.addEventListener('change', (e) => {
    if (e.target.dataset.cat) {
      const catId = e.target.dataset.cat;
      if (e.target.checked) {
        currentSettings.disabledCategories = currentSettings.disabledCategories.filter(c => c !== catId);
      } else {
        if (!currentSettings.disabledCategories.includes(catId)) {
          currentSettings.disabledCategories.push(catId);
        }
      }
      saveSettings();
    }
  });

  addWhitelistBtn.addEventListener('click', () => {
    const domain = whitelistInput.value.trim().toLowerCase();
    if (domain && !currentSettings.whitelistedDomains.includes(domain)) {
      currentSettings.whitelistedDomains.push(domain);
      whitelistInput.value = '';
      saveSettings();
      renderUI();
    }
  });

  whitelistTags.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-remove')) {
      const domain = e.target.dataset.domain;
      currentSettings.whitelistedDomains = currentSettings.whitelistedDomains.filter(d => d !== domain);
      saveSettings();
      renderUI();
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ tc_scan_history: [] }, () => {
        alert('Local scan logs cleared successfully.');
      });
    } else {
      localStorage.removeItem('tc_scan_history');
      alert('Local scan logs cleared successfully.');
    }
  });

  resetDefaultsBtn.addEventListener('click', () => {
    currentSettings = { ...defaultSettings };
    saveSettings();
    renderUI();
  });

  loadSettings();
});
