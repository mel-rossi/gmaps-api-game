// Global Variables 

let map; // Map
let guesses = 0; // Number of guesses
let question = 0; // Question number
let canClick = true; // Ability to Double Click
const TOLERANCE = 3000; // in meters
const mapObj = document.getElementById("map"); // Map Object
const logBox = document.getElementById("log-box"); // Log Box
const startBtn = document.getElementById("start-btn"); // Start Button
const gamePanel = document.getElementById("game-panel"); // Game Panel
const alertPanel = document.getElementById("alert-panel"); // Alert Panel
const introPanel = document.getElementById("intro-panel"); // Intro Panel
const resultsPanel = document.getElementById("results-panel"); // Results Panel

const LOCATIONS = [ // Locations
    { name: "Black House",                 grid: "B6", lat: 34.2436, lng: -118.5233 },
    { name: "Santa Susana Hall",           grid: "D2", lat: 34.2446, lng: -118.5298 },
    { name: "C.R. Johnson Auditorium",     grid: "D5", lat: 34.2417, lng: -118.5251 },
    { name: "Student Recreation Center",   grid: "G4", lat: 34.2381, lng: -118.5262 },
    { name: "Extended University Commons", grid: "B4", lat: 34.2440, lng: -118.5263 },
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
    // mapObj.removeAttribute("hidden"); // Open Map
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

// Demo Handle Click
function demoHandleClick(bool) {
     // Ignore clicks if not allowed
    if (!canClick) { 
        alertPanel.show();
        return;
    }

    const loc = LOCATIONS[question];

    // Feedback box inside current question block
    const currentBlock = document.getElementById(`question-${question}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");
    const currentNextBtn = currentBlock.querySelector(".next-btn");

    const entry = document.createElement("p");

    if (bool) { 
        entry.className = "feedback-correct";
        entry.innerHTML = `You guessed correctly! Great job.`;
        canClick = false;
        currentNextBtn.classList.add("highlight-btn")
    } else { 
        guesses++;
        if (guesses >= 3) {
            entry.className = "feedback-wrong";
            entry.innerHTML = `❌ Sorry, wrong location. Out of guesses.`;
            canClick = false;
            currentNextBtn.classList.add("highlight-btn");
        } else {
            entry.className = "feedback-wrong";
            entry.innerHTML = 
                `❌ Sorry, wrong location. ${3 - guesses} 
                guess${3 - guesses > 1 ? "es" : ""} remaining.`;
        }
    }

    currentFeedback.appendChild(entry);
}

// Double Click on Map (Come back when Demo Key limit resets)
function handleClick(clickedLatLng) { 
    const loc = LOCATIONS[question];
    const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

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

// Move to Next Question 
function nextQuestion() { 
    guesses = 0; // Reset Guesses
    this.disabled = true; // Disable clicked Next button 
    // Close any Alert Panels that are open
    if (alertPanel == open) {
        alertPanel.close(); 
    }

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

// End Game 
function endGame() { 
    gamePanel.setAttribute("hidden", ""); // Hide Game Panel
    resultsPanel.show(); // Open Results Panel
}

// Event Listeners 

// Start Button 
startBtn.addEventListener("click", startGame);

// Demo Double Click (while map is out of daily use) - Remove later 
mapObj.addEventListener("dblclick", function(e) {
    e.stopPropagation();
    demoHandleClick(true);
}); 

document.addEventListener("dblclick", function(e) { 
    if (e.target.id !== "map") { 
        demoHandleClick(false); 
    }
});