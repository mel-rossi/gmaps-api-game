const API_Key = "API_KEY_HERE"; // Replace API_KEY_HERE with your own Google Maps API Key

// Dynamically inject the Google Maps script using the key
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_Key}&callback=initMap&loading=async`;
script.defer = true;
document.head.appendChild(script);

// Rename this file to config.js
// Do not change the name of the script reference inside the HTML 
// to config.template.js instead 
// config.js is inside .gitignore, which will prevent your API_KEY from being publically 
// available on GitHub if you push any code
