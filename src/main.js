// Configuration
var API_BASE_URL = "http://localhost:3000/api/v1";

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Terms page initializing...");

  // FIRST: Show content immediately so user sees something
  Utils.showContent();

  // Set up background image
  setupBackgroundImage();

  // Show default content immediately
  showDefaultContent();

  // Setup event listeners
  setupEventListeners();

  // Then try to load from API (this can fail gracefully)
  loadConfigurationAndContent();
});

// Show default content immediately
function showDefaultContent() {
  // Set default navigation
  populateNavigationFallback();

  // Set default language options
  populateLanguagesFallback();

  // Set default terms content
  loadTermsContentFallback("se");

  console.log("Default content loaded");
}

// Setup background image
function setupBackgroundImage() {
  var backgroundImg = document.getElementById("background-image");
  backgroundImg.src =
    "https://storage.123fakturera.se/public/wallpapers/sverige43.jpg";
}

// Setup event listeners
function setupEventListeners() {
  // Mobile menu toggle
  var mobileMenuButton = document.querySelector(".open-menu-dds");
  var mobileMenu = document.querySelector(".menu-drop-down");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      var currentHeight = mobileMenu.style.height;
      mobileMenu.style.height = currentHeight === "325px" ? "0" : "325px";
    });
  }

  // Language dropdown toggle
  var langDropContainer = document.querySelector(".lang-drop-container");
  if (langDropContainer) {
    langDropContainer.addEventListener("click", function (e) {
      e.stopPropagation();
      var dropdown = document.querySelector(".dropdownList");
      if (dropdown) {
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    var dropdowns = document.querySelectorAll(".dropdownList");
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].style.display = "none";
    }
  });
}

// Load configuration and content from API (optional)
function loadConfigurationAndContent() {
  // This is optional - if it fails, we already have default content showing
  fetch(API_BASE_URL + "/config")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Config API error: " + response.status);
      }
      return response.json();
    })
    .then(function (config) {
      console.log("Configuration loaded from API:", config);

      // Update navigation with API data
      // New API returns navigation grouped by language, use Swedish by default
      if (config.navigation && config.navigation.se) {
        populateNavigation(config.navigation.se);
      }

      // Update languages with API data
      if (config.languages) {
        populateLanguages(config.languages);
      }

      // Load Swedish terms content from API
      loadTermsContent("se");
    })
    .catch(function (error) {
      console.log("API not available, using default content:", error);
      // Default content is already showing, so this is fine
    });
}

// Populate navigation menu
function populateNavigation(navItems) {
  var mobileContainer = document.querySelector(".menu-drop-down-container");
  var desktopContainer = document.querySelector(".pc-menu");

  // Clear existing content
  if (mobileContainer) mobileContainer.innerHTML = "";
  if (desktopContainer) desktopContainer.innerHTML = "";

  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];

    // Mobile menu item
    if (mobileContainer) {
      var mobileItem = document.createElement("a");
      mobileItem.href = item.url;
      mobileItem.className = "menu-drop-down-item";
      mobileItem.innerHTML =
        '<span class="collectionSpan"><p class="menu-item-name">' +
        item.title +
        "</p></span>";
      mobileContainer.appendChild(mobileItem);
    }

    // Desktop menu item
    if (desktopContainer) {
      var desktopItem = document.createElement("a");
      desktopItem.href = item.url;
      desktopItem.className = "pc-menu-items";
      desktopItem.innerHTML = "<span>" + item.title + "</span>";
      desktopContainer.appendChild(desktopItem);
    }
  }
}

// Populate language selector

var currentLanguageCode = 'se'; // Default to Swedish

function populateLanguages(languages) {
  var languageContainer = document.querySelector(".dropdownList");
  var langDropContainer = document.querySelector(".lang-drop-container");
  if (!languageContainer || !languages.length) return;

  // Find the current language object
  var currentLang = languages.find(l => l.code === currentLanguageCode) || languages[0];

  // Update the main language display - but preserve the dropdownList
  if (langDropContainer) {
    langDropContainer.innerHTML =
      '<div class="language-pc-menu-items">' +
      '<div class="language-title-box">' +
      '<span class="language-name">' +
      currentLang.name +
      "</span>" +
      '<img src="' +
      currentLang.flag_url +
      '" class="flag-icon" alt="' +
      currentLang.name +
      '" />' +
      "</div>" +
      "</div>" +
      '<div class="dropdownList"></div>';
      
    // Get the new dropdown container
    languageContainer = document.querySelector(".dropdownList");
  }

  // Clear dropdown
  languageContainer.innerHTML = "";

  // Create dropdown options
  for (var i = 0; i < languages.length; i++) {
    var lang = languages[i];
    var langItem = document.createElement("div");
    langItem.className = "language-item drop-down-element";
    langItem.setAttribute("data-language", lang.code);
    langItem.innerHTML =
      '<div class="drop-down-lang-name">' +
      lang.name +
      "</div>" +
      '<div class="drop-down-image-div">' +
      '<img src="' +
      lang.flag_url +
      '" class="drop-down-image" alt="' +
      lang.name +
      '" />' +
      "</div>";

    // Add click listener
    langItem.addEventListener("click", (function(language) {
      return function() {
        currentLanguageCode = language.code;
        // Update the main display
        var titleBox = document.querySelector(".language-title-box");
        if (titleBox) {
          titleBox.innerHTML =
            '<span class="language-name">' +
            language.name +
            "</span>" +
            '<img src="' +
            language.flag_url +
            '" class="flag-icon" alt="' +
            language.name +
            '" />';
        }
        // Load terms for selected language
        loadTermsContent(language.code);
        // Update navigation for selected language (fallback only)
        populateNavigationFallback();
        // Close dropdown
        var dropdown = document.querySelector('.dropdownList');
        if (dropdown) dropdown.style.display = 'none';
      };
    })(lang));

    languageContainer.appendChild(langItem);
  }
}

