// Global Variables 

let map; // Map
let question = 0; // Question number
const TOLERANCE = 60; // in meters

const LOCATIONS = [ // Locations
    { name: "Black House",                 grid: "B6", lat: 34.2436, lng: -118.5233 },
    { name: "Santa Susana Hall",           grid: "D2", lat: 34.2446, lng: -118.5298 },
    { name: "C.R. Johnson Auditorium",     grid: "D5", lat: 34.2417, lng: -118.5251 },
    { name: "Student Recreation Center",   grid: "G4", lat: 34.2381, lng: -118.5262 },
    { name: "Extended University Commons", grid: "B4", lat: 34.2440, lng: -118.5263 },
];

// Map Initialization 
function initMap() { 
    map = new google.maps.Map(document.getElementById("map"), { 
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

    // Double Click Event
    map.addListener("dblclick", function(e) { 
        handleClick(e.latLng);
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

// Double Click on Map
function handleClick(clickedLatLng) { 
    const loc = LOCATIONS[question];
    const correctLatLng = new google.maps.latLng(loc.lat, loc.lng);

    // Calculate distance between click and correct location 
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        clickedLatLng,
        correctLatLng
    );

    if (distance <= TOLERANCE) { 
        console.log("Correct!");
    } else { 
        console.log("Wrong!");
    }
}

// Event Listeners 

// Start Button 
document.getElementById("start-btn").addEventListener("click", startGame);

