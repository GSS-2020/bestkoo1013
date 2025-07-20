// Game variables
let currentPlayer = 1;
let gameBoard = [];
let gameActive = true;
let gridSize = 9; // 9x9 kotak = 10x10 titik sudut
let player1Score = 0;
let player2Score = 0;
let player1Captures = 0; // Number of pieces captured by player 1
let player2Captures = 0; // Number of pieces captured by player 2
let player1Name = 'Pemain 1'; // Player 1 name
let player2Name = 'Pemain 2'; // Player 2 name
let gameStarted = false; // Track if game has started
let namesSet = false; // Track if names have been set
let player1Wins = 0; // Total wins for player 1
let player2Wins = 0; // Total wins for player 2

// Load statistics from localStorage
function loadStatistics() {
    const savedStats = localStorage.getItem('gameStatistics');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        player1Wins = stats.player1Wins || 0;
        player2Wins = stats.player2Wins || 0;
        player1Name = stats.player1Name || 'Pemain 1';
        player2Name = stats.player2Name || 'Pemain 2';
        namesSet = stats.namesSet || false;
        
        if (namesSet) {
            updateStatsDashboard();
            showStatsDashboard();
        }
    }
}

// Save statistics to localStorage
function saveStatistics() {
    const stats = {
        player1Wins,
        player2Wins,
        player1Name,
        player2Name,
        namesSet
    };
    localStorage.setItem('gameStatistics', JSON.stringify(stats));
}

// Initialize the game
function initGame() {
    loadStatistics(); // Load saved statistics first
    
    if (!gameStarted && !namesSet) {
        showPlayerNameModal();
        return;
    } else if (namesSet && !gameStarted) {
        // Names already set, just start the game
        gameStarted = true;
        updatePlayerDisplay();
        showStatsDashboard();
    }
    
    createGameBoard();
    updatePlayerTurn();
    updateScores();
}

// Show player name input modal
function showPlayerNameModal() {
    const modal = document.getElementById('player-name-modal');
    modal.style.display = 'flex';
    
    // Focus on first input
    document.getElementById('player1-name').focus();
    
    // Add Enter key support
    document.getElementById('player1-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('player2-name').focus();
        }
    });
    
    document.getElementById('player2-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startGameWithNames();
        }
    });
}

// Start game with custom names
function startGameWithNames() {
    const player1Input = document.getElementById('player1-name').value.trim();
    const player2Input = document.getElementById('player2-name').value.trim();
    
    // Use custom names or default if empty
    player1Name = player1Input || 'Pemain 1';
    player2Name = player2Input || 'Pemain 2';
    
    // Limit name length for display
    if (player1Name.length > 15) player1Name = player1Name.substring(0, 15) + '...';
    if (player2Name.length > 15) player2Name = player2Name.substring(0, 15) + '...';
    
    // Mark names as set
    namesSet = true;
    gameStarted = true;
    
    // Hide modal and show stats dashboard
    document.getElementById('player-name-modal').style.display = 'none';
    showStatsDashboard();
    
    // Update display with names
    updatePlayerDisplay();
    updateStatsDashboard();
    
    // Save statistics
    saveStatistics();
    
    // Start the actual game
    createGameBoard();
    updatePlayerTurn();
    updateScores();
}

// Use default names and start game
function useDefaultNames() {
    player1Name = 'Pemain 1';
    player2Name = 'Pemain 2';
    
    // Mark names as set
    namesSet = true;
    gameStarted = true;
    
    // Hide modal and show stats dashboard
    document.getElementById('player-name-modal').style.display = 'none';
    showStatsDashboard();
    
    // Update display with names
    updatePlayerDisplay();
    updateStatsDashboard();
    
    // Save statistics
    saveStatistics();
    
    // Start the actual game
    createGameBoard();
    updatePlayerTurn();
    updateScores();
}

// Update player display elements with custom names
function updatePlayerDisplay() {
    // Update score display labels
    const score1Label = document.querySelector('#score1 span:first-child');
    const score2Label = document.querySelector('#score2 span:first-child');
    
    score1Label.textContent = `${player1Name} (Hitam): `;
    score2Label.textContent = `${player2Name} (Merah): `;
}

// Show statistics dashboard
function showStatsDashboard() {
    const dashboard = document.getElementById('stats-dashboard');
    dashboard.style.display = 'block';
}

// Hide statistics dashboard
function hideStatsDashboard() {
    const dashboard = document.getElementById('stats-dashboard');
    dashboard.style.display = 'none';
}

