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
let activeTraps = []; // Array to store active trap areas

// Game mode variables
let gameMode = 'human'; // 'human' for Human vs Human, 'ai' for Human vs AI
let isAIPlayer2 = false; // Track if Player 2 is AI
let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
let aiThinking = false; // Track if AI is thinking

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
    console.log('showPlayerNameModal() called');
    
    // Reset mode selection to default
    gameMode = 'human';
    isAIPlayer2 = false;
    selectGameMode('human'); // This will update the UI
    
    // Set neutral background for name selection
    const body = document.body;
    body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    body.style.transition = 'background 0.5s ease';
    
    const modal = document.getElementById('player-name-modal');
    if (!modal) {
        console.error('Modal element not found!');
        return;
    }
    
    modal.style.display = 'flex';
    console.log('Modal display set to flex');
    
    // Clear previous event listeners by cloning inputs
    const player1Input = document.getElementById('player1-name');
    const player2Input = document.getElementById('player2-name');
    
    if (player1Input && player2Input) {
        // Remove existing event listeners by replacing with clones
        const newPlayer1Input = player1Input.cloneNode(true);
        const newPlayer2Input = player2Input.cloneNode(true);
        
        player1Input.parentNode.replaceChild(newPlayer1Input, player1Input);
        player2Input.parentNode.replaceChild(newPlayer2Input, player2Input);
        
        // Add fresh event listeners
        newPlayer1Input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                newPlayer2Input.focus();
            }
        });
        
        newPlayer2Input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                startGameWithNames();
            }
        });
        
        // Focus on first input with delay
        setTimeout(() => {
            newPlayer1Input.focus();
        }, 100);
        
        console.log('Modal setup complete');
    } else {
        console.error('Input elements not found!');
    }
}

// Select game mode
function selectGameMode(mode) {
    gameMode = mode;
    
    // Update button states
    document.getElementById('human-mode-btn').classList.remove('active');
    document.getElementById('ai-mode-btn').classList.remove('active');
    
    if (mode === 'human') {
        document.getElementById('human-mode-btn').classList.add('active');
        document.getElementById('ai-difficulty-section').style.display = 'none';
        document.getElementById('player2-input').style.display = 'block';
        isAIPlayer2 = false;
    } else if (mode === 'ai') {
        document.getElementById('ai-mode-btn').classList.add('active');
        document.getElementById('ai-difficulty-section').style.display = 'block';
        document.getElementById('player2-input').style.display = 'none';
        isAIPlayer2 = true;
    }
    
    console.log('Game mode selected:', mode);
}

// Select AI difficulty
function selectAIDifficulty(difficulty) {
    aiDifficulty = difficulty;
    
    // Update button states
    document.getElementById('easy-btn').classList.remove('active');
    document.getElementById('medium-btn').classList.remove('active');
    document.getElementById('hard-btn').classList.remove('active');
    
    document.getElementById(difficulty + '-btn').classList.add('active');
    
    console.log('AI difficulty selected:', difficulty);
}

// Start game with custom names
function startGameWithNames() {
    const player1Input = document.getElementById('player1-name').value.trim();
    
    // Use custom names or default if empty
    player1Name = player1Input || 'Pemain 1';
    
    if (isAIPlayer2) {
        // AI mode
        let aiNamePrefix = '';
        switch(aiDifficulty) {
            case 'easy': aiNamePrefix = 'AI Mudah'; break;
            case 'medium': aiNamePrefix = 'AI Sederhana'; break;
            case 'hard': aiNamePrefix = 'AI Sukar'; break;
            default: aiNamePrefix = 'AI';
        }
        player2Name = aiNamePrefix + ' 🤖';
    } else {
        // Human vs Human mode
        const player2Input = document.getElementById('player2-name').value.trim();
        player2Name = player2Input || 'Pemain 2';
    }
    
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
    
    console.log(`Game started - Mode: ${gameMode}, Player 1: ${player1Name}, Player 2: ${player2Name}`);
}

