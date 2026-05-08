// Global Variables 

let map; // Map
let guesses = 0; // Number of guesses
let question = 0; // Question number
let squares = []; // Global — stores all drawn squares
let canClick = true; // Ability to Double Click
const mapObj = document.getElementById("map"); // Map Object
const logBox = document.getElementById("log-box"); // Log Box
const startBtn = document.getElementById("start-btn"); // Start Button
const gamePanel = document.getElementById("game-panel"); // Game Panel
const alertPanel = document.getElementById("alert-panel"); // Alert Panel
const introPanel = document.getElementById("intro-panel"); // Intro Panel
const resultsPanel = document.getElementById("results-panel"); // Results Panel


const LOCATIONS = [ // Locations
    { name: "Black House",                 lat: 34.24419, lng: -118.53349, radiusLat: 0.00015, radiusLng: 0.00015}, // 34.24423209839369, -118.53347399047601
    { name: "Santa Susana Hall",           lat: 34.23761, lng: -118.52929, radiusLat: 0.0003, radiusLng: 0.0002}, // 34.23761669967139, -118.52929639179706
    { name: "C.R. Johnson Auditorium",     lat: 34.24145, lng: -118.52893, radiusLat: 0.0002, radiusLng: 0.0003 }, // 34.24145410600543, -118.52893946524159
    { name: "Student Recreation Center",   lat: 34.23998, lng: -118.52493, radiusLat: 0.0007, radiusLng: 0.0003 }, // 34.24008973871634, -118.52493133092779
    { name: "Extended University Commons", lat: 34.24055, lng: -118.53271,  radiusLat: 0.00015, radiusLng: 0.0003 }, // 34.240701690440645, -118.5327172309279
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

    // Check if click is inside location bounds 
    
    const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(loc.lat - (loc.radiusLat + 0.0001), loc.lng - (loc.radiusLng + 0.0001)), // SW corner
        new google.maps.LatLng(loc.lat + (loc.radiusLat + 0.0001), loc.lng + (loc.radiusLng + 0.0001))  // NE corner
    );

    const withinBounds = bounds.contains(clickedLatLng);

    // Feedback box inside current question block
    const currentBlock = document.getElementById(`question-${question}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");
    const currentNextBtn = currentBlock.querySelector(".next-btn");

    const entry = document.createElement("p");

    // Correct Guess
    if (withinBounds) { 
        // Disable game interactions
        canClick = false; 

        // Feedback Entry Cretion for a Correct Guess
        entry.className = "feedback-correct";

        // Feedback Entry for Correct Guess
        entry.innerHTML = `You guessed correctly! Great job.`; 

        currentNextBtn.classList.add("highlight-btn") // Add Highlight to Next Button

        // Draw Green Selection Box
        drawSquare(correctLatLng, "#00ac85", loc.radiusLat, loc.radiusLng); 
    } else { // Wrong Guess 
        
        guesses++; // Increment Guesses 

        // Feedback Entry Creation for a Wrong Guess
        entry.className = "feedback-wrong";

        if (guesses >= 3) { // Out of guesses
            // Disable game interactions 
            canClick = false;

            // Feedback Entry for Last Wrong Guess
            entry.innerHTML = `❌ Sorry, wrong location. Out of guesses.`;

            currentNextBtn.classList.add("highlight-btn"); // Add Highlight to Next Button 

            // Draw Red Selection Box over correct location 
            drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 
        } else { // 1 or 2 guesses left 

            // Feedback Entry for Wrong Guess (not last)
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
    
    // Skip Remaining Guesses
    if (canClick) {
        const loc = LOCATIONS[question];
        const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

        const currentFeedback = currentBlock.querySelector(".feedback-box");
        
        const entry = document.createElement("p");

        // Feedback Entry Creation for Skipping Guesses
        entry.className = "feedback-skip"; 

        // Feedback Entry for Skipping Guesses 
        entry.innerHTML = `Remaining tries skipped. Question marked as wrong.`;

        currentFeedback.appendChild(entry);

        // Draw Red Selection Box over correct location 
        drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 
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