// Update statistics dashboard
function updateStatsDashboard() {
    // Update player names in dashboard
    document.getElementById('player1-stat-name').textContent = player1Name;
    document.getElementById('player2-stat-name').textContent = player2Name;
    
    // Update win counts
    document.getElementById('player1-wins').textContent = player1Wins;
    document.getElementById('player2-wins').textContent = player2Wins;
    
    // Update leading indicators
    const stat1 = document.querySelector('.stat-card:first-child');
    const stat2 = document.querySelector('.stat-card:last-child');
    
    // Remove previous leading classes
    stat1.classList.remove('player1-leading', 'player2-leading');
    stat2.classList.remove('player1-leading', 'player2-leading');
    
    // Add leading class to winner
    if (player1Wins > player2Wins) {
        stat1.classList.add('player1-leading');
    } else if (player2Wins > player1Wins) {
        stat2.classList.add('player2-leading');
    }
}

// Create the game board with intersections
function createGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    gameBoard = [];
    
    // Manual positioning of dots - exclude left and top edges
    const dotPositions = [];
    
    // Generate manual positions excluding row 0 and col 0 (no left/top edges)
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            dotPositions.push({
                row: row,
                col: col,
                x: col * 50, // Desktop: 50px spacing
                y: row * 50, // Desktop: 50px spacing
                xMobile: col * 40, // Mobile: 40px spacing
                yMobile: row * 40  // Mobile: 40px spacing
            });
        }
    }
    
    // Initialize gameBoard array
    for (let row = 0; row <= 9; row++) {
        gameBoard[row] = [];
        for (let col = 0; col <= 9; col++) {
            gameBoard[row][col] = 0; // 0 = empty, 1 = player1, 2 = player2
        }
    }
    
    // Create dots using manual positions
    dotPositions.forEach(pos => {
        const intersection = document.createElement('div');
        intersection.className = 'intersection';
        intersection.dataset.row = pos.row;
        intersection.dataset.col = pos.col;
        
        // Set position based on screen size
        const isMobile = window.innerWidth <= 768;
        intersection.style.left = (isMobile ? pos.xMobile : pos.x) + 'px';
        intersection.style.top = (isMobile ? pos.yMobile : pos.y) + 'px';
        
        // Add click event listener
        intersection.addEventListener('click', () => placeDot(pos.row, pos.col, intersection));
        
        board.appendChild(intersection);
    });
    
    // Add touch support after creating intersections
    addTouchSupport();
    
    console.log(`Manual grid created with ${dotPositions.length} dots (excluding left and top edges)`);
}

// Place a dot on the grid
function placeDot(row, col, element) {
    if (!gameActive || gameBoard[row][col] !== 0 || element.classList.contains('captured')) {
        return; // Can't place dot if game is over, position is occupied, or already captured
    }
    
    // Place the dot
    gameBoard[row][col] = currentPlayer;
    
    // Update visual representation
    if (currentPlayer === 1) {
        element.classList.add('player1', 'placed');
        updateScore(1);
    } else {
        element.classList.add('player2', 'placed');
        updateScore(2);
    }
    
    // Remove the placed animation class after animation completes
    setTimeout(() => {
        element.classList.remove('placed');
    }, 300);
    
    // Check for captures after each move
    checkForCaptures();
    
    // Check for winning conditions (optional - you can implement pattern matching)
    checkGameState();
    
    // Switch players
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerTurn();
}

// Update the current player display
function updatePlayerTurn() {
    const playerTurnElement = document.getElementById('current-player');
    if (currentPlayer === 1) {
        playerTurnElement.textContent = `${player1Name} (Hitam)`;
        playerTurnElement.style.color = '#2c3e50';
    } else {
        playerTurnElement.textContent = `${player2Name} (Merah)`;
        playerTurnElement.style.color = '#e74c3c';
    }
}

// Simple scoring system - each dot placed gives 1 point
function updateScore(player) {
    if (player === 1) {
        player1Score++;
    } else {
        player2Score++;
    }
    updateScores();
}