// Load terms content for specific language
function loadTermsContent(languageCode) {
  var termsContainer = document.getElementById("terms-paragraphs");
  var termsHeading = document.querySelector(".terms-heading");
  var backButtons = document.querySelectorAll(".go-back-button");

  if (!termsContainer) return;

  // Show loading message
  termsContainer.innerHTML =
    '<p class="loading-message">Loading terms content...</p>';

  // Fetch terms content
  fetch(API_BASE_URL + "/locals/terms/" + languageCode)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Terms API error: " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      console.log("Terms content loaded:", data);

      // Update heading
      if (termsHeading && data.heading) {
        termsHeading.textContent = data.heading;
      }

      // Update back button text
      if (backButtons && data.close_button_text) {
        for (var i = 0; i < backButtons.length; i++) {
          backButtons[i].textContent = data.close_button_text;
        }
      }

      // Generate and display terms content
      var termsHTML = generateTermsHTML(data);
      termsContainer.innerHTML = termsHTML;
    })
    .catch(function (error) {
      console.log("Failed to load terms from API, using fallback:", error);
      loadTermsContentFallback(languageCode);
    });
}

// Generate HTML from terms data
function generateTermsHTML(data) {
  var html = "";

  // Loop through all terms text fields
  for (var i = 1; i <= 24; i++) {
    var fieldName = "terms_text_" + i;
    var seFieldName = "terms_text_" + i + "_se";

    // Use SE-specific field if it exists, otherwise use regular field
    var text = data[seFieldName] || data[fieldName];

    if (text) {
      html += '<p class="terms-paragraph">' + text + "</p>";
    }
  }

  return html || '<p class="terms-paragraph">No terms content available.</p>';
}

// Switch language
function switchLanguage(languageCode) {
  console.log("Switching to language:", languageCode);
  loadTermsContent(languageCode);

  // Close dropdown
  var dropdown = document.querySelector(".dropdownList");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}

// Fallback functions - these work without API
function populateNavigationFallback() {
  var navItemsByLang = {
    se: [
      { title: "Hem", url: "/" },
      { title: "Beställ", url: "/pricing" },
      { title: "Våra Kunder", url: "/features" },
      { title: "Om oss", url: "/support" },
      { title: "Kontakta oss", url: "/login" },
    ],
    en: [
      { title: "Home", url: "/" },
      { title: "Order", url: "/" },
      { title: "Our Customers", url: "/" },
      { title: "About Us", url: "/" },
      { title: "Contact Us", url: "/" },
    ]
  };
  var items = navItemsByLang[currentLanguageCode] || navItemsByLang.se;
  populateNavigation(items);
}

function populateLanguagesFallback() {
  var defaultLanguages = [
    {
      code: "se",
      name: "Svenska",
      flag_url: "https://storage.123fakturere.no/public/flags/SE.png",
    },
    {
      code: "en",
      name: "English",
      flag_url: "https://storage.123fakturere.no/public/flags/GB.png",
    },
  ];

  populateLanguages(defaultLanguages);
}

function loadTermsContentFallback(languageCode) {
  var termsContainer = document.getElementById("terms-paragraphs");
  var termsHeading = document.querySelector(".terms-heading");
  var backButtons = document.querySelectorAll(".go-back-button");

  var fallbackContent = {
    se: {
      heading: "Villkor",
      closeButton: "Stäng och gå tillbaka",
      content:
        "Här hittar ni våra villkor för 123 Fakturera. Vi arbetar för att ge er den bästa faktureringslösningen på marknaden.",
    },
    en: {
      heading: "Terms",
      closeButton: "Close",
      content:
        "Here you can find our terms of service for 123 Fakturera. We work to provide you with the best invoicing solution on the market.",
    },
  };

  var content = fallbackContent[languageCode] || fallbackContent.se;

  if (termsHeading) termsHeading.textContent = content.heading;
  if (backButtons) {
    for (var i = 0; i < backButtons.length; i++) {
      backButtons[i].textContent = content.closeButton;
    }
  }
  if (termsContainer) {
    termsContainer.innerHTML =
      '<p class="terms-paragraph">' + content.content + "</p>";
  }
}
