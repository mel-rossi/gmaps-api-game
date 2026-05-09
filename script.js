// Global Variables 

let map; // Map
let score = 0; // Number of correct answers
let guesses = 0; // Number of guesses
let question = 0; // Question number
let squares = []; // Global — stores all drawn squares
const mapObj = document.getElementById("map"); // Map Object
const logBox = document.getElementById("log-box"); // Log Box
const startBtn = document.getElementById("start-btn"); // Start Button
const gamePanel = document.getElementById("game-panel"); // Game Panel
const introPanel = document.getElementById("intro-panel"); // Intro Panel
const restartBtn = document.getElementById("restart-btn"); // Restart Button
const resultsPanel = document.getElementById("results-panel"); // Results Panel
const scoreDisplay = document.getElementById("score-display"); // Live Score Display 
const timerDisplay = document.getElementById("timer-display"); // Live Timer Display 
const questionDisplay = document.getElementById("question-display"); // Live Question Display 


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
    
    startTimer(); // Start Timer 

    loadQuestion(question) // Load first question 
}

// Start the Live Timer 
function startTimer() { 
    startTime = Date.now(); 
    runTimer();
}

// Run the Live Timer
function runTimer() { 
    timerInterval = setInterval(() => { 
        time = Date.now() - startTime; 
        timerDisplay.innerHTML = formatTime(time);
    }, 1000); 
}

// Stop the Live Timer 
function stopTimer() { 
    clearInterval(timerInterval); 
    timerInterval = null; 
    testRunning = false;

    return time; 
}

function formatTime(ms) { 
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60); 
    const s = totalSeconds % 60; 
    return `${m}:${String(s).padStart(2, "0")}`;
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
        <button class="next-btn", id="${i}-next-btn">Skip</button>
    `;
    
    logBox.appendChild(block); // Append Question block to log box 
    updateStats(); // Update live stats 

    // Disable Next Button on all questions 
    const allNextBtns = document.querySelectorAll(".next-btn"); 
    allNextBtns.forEach(btn => btn.disabled = true); 

    // Enable Next Button on latest question 
    block.querySelector(".next-btn").disabled = false; 
    block.querySelector(".next-btn").addEventListener("click", function() { 
        nextQuestion.call(this, true);
    });

    // Scroll to latest question 
    block.scrollIntoView({ behavior: "smooth" });
}

// Double Click on Map (Come back when Demo Key limit resets)
function handleClick(clickedLatLng) { 

    const loc = LOCATIONS[question];
    const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

    // Check if click is inside location bounds 

    const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(
            loc.lat - loc.radiusLat - 0.0001, loc.lng - loc.radiusLng - 0.0001
        ), // SW corner
        new google.maps.LatLng(
            loc.lat + (loc.radiusLat + 0.0001), loc.lng + (loc.radiusLng + 0.0001)
        )  // NE corner
    );

    const withinBounds = bounds.contains(clickedLatLng);

    // Feedback box inside current question block
    const currentBlock = document.getElementById(`question-${question}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");
    const currentNextBtn = currentBlock.querySelector(".next-btn");

    const entry = document.createElement("p");

    // Correct Guess
    if (withinBounds) { 

        score++; // Increment score 
        updateStats(); // Update live stats

        // Feedback Entry Creation for a Correct Guess
        entry.className = "feedback-correct";

        // Feedback Entry for Correct Guess
        entry.innerHTML = `You guessed correctly! Great job.`; 

        // Draw Green Selection Box
        drawSquare(correctLatLng, "#00ac85", loc.radiusLat, loc.radiusLng); 

        // Advance to next question 
        nextQuestion.call(currentNextBtn); 
    } else { // Wrong Guess 
        
        guesses++; // Increment Guesses 

        tempSquare(clickedLatLng, loc.radiusLat, loc.radiusLng);

        // Feedback Entry Creation for a Wrong Guess
        entry.className = "feedback-wrong";

        if (guesses >= 3) { // Out of guesses

            // Feedback Entry for Last Wrong Guess
            entry.innerHTML = `❌ Sorry, wrong location. Out of guesses.`;

            // Draw Red Selection Box over correct location 
            drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 

            // Call the next question
            nextQuestion.call(currentNextBtn);
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
function nextQuestion(isSkip = false) { 
    guesses = 0; // Reset Guesses
    this.disabled = true; // Disable clicked Next button 
    
    // Skip Remaining Guesses
    const loc = LOCATIONS[question];
    const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

    const currentBlock = document.getElementById(`question-${question}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");
    
    if (isSkip) { 
        const entry = document.createElement("p");

        // Feedback Entry Creation for Skipping Guesses
        entry.className = "feedback-skip"; 

        // Feedback Entry for Skipping Guesses 
        entry.innerHTML = `Remaining tries skipped. Question marked as wrong.`;

        currentFeedback.appendChild(entry);

        // Draw Red Selection Box over correct location 
        drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 
    } 

    question++; 

    // If all questions have been answered End the Game
    if (question >= LOCATIONS.length) { 
        endGame();
    } else { // Else move to the next question
        loadQuestion(question);
    }
}

// Temp Selection Box (Wrong Location)
function tempSquare(clickedLatLng, rLat, rLng) { 

    // Draw yellow square where user clicked
    const clickSquare = new google.maps.Rectangle({
        map: map,
        bounds: {
            north: clickedLatLng.lat() + (rLat + 0.0001),
            south: clickedLatLng.lat() - (rLat - 0.0001),
            east:  clickedLatLng.lng() + (rLng + 0.0001),
            west:  clickedLatLng.lng() - (rLng - 0.0001),
        },
        strokeColor: "#f7bf0a",
        fillColor: "#f7bf0a",
        strokeWeight: 2,
        fillOpacity: 0.3,
    });

    // Disappear after 1.5 seconds
    setTimeout(() => clickSquare.setMap(null), 1500);
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

// Update Live Stats 
function updateStats() { 
    
    scoreDisplay.innerHTML = `${score} / ${LOCATIONS.length}`; // Score Display Live 
    questionDisplay.innerHTML = `${question + 1} / ${LOCATIONS.length}`; // Question Display Live
    
}

// End Game 
function endGame() { 
    stopTimer(); // Stop timer
    mapObj.setAttribute("hidden", ""); // Hide Map 
    resultsPanel.show(); // Open Results Panel
}

// Restart the Game 
function restartGame() { 
    // Reset variables
    score = 0; 
    question = 0; 
    guesses = 0; 

    // Clear Selection Boxes for correct locations
    clearSquares(); 

    // Clear log box
    logBox.innerHTML = ""; 

    // Reset Live Stats Display 
    updateStats(); 
    timerDisplay.innerHTML = "0.00"; 

    // Close Game Over Panel 
    resultsPanel.close(); 

    // Hide Game Panel 
    gamePanel.setAttribute("hidden", "");

    // Show Game Instructions 
    introPanel.setAttribute("open", ""); 
}

// Clear Selection Boxes
function clearSquares() { 
    squares.forEach(s => s.setMap(null));
    squares = [];
}

// Event Listeners 

// Start Button 
startBtn.addEventListener("click", startGame);

// Restart Button 
restartBtn.addEventListener("click", restartGame);