// Update score display
function updateScores() {
    document.getElementById('player1-score').textContent = player1Captures;
    document.getElementById('player2-score').textContent = player2Captures;
    
    // Update leading indicator
    const leadingIndicator = document.getElementById('leading-indicator');
    const score1Element = document.getElementById('score1');
    const score2Element = document.getElementById('score2');
    
    // Remove previous highlighting
    score1Element.classList.remove('leading');
    score2Element.classList.remove('leading');
    
    if (player1Captures > player2Captures) {
        leadingIndicator.textContent = `🏆 ${player1Name} Memimpin dengan ${player1Captures - player2Captures} kepungan`;
        leadingIndicator.style.color = '#2c3e50';
        score1Element.classList.add('leading');
    } else if (player2Captures > player1Captures) {
        leadingIndicator.textContent = `🏆 ${player2Name} Memimpin dengan ${player2Captures - player1Captures} kepungan`;
        leadingIndicator.style.color = '#e74c3c';
        score2Element.classList.add('leading');
    } else {
        leadingIndicator.textContent = '⚖️ Seri - Tiada pemimpin';
        leadingIndicator.style.color = '#7f8c8d';
    }
}

// Check for captures after each move
function checkForCaptures() {
    // Check all opponent pieces for capture
    const opponentPlayer = currentPlayer === 1 ? 2 : 1;
    
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === opponentPlayer) {
                const surroundingInfo = isSurrounded(row, col, opponentPlayer);
                if (surroundingInfo.isSurrounded) {
                    captureGroup(row, col, opponentPlayer, surroundingInfo.attackers, surroundingInfo.emptySpaces);
                }
            }
        }
    }
}

