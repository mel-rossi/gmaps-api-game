// Global Variables 

let map; // Map
let startTime = 0; // Start Time
let time = 0; // Time
let score = 0; // Number of correct answers
let guesses = 0; // Number of guesses
let question = 0; // Question number
let squares = []; // All drawn squares in map
let canClick = true; // Double Click Ability
let scoreCalc = null; // Score Calc 
let completed = false; // Track Completion of Questions
let testRunning = false; // Test Running Check 
let timerInterval = null; // Time Interval
const mapObj = document.getElementById("map"); // Map Object
const newHS = document.getElementById("new-hs"); // New High Score Banner
const logBox = document.getElementById("log-box"); // Log Box
const basePts = document.getElementById("base-pts"); // Base Pts in Scoreboard
const comboPts = document.getElementById("combo-pts"); // Combo Pts in Scoreboard
const speedPts = document.getElementById("speed-pts"); // Speed Pts in Scoreboard
const startBtn = document.getElementById("start-btn"); // Start Button
const statsBar = document.getElementById("stats-bar"); // Live Stats Bar
const highScore = document.getElementById("high-score"); // High Score in Results Panel
const gamePanel = document.getElementById("game-panel"); // Game Panel
const finalTime = document.getElementById("final-time"); // Final Time in Results Panel
const finalScore = document.getElementById("final-score"); // Final Score in Results Panel 
const introPanel = document.getElementById("intro-panel"); // Intro Panel
const alertPanel = document.getElementById("alert-panel"); // Alert Panel
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

let trueScore = { base: 0, combo: 0, speed: 0}; // Weighted Score 
// (Correct on # Guess) 1st : +180 | 2nd : +120 | 3rd : +60 (x5 - for each Question)
// (# of Correct Guesses total) 2 : +12 | 3 : +24 | 4 : +36 | 5 : +48 (12 x (score - 1))
// (Speed Bonus) <= 20 secs : +5 & <= 15 secs : +15 & <= 10 secs : +31 (Stack up)

