
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
}

// Event Listeners 

// Start Button 
document.getElementById("start-btn").addEventListener("click", startGame);


// Locations : 
// CSUN Santa Susana Hall—D2
// CSUN C.R. Johnson Auditorium—D5
// CSUN Student Recreation Center—G4
// CSUN Black House—B6
// CSUN Extended University Commons—B4