// Check if a dot is surrounded by opponent and return attacker positions
function isSurrounded(startRow, startCol, player) {
    // Simple surrounding check: Look for connected group and check if surrounded in 4 directions
    const visited = new Set();
    const group = [];
    const toCheck = [[startRow, startCol]];
    
    // Find all connected pieces of the same color
    while (toCheck.length > 0) {
        const [row, col] = toCheck.pop();
        const key = `${row},${col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (gameBoard[row] && gameBoard[row][col] === player) {
            group.push([row, col]);
            
            // Check 4 main directions for connected pieces
            const neighbors = [
                [row - 1, col], // up
                [row + 1, col], // down
                [row, col - 1], // left
                [row, col + 1]  // right
            ];
            
            for (const [newRow, newCol] of neighbors) {
                if (newRow >= 1 && newRow <= 9 && newCol >= 1 && newCol <= 9) {
                    if (gameBoard[newRow][newCol] === player) {
                        toCheck.push([newRow, newCol]);
                    }
                }
            }
        }
    }
    
    // Now check if this group is surrounded
    const attackers = new Set();
    let hasFreedom = false;
    
    for (const [row, col] of group) {
        // Check 4 directions around each piece in the group
        const neighbors = [
            [row - 1, col], // up
            [row + 1, col], // down
            [row, col - 1], // left
            [row, col + 1]  // right
        ];
        
        for (const [newRow, newCol] of neighbors) {
            if (newRow >= 1 && newRow <= 9 && newCol >= 1 && newCol <= 9) {
                if (gameBoard[newRow][newCol] === 0) {
                    // Found empty space - group has freedom
                    hasFreedom = true;
                } else if (gameBoard[newRow][newCol] !== player) {
                    // Found opponent - add to attackers
                    attackers.add(`${newRow},${newCol}`);
                }
            }
        }
    }
    
    // Convert attackers set back to array of coordinates
    const attackerPositions = Array.from(attackers).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return [row, col];
    });
    
    // Group is surrounded if it has no freedom (no empty adjacent spaces)
    // and has at least 4 different attacking positions
    const isSurroundedResult = !hasFreedom && attackerPositions.length >= 4;
    
    return { 
        isSurrounded: isSurroundedResult, 
        attackers: attackerPositions,
        emptySpaces: [] // No empty spaces to block in this simple version
    };
}

// Capture a surrounded group and draw lines between attackers
function captureGroup(startRow, startCol, player, attackers, emptySpaces) {
    const visited = new Set();
    const group = [];
    const toCapture = [[startRow, startCol]];
    
    // Find all connected pieces to capture
    while (toCapture.length > 0) {
        const [row, col] = toCapture.pop();
        const key = `${row},${col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (gameBoard[row] && gameBoard[row][col] === player) {
            group.push([row, col]);
            
            // Check 4 main directions for connected pieces
            const neighbors = [
                [row - 1, col], // up
                [row + 1, col], // down
                [row, col - 1], // left
                [row, col + 1]  // right
            ];
            
            for (const [newRow, newCol] of neighbors) {
                if (newRow >= 1 && newRow <= 9 && newCol >= 1 && newCol <= 9) {
                    if (gameBoard[newRow][newCol] === player) {
                        toCapture.push([newRow, newCol]);
                    }
                }
            }
        }
    }
    
    // Draw connecting lines between attacking pieces (use current player color)
    drawAttackerLines(attackers, currentPlayer);
    
    // Create capture overlay for each captured piece
    group.forEach(([row, col]) => {
        gameBoard[row][col] = 0; // Remove from game board
        
        // Find the visual element and add capture effect
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (element) {
            element.classList.remove('player1', 'player2');
            element.classList.add('captured');
            
            // Create capture overlay on the captured piece
            createCaptureOverlay(row, col);
        }
    });
    
    // No empty spaces to block in this simple version
    // Award capture points to capturing player
    if (currentPlayer === 1) {
        player1Captures += group.length; // Add number of captured pieces
        player1Score += group.length * 2; // Bonus points for capture
    } else {
        player2Captures += group.length; // Add number of captured pieces
        player2Score += group.length * 2; // Bonus points for capture
    }
    
    updateScores();
    console.log(`Captured ${group.length} pieces of player ${player}!`);
    
    // Check for early win condition - if someone has captured enough pieces
    checkWinCondition();
}

// Draw lines connecting attacking pieces that formed the capture
function drawAttackerLines(attackers, capturingPlayer) {
    if (attackers.length < 2) return;
    
    const board = document.getElementById('game-board');
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    
    // Create lines between adjacent attackers to form a connected perimeter
    const connections = findAttackerConnections(attackers);
    
    connections.forEach(([start, end]) => {
        const line = document.createElement('div');
        line.className = 'attacker-line';
        
        // Add color class based on capturing player
        if (capturingPlayer === 1) {
            line.classList.add('player1-line');
        } else {
            line.classList.add('player2-line');
        }
        
        const [startRow, startCol] = start;
        const [endRow, endCol] = end;
        
        const x1 = startCol * spacing;
        const y1 = startRow * spacing;
        const x2 = endCol * spacing;
        const y2 = endRow * spacing;
        
        // Calculate line position and rotation
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.left = x1 + 'px';
        line.style.top = y1 + 'px';
        line.style.width = length + 'px';
        line.style.height = '3px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        board.appendChild(line);
        
        // Animate the line appearance
        setTimeout(() => {
            line.classList.add('line-animation');
        }, 100);
    });
}

// Find which attackers should be connected with lines
function findAttackerConnections(attackers) {
    const connections = [];
    
    // Connect attackers that are adjacent to each other
    for (let i = 0; i < attackers.length; i++) {
        for (let j = i + 1; j < attackers.length; j++) {
            const [row1, col1] = attackers[i];
            const [row2, col2] = attackers[j];
            
            // Check if they are adjacent (horizontally, vertically, or diagonally)
            const rowDiff = Math.abs(row1 - row2);
            const colDiff = Math.abs(col1 - col2);
            
            if ((rowDiff <= 1 && colDiff <= 1) && (rowDiff + colDiff > 0)) {
                connections.push([attackers[i], attackers[j]]);
            }
        }
    }
    
    return connections;
}

// Create visual capture overlay
function createCaptureOverlay(row, col) {
    const board = document.getElementById('game-board');
    const overlay = document.createElement('div');
    overlay.className = 'capture-overlay';
    
    // Position overlay at the captured dot
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    const x = col * spacing;
    const y = row * spacing;
    
    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
    
    // Add X mark for captured piece
    overlay.innerHTML = '✖';
    
    board.appendChild(overlay);
    
    // No animation needed - just show the X mark immediately
}

// Create visual overlay for blocked empty spaces
function createBlockedOverlay(row, col) {
    const board = document.getElementById('game-board');
    const overlay = document.createElement('div');
    overlay.className = 'blocked-overlay';
    
    // Position overlay at the blocked space
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    const x = col * spacing;
    const y = row * spacing;
    
    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
    
    // Add dot to show it's blocked
    overlay.innerHTML = '●';
    
    board.appendChild(overlay);
    
    // Animate the blocking
    setTimeout(() => {
        overlay.classList.add('blocked-animation');
    }, 200);
}

// Check for early win condition based on captures
function checkWinCondition() {
    const winningCaptureCount = 10; // Win if someone captures 10 or more pieces
    
    if (player1Captures >= winningCaptureCount) {
        endGame('capture');
    } else if (player2Captures >= winningCaptureCount) {
        endGame('capture');
    }
}

// Check game state (you can expand this for more complex win conditions)
function checkGameState() {
    // Count empty spaces - adjusted for new grid size
    let emptySpaces = 0;
    for (let row = 0; row <= gridSize; row++) {
        for (let col = 0; col <= gridSize; col++) {
            if (gameBoard[row][col] === 0) {
                emptySpaces++;
            }
        }
    }
    
    // End game if board is full
    if (emptySpaces === 0) {
        endGame('boardfull');
    }
}

// End the game
function endGame(winType = 'normal') {
    gameActive = false;
    
    let winner;
    let winReason = '';
    let winnerPlayer = 0; // 0 = tie, 1 = player1, 2 = player2
    
    if (player1Captures > player2Captures) {
        winner = `${player1Name} (Hitam) Menang!`;
        winnerPlayer = 1;
        player1Wins++; // Increment player 1 wins
        if (winType === 'capture') {
            winReason = `Mencapai ${player1Captures} kepungan!`;
        } else {
            winReason = `Lebih banyak kepungan: ${player1Captures} vs ${player2Captures}`;
        }
    } else if (player2Captures > player1Captures) {
        winner = `${player2Name} (Merah) Menang!`;
        winnerPlayer = 2;
        player2Wins++; // Increment player 2 wins
        if (winType === 'capture') {
            winReason = `Mencapai ${player2Captures} kepungan!`;
        } else {
            winReason = `Lebih banyak kepungan: ${player2Captures} vs ${player1Captures}`;
        }
    } else {
        winner = 'Seri!';
        winnerPlayer = 0;
        winReason = `Kedua-dua pemain: ${player1Captures} kepungan`;
    }
    
    // Update and save statistics
    updateStatsDashboard();
    saveStatistics();
    
    // Create game over overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-over';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>${winner}</h2>
            <p>${winReason}</p>
            <br>
            <p><strong>Jumlah Kepungan:</strong></p>
            <p>${player1Name}: ${player1Captures} titik dikepung</p>
            <p>${player2Name}: ${player2Captures} titik dikepung</p>
            <br>
            <p><strong>Statistik Keseluruhan:</strong></p>
            <p>${player1Name}: ${player1Wins} kemenangan</p>
            <p>${player2Name}: ${player2Wins} kemenangan</p>
            <button onclick="startNewGame();">
                Main Lagi
            </button>
            <button onclick="closeGameOver();" style="margin-left: 10px; background-color: #95a5a6;">
                Tutup
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Close game over overlay without resetting
function closeGameOver() {
    const overlay = document.querySelector('.game-over');
    if (overlay) {
        overlay.remove();
    }
}

// Start a new game (keeps existing names and stats)
function startNewGame() {
    // Remove any existing game over overlay
    const overlay = document.querySelector('.game-over');
    if (overlay) {
        overlay.remove();
    }
    
    // Remove capture overlays
    const captureOverlays = document.querySelectorAll('.capture-overlay');
    captureOverlays.forEach(overlay => overlay.remove());
    
    // Remove attacker lines
    const attackerLines = document.querySelectorAll('.attacker-line');
    attackerLines.forEach(line => line.remove());
    
    // Reset only game state, keep names and stats
    currentPlayer = 1;
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    player1Captures = 0;
    player2Captures = 0;
    gameStarted = true; // Keep game as started
    
    // Recreate the board
    createGameBoard();
    updatePlayerTurn();
    updateScores();
    
    // Ensure proper positioning after reset
    setTimeout(() => {
        adjustForMobile();
    }, 200);
}

// Reset game and allow new player names (replaces old resetGame)
function resetGameAndPlayers() {
    // Remove any existing game over overlay
    const overlay = document.querySelector('.game-over');
    if (overlay) {
        overlay.remove();
    }
    
    // Remove capture overlays
    const captureOverlays = document.querySelectorAll('.capture-overlay');
    captureOverlays.forEach(overlay => overlay.remove());
    
    // Remove attacker lines
    const attackerLines = document.querySelectorAll('.attacker-line');
    attackerLines.forEach(line => line.remove());
    
    // Reset everything including names
    currentPlayer = 1;
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    player1Captures = 0;
    player2Captures = 0;
    gameStarted = false;
    namesSet = false; // Allow new names
    
    // Hide stats dashboard
    hideStatsDashboard();
    
    // Clear input fields
    document.getElementById('player1-name').value = '';
    document.getElementById('player2-name').value = '';
    
    // Restart with name input
    initGame();
}

// Clear all statistics
function clearStatistics() {
    if (confirm('Adakah anda pasti mahu menghapuskan semua statistik? Tindakan ini tidak boleh dibuat asal.')) {
        player1Wins = 0;
        player2Wins = 0;
        updateStatsDashboard();
        saveStatistics();
        alert('Statistik telah dikosongkan!');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.key === 'n' || event.key === 'N') {
        startNewGame();
    } else if (event.key === 'r' || event.key === 'R') {
        resetGameAndPlayers();
    } else if (event.key === 'c' || event.key === 'C') {
        if (event.ctrlKey) { // Ctrl+C to clear stats
            clearStatistics();
        }
    }
});

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // Delay verification to ensure DOM is ready
    setTimeout(() => {
        adjustForMobile();
        verifyManualGrid();
    }, 300);
});

