// Global Variables 

let map; // Map
let guesses = 0; // Number of guesses
let question = 0; // Question number
let squares = []; // Global — stores all drawn squares
let canClick = true; // Ability to Double Click
const TOLERANCE = 50; // in meters
const mapObj = document.getElementById("map"); // Map Object
const logBox = document.getElementById("log-box"); // Log Box
const startBtn = document.getElementById("start-btn"); // Start Button
const gamePanel = document.getElementById("game-panel"); // Game Panel
const alertPanel = document.getElementById("alert-panel"); // Alert Panel
const introPanel = document.getElementById("intro-panel"); // Intro Panel
const resultsPanel = document.getElementById("results-panel"); // Results Panel


const LOCATIONS = [ // Locations
    { name: "Black House",                 lat: 34.2443, lng: -118.5335, radiusLat: 0.0002, radiusLng: 0.0003}, // 34.24429530144279, -118.53346905919547
    { name: "Santa Susana Hall",           lat: 34.2378, lng: -118.5292, radiusLat: 0.0002, radiusLng: 0.0003}, // 34.237764496321304, -118.52925278675212
    { name: "C.R. Johnson Auditorium",     lat: 34.2416, lng: -118.5289, radiusLat: 0.0002, radiusLng: 0.0003 }, // 34.24162099634369, -118.52890118675215
    { name: "Student Recreation Center",   lat: 34.2399, lng: -118.5249, radiusLat: 0.0002, radiusLng: 0.0003 }, // 34.2399535646986, -118.52492078888514
    { name: "Extended University Commons", lat: 34.2407, lng: -118.532,  radiusLat: 0.0002, radiusLng: 0.0003 }, // 34.24068388239442, -118.53267432657252
];

// Map Initialization 
function initMap() { 
    map = new google.maps.Map(mapObj, { 
        center: { lat: 34.239294, lng: -118.529317 }, // CSUN Campus
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
        ],
    });

    // Double Click Event
    map.addListener("dblclick", function(e) { 
        handleClick(e.latLng);
    });
}

// Start Playing
function startGame() { 
    introPanel.close(); // Close Intro Panel
    mapObj.removeAttribute("hidden"); // Open Map
    gamePanel.removeAttribute("hidden"); // Open Game Panel

    loadQuestion(question) // Load first question 
}

// Load question 
function loadQuestion(i) { 
    const loc = LOCATIONS[i]; 

    // Question Block 
    const block = document.createElement("div");
    block.className = "panel prompt-box";
    block.id = `question-${i}`;
    block.innerHTML = `
        <!-- Question Prompt -->
        <h3>Where is <span class="bld-name">${loc.name}</span> ?</h2>

        <!-- Live Feedback & Progress -->
        <div class="feedback-box">
        </div>

        <!-- Next Button --> 
        <button class="next-btn", id="${i}-next-btn">Next</button>
    `;
    
    // Append Question block to log box 
    logBox.appendChild(block); 

    // Disable Next Button on all questions 
    const allNextBtns = document.querySelectorAll(".next-btn"); 
    allNextBtns.forEach(btn => btn.disabled = true); 

    // Enable Next Button on latest question 
    block.querySelector(".next-btn").disabled = false; 
    block.querySelector(".next-btn").addEventListener("click", nextQuestion);

    // Scroll to latest question 
    block.scrollIntoView({ behavior: "smooth" });
}

// Double Click on Map (Come back when Demo Key limit resets)
function handleClick(clickedLatLng) { 
    // Ignore if clicks are not allowed
    if (!canClick) { 
        alertPanel.show(); 
        return; 
    }

    const loc = LOCATIONS[question];
    const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

    // Calculate distance between click and correct location 
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        clickedLatLng,
        correctLatLng
    );

    // Feedback box inside current question block
    const currentBlock = document.getElementById(`question-${question}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");
    const currentNextBtn = currentBlock.querySelector(".next-btn");

    const entry = document.createElement("p");

    // Correct Guess
    if (distance <= TOLERANCE) { 
        // Disable game interactions
        canClick = false; 

        entry.className = "feedback-correct";
        entry.innerHTML = `You guessed correctly! Great job.`;
        currentNextBtn.classList.add("highlight-btn") // Add Highlight to Next Button
        drawSquare(correctLatLng, "#00ac85", loc.radiusLat, loc.radiusLng);
    } else { // Wrong Guess 
        
        guesses++; // Increment Guesses 

        entry.className = "feedback-wrong";

        // All guesses wrong 
        if (guesses >= 3) {
            // Disable game interactions 
            canClick = false;

            entry.innerHTML = `❌ Sorry, wrong location. Out of guesses.`;
            currentNextBtn.classList.add("highlight-btn"); // Add Highlight to Next Button 
            drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng);
        } else { // 1st or 2nd guess wrong 
            entry.innerHTML = 
                `❌ Sorry, wrong location. ${3 - guesses} 
                guess${3 - guesses > 1 ? "es" : ""} remaining.`;
        }
    }

    currentFeedback.appendChild(entry);
}

// Move to Next Question 
function nextQuestion() { 
    guesses = 0; // Reset Guesses
    this.disabled = true; // Disable clicked Next button 
    alertPanel.close(); // Close any Alert Panels that are open

    // Current Question Block
    const currentBlock = document.getElementById(`question-${question}`);

    // Remove Highlight from current next button   
    const currentNextBtn = currentBlock.querySelector(".next-btn");
    currentNextBtn.classList.remove("highlight-btn")
    
    // Skipped remaing tries
    if (canClick) {
        const currentFeedback = currentBlock.querySelector(".feedback-box");
        
        const entry = document.createElement("p");
        entry.className = "feedback-wrong"; 
        entry.innerHTML = `Remaining tries skipped. Question marked as wrong.`;
        currentFeedback.appendChild(entry);
    } else { 
        canClick = true; // Re-enable clicks
    }

    question++; 

    // If all questions have been answered End the Game
    if (question >= LOCATIONS.length) { 
        endGame();
    } else { // Else move to the next question
        loadQuestion(question);
    }
}

// Final Selection Box (Correct Location)
function drawSquare(center, color, radiusLat, radiusLng) {
    const square = new google.maps.Rectangle({
        map: map,
        bounds: {
            north: center.lat() + radiusLat,
            south: center.lat() - radiusLat,
            east:  center.lng() + radiusLng,
            west:  center.lng() - radiusLng,
        },
        strokeColor: color,
        fillColor: color,
        strokeWeight: 2,
        fillOpacity: 0.3,
    });
    squares.push(square);
}

// End Game 
function endGame() { 
    gamePanel.setAttribute("hidden", ""); // Hide Game Panel
    resultsPanel.show(); // Open Results Panel
}

// Restart the Game 
function restartGame() { 
    clearSquares();
}

// Clear Selection Boxes
function clearSquares() { 
    squares.forEach(s => s.setMap(null));
    squares = [];
}

// Event Listeners 

// Start Button 
startBtn.addEventListener("click", startGame);