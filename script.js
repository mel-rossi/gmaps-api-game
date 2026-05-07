// Global Variables 
const LOCATIONS = [ // Locations
    { name: "Black House", grid: "B6" },
    { name: "Santa Susana Hall", grid: "D2" },
    { name: "C.R. Johnson Auditorium", grid: "D5" }, 
    { name: "Student Recreation Center", grid: "G4" },
    { name: "Extended University Commons", grid: "B4" },
];

let question = 0; // Question number

// Map Initialization 
function initMap() { 
    const map = new google.maps.Map(document.getElementById("map"), { 
        center: { lat: 34.2405, lng: -118.5278 }, // CSUN Campus 
        zoom: 17, 
        mapTypeId: "roadmap",

        // Panning & zooming off
        draggable: false, 
        scrollwheel: false,
        gestureHandling: "none", 
        keyboardShortcuts: false,
        disableDoubleClickZoom: true, 
        
        // Hide controls 
        panControl: false,
        zoomControl: false, 
        scaleControl: false,
        rotateControl: false, 
        mapTypeControl: false, 
        disableDefaultUI: true,
        streetViewControl: false, 
        fullscreenControl: false, 

        // Hide Labels & Icons 
        styles: [
            { // Hide Labels
                featureType: "all",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            },
            { // Hide icons 
                featureType: "poi",
                stylers: [{ visibility: "off" }]
            }
        ]
    });
}

// Start Playing
function startGame() { 
    document.getElementById("intro-panel").close(); // Close Intro Panel
    document.getElementById("map").removeAttribute("hidden"); // Open Map
    document.getElementById("game-panel").removeAttribute("hidden"); // Open Game Panel

    loadQuestion(question) // Load first question 
}

// Load question 
function loadQuestion(i) { 
    const loc = LOCATIONS[i]; 
    document.getElementById("building-name").innerHTML = loc.name;
}

// Event Listeners 

// Start Button 
document.getElementById("start-btn").addEventListener("click", startGame);