// Add window resize listener
window.addEventListener('resize', () => {
    setTimeout(() => {
        adjustForMobile();
        verifyManualGrid();
    }, 100);
});

// Manual grid verification function
function verifyManualGrid() {
    const intersections = document.querySelectorAll('.intersection');
    console.log('\n=== MANUAL GRID VERIFICATION ===');
    console.log(`Total dots created: ${intersections.length}`);
    console.log('Expected: 81 dots (9x9 grid - excluding left and top edges)');
    
    // Check bottom-right corner specifically (should exist)
    const corners = [
        {name: 'Bottom-Right', row: 9, col: 9, shouldExist: true},
        {name: 'Top-Left', row: 0, col: 0, shouldExist: false},
        {name: 'Top-Right', row: 0, col: 9, shouldExist: false},
        {name: 'Bottom-Left', row: 9, col: 0, shouldExist: false}
    ];
    
    corners.forEach(corner => {
        const dot = document.querySelector(`[data-row="${corner.row}"][data-col="${corner.col}"]`);
        if (corner.shouldExist) {
            if (dot) {
                const x = parseInt(dot.style.left);
                const y = parseInt(dot.style.top);
                console.log(`✅ ${corner.name} corner [${corner.row},${corner.col}]: Position (${x}, ${y})`);
            } else {
                console.error(`❌ Missing ${corner.name} corner at [${corner.row},${corner.col}]`);
            }
        } else {
            if (!dot) {
                console.log(`✅ ${corner.name} corner correctly excluded [${corner.row},${corner.col}]`);
            } else {
                console.warn(`⚠️ ${corner.name} corner should not exist at [${corner.row},${corner.col}]`);
            }
        }
    });
    
    // Check grid completion (only for rows 1-9, cols 1-9)
    let missingDots = 0;
    let totalExpected = 0;
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            totalExpected++;
            const dot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!dot) {
                missingDots++;
                console.warn(`Missing dot at [${row},${col}]`);
            }
        }
    }
    
    if (missingDots === 0) {
        console.log(`✅ All ${totalExpected} dots correctly positioned (excluding left and top edges)!`);
    } else {
        console.error(`❌ ${missingDots} dots are missing from manual grid`);
    }
}

