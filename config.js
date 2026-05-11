const API_Key = "AIzaSyB0do6rquOuP2PiV0N60Ch-faUtk4pzzUw";

// Dynamically inject the Google Maps script using the key
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_Key}&libraries=geometry&callback=initMap&loading=async`;
script.defer = true;
document.head.appendChild(script);