introPanel.show();

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
    statsBar.removeAttribute("hidden"); // Open Live Stats Bar
    
    
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
    completed = false; // Reset for new question 

    const loc = LOCATIONS[i]; 

    // Question Block 
    const block = document.createElement("div");
    block.className = "panel prompt-box";
    block.id = `question-${i}`;
    block.innerHTML = `
        <!-- Question Prompt -->
        <h3>Where is <span class="bld-name">${loc.name}</span> ?</h3>

        <!-- Live Feedback & Progress -->
        <div class="feedback-box">
        </div>

        <!-- Next Button --> 
        <button class="next-btn" id="${i}-next-btn">Skip</button>
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

    // Ignore clicks when locked
    if (!canClick) { 
        alertPanel.show();
        return; 
    }

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
        completed = true; // All Questions Completed

        score++; // Increment score 
        updateStats(); // Update live stats

        // Feedback Entry Creation for a Correct Guess
        entry.className = "feedback-correct";

        // Feedback Entry for Correct Guess
        entry.innerHTML = `You guessed correctly! Great job.`; 

        // Calculate Base Pts 
        trueScore.base += guesses === 0 ? 180 : guesses === 1 ? 120 : 60;

        // Draw Green Selection Box
        drawSquare(correctLatLng, "#00ac85", loc.radiusLat, loc.radiusLng); 

        // Advance to next question 
        autoAdvance(currentNextBtn);
    } else { // Wrong Guess 
        
        guesses++; // Increment Guesses 

        tempSquare(clickedLatLng, loc.radiusLat, loc.radiusLng);

        if (guesses >= 3) { // Out of guesses
            completed = true; // All Questions Completed

            // Feedback Entry Creation for a Wrong Guess
            entry.className = "feedback-wrong";

            // Feedback Entry for Last Wrong Guess
            entry.innerHTML = `❌ Sorry, wrong location. Out of guesses.`;

            // Draw Red Selection Box over correct location 
            drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 

            // Call the next question
            autoAdvance(currentNextBtn);
        } else { // 1 or 2 guesses left 
            // Feedback Entry Creation for a Guess Countdown
            entry.className = "feedback-guess";

            // Feedback Entry for Wrong Guess (not last)
            entry.innerHTML = 
                `❌ Sorry, wrong location. ${3 - guesses} 
                guess${3 - guesses > 1 ? "es" : ""} remaining.`;
        }
    }

    currentFeedback.appendChild(entry);
    currentBlock.scrollIntoView({ behavior: "smooth" });
}

// Move to Next Question 
function nextQuestion(isSkip = false) { 
    guesses = 0; // Reset Guesses
    this.disabled = true; // Disable clicked Next button 
    
    // Skip Remaining Guesses
    if (isSkip && !completed) { 
        const loc = LOCATIONS[question];
        const correctLatLng = new google.maps.LatLng(loc.lat, loc.lng);

        const currentBlock = document.getElementById(`question-${question}`);
        const currentFeedback = currentBlock.querySelector(".feedback-box");
        
        const entry = document.createElement("p");

        // Feedback Entry Creation for Skipping Guesses
        entry.className = "feedback-wrong"; 

        // Feedback Entry for Skipping Guesses 
        entry.innerHTML = `Remaining tries skipped. Question marked as wrong.`;

        currentFeedback.appendChild(entry);

        // Draw Red Selection Box over correct location 
        drawSquare(correctLatLng, "#e3503e", loc.radiusLat, loc.radiusLng); 
    } 

    question++; 

    // Last Question reached / skipped
    if (question >= LOCATIONS.length) {
        canClick = false; // Lock Map on last question 
        stopTimer(); // Stop timer 

        // Clone to remove old skip listener
        const lastBtn = document.getElementById(`question-${question - 1}`).querySelector(".next-btn");
        const newBtn = lastBtn.cloneNode(true);
        lastBtn.parentNode.replaceChild(newBtn, lastBtn);
        newBtn.textContent = "Game Over";
        newBtn.disabled = false;
        newBtn.addEventListener("click", () => gameOver(question - 1));

        // Scroll to View when you skip the last question
        const lastBlock = document.getElementById(`question-${question - 1}`);
        setTimeout(() => {
            lastBlock.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 10);
    } else { 
        loadQuestion(question);
    }
}

// Call the next question 
function autoAdvance(btn) { 
    // Last Question
    if (question + 1 >= LOCATIONS.length) { 
        canClick = false; // Lock map clicks

        stopTimer(); // Stop Timer 

        btn.disabled = false; // Enable the Button

        // Change Skip Button to Game Over Button
        btn.innerHTML = "Game Over"; 
        
        const newBtn = btn.cloneNode(true); // Remove listeners 
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => gameOver(question));
    } else { // Call the next question
        nextQuestion.call(btn);
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

// Game Over Button
function gameOver(idx) {
    const btn = document.getElementById(`question-${idx}`).querySelector(".next-btn");
    btn.disabled = true; // Disable Game Over Button 
    alertPanel.close(); // Close Alert Panel 

    const currentBlock = document.getElementById(`question-${idx}`);
    const currentFeedback = currentBlock.querySelector(".feedback-box");

    const entry = document.createElement("p");
    entry.className = "feedback-complete";
    entry.innerHTML = `Game has been completed.`;
    currentFeedback.appendChild(entry);

    scoreCalc = document.getElementById("score-calc");
    scoreCalc.removeAttribute("hidden"); // Open Score Board Calculation 
    scoreCalc.scrollIntoView({ behavior: "smooth" });

    //  Calculate Combo Bonus 
    if (score >= 2) trueScore.combo = (score - 1) * 12;

    // Calculate Speed Bonus 
    const totalSeconds = Math.floor(time / 1000);
    if (totalSeconds <= 20) trueScore.speed += 5;
    if (totalSeconds <= 15) trueScore.speed += 15;
    if (totalSeconds <= 10) trueScore.speed += 31;

    // Add to Scoreboard Calculation Section on Page
    basePts.innerHTML = trueScore.base; 
    comboPts.innerHTML = trueScore.combo; 
    speedPts.innerHTML = trueScore.speed; 

    // Calculate Final Score 
    const total = String(trueScore.base + trueScore.combo + trueScore.speed).padStart(3, "0");

    // Add to Resuls Panel 
    finalTime.innerHTML = formatTime(time); 
    finalScore.innerHTML = total;

    // High Score
    const isNew = saveHighScore(parseInt(total), time);

    loadHighScore(); // Load High Score. 

    // If new display banner
    if (isNew) {
        newHS.removeAttribute("hidden");
    }

    endGame();
}

// End Game 
function endGame() { 
    mapObj.setAttribute("hidden", ""); // Hide Map 
    resultsPanel.show(); // Open Results Panel
}

// Restart the Game 
function restartGame() { 
    // Reset variables
    score = 0; 
    question = 0; 
    guesses = 0; 
    canClick = true;
    completed = false; 
    trueScore = { base: 0, combo: 0, speed: 0 };

    // Clear Selection Boxes for correct locations
    clearSquares(); 

    // Clear log box
    logBox.innerHTML = ""; 

    // Reset Live Stats Display 
    updateStats(); 
    timerDisplay.innerHTML = "0:00"; 

    // Close Game Over Panel 
    resultsPanel.close(); 

    // High Score 
    loadHighScore();

    // Hide Game Panel 
    gamePanel.setAttribute("hidden", "");

    // Show Game Instructions 
    introPanel.show(); 

    // Hide Scoreboard Calculation 
    scoreCalc.setAttribute("hidden", "");

    // Hide new High Score Banner 
    newHS.setAttribute("hidden", "");
}

// Clear Selection Boxes
function clearSquares() { 
    squares.forEach(s => s.setMap(null));
    squares = [];
}

// Save High Score to Local Storage
function saveHighScore(finalScore, finalTime) {
    const storedScore = parseInt(localStorage.getItem("highScore"));
    const storedTimeRaw = parseInt(localStorage.getItem("highScoreTimeRaw"));

    // If no high score exists yet
    if (isNaN(storedScore)) {
        localStorage.setItem("highScore", finalScore);
        localStorage.setItem("highScoreTime", formatTime(finalTime));
        localStorage.setItem("highScoreTimeRaw", finalTime);
        return true;
    }

    // Compare scores
    if (finalScore > storedScore) {
        localStorage.setItem("highScore", finalScore);
        localStorage.setItem("highScoreTime", formatTime(finalTime));
        localStorage.setItem("highScoreTimeRaw", finalTime);
        return true;
    }

    // Compare times if scores are equal
    if (finalScore === storedScore && finalTime < storedTimeRaw) {
        localStorage.setItem("highScore", finalScore);
        localStorage.setItem("highScoreTime", formatTime(finalTime));
        localStorage.setItem("highScoreTimeRaw", finalTime);
        return true;
    }

    return false;
}

// Load High Score from Local Storage
function loadHighScore() {
    const storedScore = localStorage.getItem("highScore") || "---";
    const storedTime = localStorage.getItem("highScoreTime") || "--:--";
    document.getElementById("high-score").innerHTML = String(storedScore).padStart(3, "0");
    document.getElementById("high-score-time").innerHTML = storedTime;
}

// Event Listeners 

// Start Button 
startBtn.addEventListener("click", startGame);

// Restart Button 
restartBtn.addEventListener("click", restartGame);