// Use default names and start game
function useDefaultNames() {
    player1Name = 'Pemain 1';
    
    if (isAIPlayer2) {
        // AI mode
        let aiNamePrefix = '';
        switch(aiDifficulty) {
            case 'easy': aiNamePrefix = 'AI Mudah'; break;
            case 'medium': aiNamePrefix = 'AI Sederhana'; break;
            case 'hard': aiNamePrefix = 'AI Sukar'; break;
            default: aiNamePrefix = 'AI';
        }
        player2Name = aiNamePrefix + ' 🤖';
    } else {
        // Human vs Human mode
        player2Name = 'Pemain 2';
    }
    
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
    
    // Create grid labels first
    createGridLabels();
    
    // Create dots using manual positions
    dotPositions.forEach(pos => {
        const intersection = document.createElement('div');
        intersection.className = 'intersection';
        intersection.dataset.row = pos.row;
        intersection.dataset.col = pos.col;
        
        // Add coordinate tooltip
        intersection.title = `L${pos.row}, B${pos.col}`;
        
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

// Create grid coordinate labels
function createGridLabels() {
    const board = document.getElementById('game-board');
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    
    // Create left side labels (L1, L2, ... L9)
    for (let row = 1; row <= 9; row++) {
        const leftLabel = document.createElement('div');
        leftLabel.className = 'grid-label left-label';
        leftLabel.textContent = `L${row}`;
        leftLabel.style.position = 'absolute';
        leftLabel.style.left = '5px';
        leftLabel.style.top = (row * spacing - 8) + 'px';
        leftLabel.style.fontSize = isMobile ? '10px' : '12px';
        leftLabel.style.fontWeight = 'bold';
        leftLabel.style.color = '#ffffff';
        leftLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        leftLabel.style.zIndex = '20';
        leftLabel.style.pointerEvents = 'none';
        leftLabel.style.userSelect = 'none';
        board.appendChild(leftLabel);
    }
    
    // Create bottom labels (B1, B2, ... B9)
    for (let col = 1; col <= 9; col++) {
        const bottomLabel = document.createElement('div');
        bottomLabel.className = 'grid-label bottom-label';
        bottomLabel.textContent = `B${col}`;
        bottomLabel.style.position = 'absolute';
        bottomLabel.style.left = (col * spacing - 8) + 'px';
        bottomLabel.style.top = (9 * spacing + 25) + 'px';
        bottomLabel.style.fontSize = isMobile ? '10px' : '12px';
        bottomLabel.style.fontWeight = 'bold';
        bottomLabel.style.color = '#ffffff';
        bottomLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        bottomLabel.style.zIndex = '20';
        bottomLabel.style.pointerEvents = 'none';
        bottomLabel.style.userSelect = 'none';
        board.appendChild(bottomLabel);
    }
}

// Place a dot on the grid
function placeDot(row, col, element) {
    if (!gameActive || gameBoard[row][col] !== 0 || element.classList.contains('captured')) {
        return; // Can't place dot if game is over, position is occupied, or already captured
    }
    
    // Check if placing dot in an enemy trap
    if (checkIfInTrap(row, col, currentPlayer)) {
        // Place the dot first
        gameBoard[row][col] = currentPlayer;
        
        // Update visual representation
        if (currentPlayer === 1) {
            element.classList.add('player1', 'placed');
        } else {
            element.classList.add('player2', 'placed');
        }
        
        // Find the trap that contains this position
        const activeTrap = activeTraps.find(trap => 
            trap.owner !== currentPlayer && isPositionInTrap(row, col, trap)
        );
        
        // Immediately capture the dot since it's in a trap
        setTimeout(() => {
            element.classList.remove('placed');
            element.classList.remove('player1', 'player2');
            element.classList.add('captured');
            gameBoard[row][col] = 0; // Remove from game board
            
            // Draw enclosure lines around the trap
            if (activeTrap) {
                drawTrapEnclosure(activeTrap);
            }
            
            // Award capture points to the trap owner
            const trapOwner = currentPlayer === 1 ? 2 : 1;
            if (trapOwner === 1) {
                player1Captures++;
                player1Score += 2;
            } else {
                player2Captures++;
                player2Score += 2;
            }
            
            updateScores();
            createCaptureOverlay(row, col);
            console.log(`Dot captured in trap at [${row},${col}]!`);
        }, 300);
        
        // Switch players
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerTurn();
        return;
    }
    
    // Place the dot normally
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
    
    // Check for new traps created by this move
    checkForNewTraps();
    
    // Check for winning conditions (optional - you can implement pattern matching)
    checkGameState();
    
    // Switch players
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerTurn();
    
    // If next player is AI, make AI move
    if (isAIPlayer2 && currentPlayer === 2 && gameActive) {
        setTimeout(() => {
            makeAIMove();
        }, 1000); // 1 second delay to make it feel more natural
    }
}

// Update the current player display
function updatePlayerTurn() {
    const playerTurnElement = document.getElementById('current-player');
    const body = document.body;
    
    if (currentPlayer === 1) {
        playerTurnElement.textContent = `${player1Name} (Hitam)`;
        playerTurnElement.style.color = '#2c3e50';
        
        // Change background to dark theme for player 1 (Hitam)
        body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)';
        body.style.transition = 'background 0.5s ease';
        
    } else {
        if (isAIPlayer2 && aiThinking) {
            playerTurnElement.innerHTML = `${player2Name} (Merah)<br><span class="ai-thinking">🤔 Sedang berfikir...</span>`;
        } else {
            playerTurnElement.textContent = `${player2Name} (Merah)`;
        }
        playerTurnElement.style.color = '#e74c3c';
        
        // Change background to red theme for player 2 (Merah)
        body.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #e74c3c 100%)';
        body.style.transition = 'background 0.5s ease';
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

// Draw enclosure lines around a triggered trap
function drawTrapEnclosure(trap) {
    const board = document.getElementById('game-board');
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    
    // Find the perimeter of the trap by getting boundary dots
    const boundaryConnections = findTrapBoundaryConnections(trap.boundaryDots);
    
    boundaryConnections.forEach(([start, end]) => {
        const line = document.createElement('div');
        line.className = 'trap-enclosure-line';
        
        // Add color class based on trap owner
        if (trap.owner === 1) {
            line.classList.add('player1-trap-line');
        } else {
            line.classList.add('player2-trap-line');
        }
        
        const x1 = start.col * spacing;
        const y1 = start.row * spacing;
        const x2 = end.col * spacing;
        const y2 = end.row * spacing;
        
        // Calculate line position and rotation
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.left = x1 + 'px';
        line.style.top = y1 + 'px';
        line.style.width = length + 'px';
        line.style.height = '2px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        board.appendChild(line);
        
        // Animate the line appearance
        setTimeout(() => {
            line.classList.add('trap-line-animation');
        }, 100);
    });
}

// Find connections between boundary dots to form the trap perimeter
function findTrapBoundaryConnections(boundaryDots) {
    const connections = [];
    
    // Sort boundary dots to create a proper perimeter
    // For each boundary dot, find adjacent boundary dots
    for (let i = 0; i < boundaryDots.length; i++) {
        for (let j = i + 1; j < boundaryDots.length; j++) {
            const dot1 = boundaryDots[i];
            const dot2 = boundaryDots[j];
            
            // Check if they are adjacent (horizontally, vertically, or diagonally)
            const rowDiff = Math.abs(dot1.row - dot2.row);
            const colDiff = Math.abs(dot1.col - dot2.col);
            
            if ((rowDiff <= 1 && colDiff <= 1) && (rowDiff + colDiff > 0)) {
                // Additional check: ensure this connection forms part of the perimeter
                if (isPerimeterConnection(dot1, dot2, boundaryDots)) {
                    connections.push([dot1, dot2]);
                }
            }
        }
    }
    
    return connections;
}

// Check if a connection between two dots is part of the perimeter
function isPerimeterConnection(dot1, dot2, allBoundaryDots) {
    // This is a simplified check - in a more complex implementation,
    // you might want to ensure the line doesn't cross through the enclosed area
    return true;
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

// Check if a position is inside an active trap
function checkIfInTrap(row, col, player) {
    for (const trap of activeTraps) {
        if (trap.owner !== player && isPositionInTrap(row, col, trap)) {
            return true;
        }
    }
    return false;
}

// Check if a position is within a trap area
function isPositionInTrap(row, col, trap) {
    return trap.emptySpaces.some(pos => pos.row === row && pos.col === col);
}

// Check for new traps created by the current move
function checkForNewTraps() {
    const newTraps = findEnclosedAreas(currentPlayer);
    
    for (const newTrap of newTraps) {
        // Check if this trap already exists
        const trapExists = activeTraps.some(existingTrap => 
            existingTrap.owner === currentPlayer &&
            arraysEqual(existingTrap.emptySpaces, newTrap.emptySpaces)
        );
        
        if (!trapExists && newTrap.emptySpaces.length > 0) {
            activeTraps.push(newTrap);
            // Don't visualize trap - keep it hidden
            console.log(`New trap created by player ${currentPlayer} with ${newTrap.emptySpaces.length} empty spaces`);
        }
    }
}

// Find enclosed empty areas for a player
function findEnclosedAreas(player) {
    const traps = [];
    const visited = new Set();
    
    // Check all empty spaces to see if they're enclosed
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 0 && !visited.has(`${row},${col}`)) {
                const enclosedArea = getEnclosedArea(row, col, player, visited);
                if (enclosedArea.isEnclosed && enclosedArea.emptySpaces.length > 0) {
                    traps.push({
                        owner: player,
                        emptySpaces: enclosedArea.emptySpaces,
                        boundaryDots: enclosedArea.boundaryDots
                    });
                }
            }
        }
    }
    
    return traps;
}

// Get enclosed area starting from an empty position
function getEnclosedArea(startRow, startCol, player, visited) {
    const emptySpaces = [];
    const boundaryDots = new Set();
    const toCheck = [[startRow, startCol]];
    let isEnclosed = true;
    
    while (toCheck.length > 0) {
        const [row, col] = toCheck.pop();
        const key = `${row},${col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // If we're outside the grid, this area is not enclosed
        if (row < 1 || row > 9 || col < 1 || col > 9) {
            isEnclosed = false;
            continue;
        }
        
        if (gameBoard[row][col] === 0) {
            emptySpaces.push({row, col});
            
            // Check all 4 directions
            const neighbors = [
                [row - 1, col], [row + 1, col],
                [row, col - 1], [row, col + 1]
            ];
            
            for (const [newRow, newCol] of neighbors) {
                const newKey = `${newRow},${newCol}`;
                if (!visited.has(newKey)) {
                    toCheck.push([newRow, newCol]);
                }
            }
        } else if (gameBoard[row][col] === player) {
            boundaryDots.add(`${row},${col}`);
        } else {
            // Enemy dot - this breaks the enclosure
            isEnclosed = false;
        }
    }
    
    // Additional check: ensure the area is completely surrounded
    if (isEnclosed && emptySpaces.length > 0) {
        for (const space of emptySpaces) {
            const neighbors = [
                [space.row - 1, space.col], [space.row + 1, space.col],
                [space.row, space.col - 1], [space.row, space.col + 1]
            ];
            
            for (const [nRow, nCol] of neighbors) {
                if (nRow >= 1 && nRow <= 9 && nCol >= 1 && nCol <= 9) {
                    if (gameBoard[nRow][nCol] !== player && gameBoard[nRow][nCol] !== 0) {
                        isEnclosed = false;
                        break;
                    }
                }
            }
            if (!isEnclosed) break;
        }
    }
    
    return {
        isEnclosed,
        emptySpaces,
        boundaryDots: Array.from(boundaryDots).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return {row, col};
        })
    };
}

// Visualize trap area with overlay
function visualizeTrap(trap) {
    const board = document.getElementById('game-board');
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    
    trap.emptySpaces.forEach(space => {
        const overlay = document.createElement('div');
        overlay.className = 'trap-overlay';
        overlay.dataset.owner = trap.owner;
        
        const x = space.col * spacing;
        const y = space.row * spacing;
        
        overlay.style.left = x + 'px';
        overlay.style.top = y + 'px';
        overlay.innerHTML = '⚡'; // Lightning bolt to indicate trap
        
        board.appendChild(overlay);
    });
}

// Helper function to compare arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = arr1.slice().sort((a, b) => a.row - b.row || a.col - b.col);
    const sorted2 = arr2.slice().sort((a, b) => a.row - b.row || a.col - b.col);
    
    return sorted1.every((item, index) => 
        item.row === sorted2[index].row && item.col === sorted2[index].col
    );
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
    
    // Reset background to neutral when game ends
    const body = document.body;
    body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    body.style.transition = 'background 0.5s ease';
    
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
    
    // Remove trap overlays
    const trapOverlays = document.querySelectorAll('.trap-overlay');
    trapOverlays.forEach(overlay => overlay.remove());
    
    // Remove attacker lines
    const attackerLines = document.querySelectorAll('.attacker-line');
    attackerLines.forEach(line => line.remove());
    
    // Remove trap enclosure lines
    const trapLines = document.querySelectorAll('.trap-enclosure-line');
    trapLines.forEach(line => line.remove());
    
    // Reset only game state, keep names and stats
    currentPlayer = 1;
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    player1Captures = 0;
    player2Captures = 0;
    gameStarted = true; // Keep game as started
    activeTraps = []; // Reset traps
    aiThinking = false; // Reset AI thinking state
    
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
    console.log('Reset & Tukar Nama button clicked');
    
    // Reset background to neutral
    const body = document.body;
    body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    body.style.transition = 'background 0.5s ease';
    
    // Remove any existing game over overlay
    const overlay = document.querySelector('.game-over');
    if (overlay) {
        overlay.remove();
    }
    
    // Remove capture overlays
    const captureOverlays = document.querySelectorAll('.capture-overlay');
    captureOverlays.forEach(overlay => overlay.remove());
    
    // Remove trap overlays
    const trapOverlays = document.querySelectorAll('.trap-overlay');
    trapOverlays.forEach(overlay => overlay.remove());
    
    // Remove attacker lines
    const attackerLines = document.querySelectorAll('.attacker-line');
    attackerLines.forEach(line => line.remove());
    
    // Remove trap enclosure lines
    const trapLines = document.querySelectorAll('.trap-enclosure-line');
    trapLines.forEach(line => line.remove());
    
    // Reset everything including names
    currentPlayer = 1;
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    player1Captures = 0;
    player2Captures = 0;
    gameStarted = false;
    namesSet = false; // Allow new names
    activeTraps = []; // Reset traps
    
    // Reset game mode variables
    gameMode = 'human';
    isAIPlayer2 = false;
    aiDifficulty = 'medium';
    aiThinking = false;
    
    // Reset names to default
    player1Name = 'Pemain 1';
    player2Name = 'Pemain 2';
    
    // Hide stats dashboard
    hideStatsDashboard();
    
    // Clear input fields
    const player1Input = document.getElementById('player1-name');
    const player2Input = document.getElementById('player2-name');
    if (player1Input) player1Input.value = '';
    if (player2Input) player2Input.value = '';
    
    // Clear game board
    const gameBoardElement = document.getElementById('game-board');
    if (gameBoardElement) {
        gameBoardElement.innerHTML = '';
    }
    
    // Reset game board array
    gameBoard = [];
    for (let i = 0; i <= gridSize; i++) {
        gameBoard[i] = [];
        for (let j = 0; j <= gridSize; j++) {
            gameBoard[i][j] = 0;
        }
    }
    
    console.log('About to show player name modal');
    // Show modal directly instead of calling initGame()
    showPlayerNameModal();
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
    if (event.key === 'Escape' && isFullScreen) {
        exitFullScreen();
    } else if (event.key === 'f' || event.key === 'F') {
        if (event.ctrlKey) { // Ctrl+F for full screen
            event.preventDefault();
            toggleFullScreen();
        }
    } else if (event.key === 'n' || event.key === 'N') {
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
    const leftLabels = document.querySelectorAll('.left-label');
    const bottomLabels = document.querySelectorAll('.bottom-label');
    
    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 40 : 50;
    
    // Manual repositioning for responsive design
    intersections.forEach(intersection => {
        const row = parseInt(intersection.dataset.row);
        const col = parseInt(intersection.dataset.col);
        
        const x = col * spacing;
        const y = row * spacing;
        intersection.style.left = x + 'px';
        intersection.style.top = y + 'px';
    });
    
    // Adjust left labels (L1, L2, etc.)
    leftLabels.forEach((label, index) => {
        const row = index + 1;
        label.style.top = (row * spacing - 8) + 'px';
        label.style.fontSize = isMobile ? '10px' : '12px';
    });
    
    // Adjust bottom labels (B1, B2, etc.)
    bottomLabels.forEach((label, index) => {
        const col = index + 1;
        label.style.left = (col * spacing - 8) + 'px';
        label.style.top = (9 * spacing + 25) + 'px';
        label.style.fontSize = isMobile ? '10px' : '12px';
    });
    
    console.log(`Manual repositioning completed for ${isMobile ? 'mobile' : 'desktop'} view`);
}

// ===== AI FUNCTIONS =====

// Make AI move
function makeAIMove() {
    if (!gameActive || currentPlayer !== 2 || !isAIPlayer2) return;
    
    aiThinking = true;
    updatePlayerTurn();
    
    // Get AI move based on difficulty
    setTimeout(() => {
        const move = getAIMove();
        if (move) {
            const element = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (element) {
                aiThinking = false;
                placeDot(move.row, move.col, element);
            }
        }
    }, 500 + Math.random() * 1500); // Random thinking time
}

// Get AI move based on difficulty
function getAIMove() {
    switch(aiDifficulty) {
        case 'easy': return getEasyAIMove();
        case 'medium': return getMediumAIMove();
        case 'hard': return getHardAIMove();
        default: return getMediumAIMove();
    }
}

// Easy AI - Random valid moves
function getEasyAIMove() {
    const validMoves = [];
    
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 0) {
                validMoves.push({row, col});
            }
        }
    }
    
    if (validMoves.length > 0) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    return null;
}

// Medium AI - Prefer center and avoid traps
function getMediumAIMove() {
    const validMoves = [];
    const centerMoves = [];
    const safeMoves = [];
    
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 0) {
                const move = {row, col};
                validMoves.push(move);
                
                // Check if it's in enemy trap
                if (!checkIfInTrap(row, col, 2)) {
                    safeMoves.push(move);
                    
                    // Prefer center positions
                    if (row >= 4 && row <= 6 && col >= 4 && col <= 6) {
                        centerMoves.push(move);
                    }
                }
            }
        }
    }
    
    // Priority: center safe moves > safe moves > any valid moves
    if (centerMoves.length > 0) {
        return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    } else if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    } else if (validMoves.length > 0) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    return null;
}

// Hard AI - Strategic moves with trap creation
function getHardAIMove() {
    // First, try to create traps
    const trapMove = findTrapCreationMove();
    if (trapMove) return trapMove;
    
    // Then, try to capture opponent pieces
    const captureMove = findCaptureMove();
    if (captureMove) return captureMove;
    
    // Then, try defensive moves
    const defensiveMove = findDefensiveMove();
    if (defensiveMove) return defensiveMove;
    
    // Fall back to medium AI
    return getMediumAIMove();
}

// Find move that creates a trap
function findTrapCreationMove() {
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 0) {
                // Simulate placing AI dot
                gameBoard[row][col] = 2;
                
                // Check if this creates a trap
                const traps = findEnclosedAreas(2);
                
                // Remove simulation
                gameBoard[row][col] = 0;
                
                if (traps.length > 0) {
                    return {row, col};
                }
            }
        }
    }
    return null;
}

// Find move that captures opponent pieces
function findCaptureMove() {
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 0) {
                // Simulate placing AI dot
                gameBoard[row][col] = 2;
                
                // Check if this captures any opponent pieces
                let capturesFound = false;
                for (let r = 1; r <= 9 && !capturesFound; r++) {
                    for (let c = 1; c <= 9 && !capturesFound; c++) {
                        if (gameBoard[r][c] === 1) {
                            const surroundingInfo = isSurrounded(r, c, 1);
                            if (surroundingInfo.isSurrounded) {
                                capturesFound = true;
                            }
                        }
                    }
                }
                
                // Remove simulation
                gameBoard[row][col] = 0;
                
                if (capturesFound) {
                    return {row, col};
                }
            }
        }
    }
    return null;
}

// Find defensive move to prevent being captured
function findDefensiveMove() {
    // Check if AI pieces are in danger
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            if (gameBoard[row][col] === 2) {
                // Check adjacent empty spaces
                const neighbors = [
                    [row - 1, col], [row + 1, col],
                    [row, col - 1], [row, col + 1]
                ];
                
                for (const [r, c] of neighbors) {
                    if (r >= 1 && r <= 9 && c >= 1 && c <= 9 && gameBoard[r][c] === 0) {
                        // Check if placing here prevents capture
                        gameBoard[r][c] = 2;
                        const surroundingInfo = isSurrounded(row, col, 2);
                        gameBoard[r][c] = 0;
                        
                        if (!surroundingInfo.isSurrounded) {
                            return {row: r, col: c};
                        }
                    }
                }
            }
        }
    }
    return null;
}

// ===== FULL SCREEN MODE FUNCTIONS =====

let isFullScreen = false;

// Toggle full screen mode
function toggleFullScreen() {
    if (isFullScreen) {
        exitFullScreen();
    } else {
        enterFullScreen();
    }
}

// Enter full screen mode
function enterFullScreen() {
    isFullScreen = true;
    document.body.classList.add('fullscreen-mode');
    
    // Update toggle button
    const toggleBtn = document.querySelector('.fullscreen-toggle');
    toggleBtn.innerHTML = '⛶';
    toggleBtn.title = 'Exit Full Screen';
    
    // Add exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'exit-fullscreen';
    exitBtn.innerHTML = '← Keluar';
    exitBtn.onclick = exitFullScreen;
    document.querySelector('.container').appendChild(exitBtn);
    
    console.log('Entered full screen mode');
}

// Exit full screen mode
function exitFullScreen() {
    isFullScreen = false;
    document.body.classList.remove('fullscreen-mode');
    
    // Update toggle button
    const toggleBtn = document.querySelector('.fullscreen-toggle');
    toggleBtn.innerHTML = '🔳';
    toggleBtn.title = 'Toggle Full Screen';
    
    // Remove exit button
    const exitBtn = document.querySelector('.exit-fullscreen');
    if (exitBtn) {
        exitBtn.remove();
    }
    
    console.log('Exited full screen mode');
}
