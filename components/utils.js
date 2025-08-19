// Utils object for 123 Fakturera
var Utils = {
  config: {
    ConfigURL: 'http://localhost:3000/api/v1/config',
    LanguageURL: 'http://localhost:3000/api/v1/locals'
  },

  // Simple fetch wrapper
  fetch: function(url) {
    return fetch(url);
  },

  // Show content by removing hidden class
  showContent: function() {
    var content = document.querySelector('.content');
    if (content) {
      content.classList.remove('hidden__display');
    }
  },

  // Set background image
  setBackground: function(imageUrl) {
    var backgroundImg = document.getElementById('background-image');
    if (backgroundImg && imageUrl) {
      backgroundImg.src = imageUrl;
    }
  },

  // Set metadata
  setMetaData: function(metadata) {
    if (metadata && metadata.title) {
      document.title = metadata.title;
    }
  },

  // Change language function
  changeLanguage: function(language, data, callback) {
    // Update language display
    var languageNames = document.querySelectorAll('.language-name, .flag-name');
    var flagIcons = document.querySelectorAll('.icon-flag-nav, .flag-icon, .drop-down-image');
    
    for (var i = 0; i < languageNames.length; i++) {
      languageNames[i].textContent = language.name;
    }
    
    for (var i = 0; i < flagIcons.length; i++) {
      if (!flagIcons[i].parentElement.classList.contains('drop-down-image-div')) {
        flagIcons[i].src = language.flag_url || language.icon;
        flagIcons[i].alt = language.name;
      }
    }
    
    // Close dropdowns
    var dropdowns = document.querySelectorAll('.dropdownList');
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].style.display = 'none';
    }
    
    // Call the callback to load language-specific content
    if (callback) {
      callback(language, data);
    }
  },

  // Cookie functions
  setCookie: function(name, value, options) {
    options = options || {};
    var cookieString = name + '=' + value;
    
    if (options.path) {
      cookieString += '; path=' + options.path;
    }
    
    document.cookie = cookieString;
  },

  getCookie: function(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  },

  // Scroll to top
  scrollToTop: function() {
    window.scrollTo(0, 0);
  },

  // Format number function
  formatNumber: function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

// Export for ES modules
window.Utils = Utils;