// Add touch support for mobile devices
function addTouchSupport() {
    const intersections = document.querySelectorAll('.intersection');
    intersections.forEach(intersection => {
        intersection.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const row = parseInt(intersection.dataset.row);
            const col = parseInt(intersection.dataset.col);
            placeDot(row, col, intersection);
        });
    });
}

// Adjust grid spacing for mobile
function adjustForMobile() {
    const board = document.getElementById('game-board');
    const intersections = document.querySelectorAll('.intersection');
    
    // Manual repositioning for responsive design
    intersections.forEach(intersection => {
        const row = parseInt(intersection.dataset.row);
        const col = parseInt(intersection.dataset.col);
        
        if (window.innerWidth <= 768) {
            // Mobile spacing - manual positions
            const x = col * 40; // 40px spacing for mobile
            const y = row * 40; // 40px spacing for mobile
            intersection.style.left = x + 'px';
            intersection.style.top = y + 'px';
        } else {
            // Desktop spacing - manual positions
            const x = col * 50; // 50px spacing for desktop
            const y = row * 50; // 50px spacing for desktop
            intersection.style.left = x + 'px';
            intersection.style.top = y + 'px';
        }
    });
    
    console.log(`Manual repositioning completed for ${window.innerWidth <= 768 ? 'mobile' : 'desktop'} view`);
}
