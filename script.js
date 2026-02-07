// ==================== Date Management ====================
const GERMANY_TIMEZONE = 'Europe/Berlin';

function getGermanyDate() {
    const now = new Date();
    const germanyTime = new Date(now.toLocaleString('en-US', { timeZone: GERMANY_TIMEZONE }));
    return germanyTime;
}

function getCurrentDay() {
    const override = document.getElementById('date-override')?.value;
    if (override && override !== 'auto') {
        return parseInt(override);
    }
    const germanyDate = getGermanyDate();
    // Check if it's February
    if (germanyDate.getMonth() === 1) { // February is month 1 (0-indexed)
        return germanyDate.getDate();
    }
    return -1; // Not February
}

// ==================== Page Routing ====================
function showDay(day) {
    // Hide all sections
    document.querySelectorAll('.day-section').forEach(section => {
        section.classList.add('hidden');
    });

    let sectionId;
    switch (day) {
        case 7:
            sectionId = 'rose-day';
            initMemoryGame();
            break;
        case 8:
            sectionId = 'propose-day';
            initProposeDay();
            break;
        case 9:
            sectionId = 'chocolate-day';
            initChocolateGame();
            break;
        case 10:
            sectionId = 'teddy-day';
            break;
        case 11:
        case 12:
        case 13:
        case 14:
            sectionId = 'placeholder-day';
            updatePlaceholder(day);
            break;
        default:
            sectionId = 'not-yet';
    }

    document.getElementById(sectionId)?.classList.remove('hidden');
}

function updatePlaceholder(day) {
    const titles = {
        11: '💕 Feb 11 💕',
        12: '💋 Kiss Day 💋',
        13: '🤗 Hug Day 🤗',
        14: '❤️ Valentine\'s Day ❤️'
    };
    document.getElementById('placeholder-title').textContent = titles[day] || '💕';
}

// ==================== Floating Hearts Background ====================
function createFloatingHearts() {
    const container = document.getElementById('hearts-bg');
    const hearts = ['💕', '💗', '💖', '💝', '❤️', '🩷', '🌹'];

    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (5 + Math.random() * 5) + 's';
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 10000);
    }, 800);
}

// ==================== ROSE DAY - Memory Game ====================
const ROSE_EMOJIS = ['🌹', '🥀', '🌷', '🌸', '🌺', '🌻', '💐', '🪻', '🪷', '🏵️'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let consecutiveFails = 0;
let canFlip = true;

function initMemoryGame() {
    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;
    consecutiveFails = 0;
    canFlip = true;

    // Create pairs
    const pairs = [...ROSE_EMOJIS, ...ROSE_EMOJIS];
    // Shuffle using Fisher-Yates
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    const gameGrid = document.getElementById('memory-game');
    gameGrid.innerHTML = '';

    pairs.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="card-back"></div>
                <div class="card-front">${emoji}</div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameGrid.appendChild(card);
        memoryCards.push(card);
    });

    document.getElementById('fail-counter').classList.add('hidden');
    document.getElementById('restart-btn').classList.add('hidden');
    document.getElementById('win-modal').classList.add('hidden');
}

function flipCard(card) {
    if (!canFlip) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.emoji === card2.dataset.emoji;

    if (match) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        consecutiveFails = 0;

        flippedCards = [];
        canFlip = true;

        if (matchedPairs === ROSE_EMOJIS.length) {
            setTimeout(showWinModal, 500);
        }
    } else {
        consecutiveFails++;

        if (consecutiveFails >= 5) {
            showSkillIssue();
        }

        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

function showSkillIssue() {
    const failCounter = document.getElementById('fail-counter');
    failCounter.classList.remove('hidden');
    document.getElementById('fail-text').textContent = 'Skill Issue';

    setTimeout(() => {
        failCounter.classList.add('hidden');
    }, 2000);

    consecutiveFails = 0;
}

function showWinModal() {
    document.getElementById('win-modal').classList.remove('hidden');
    createConfetti();
}

function createConfetti() {
    const colors = ['#FF6B9D', '#FFD700', '#FF8A80', '#4CAF50', '#00BCD4'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

// ==================== PROPOSE DAY ====================
let proposalsAccepted = 0;

function initProposeDay() {
    proposalsAccepted = 0;

    document.querySelectorAll('.proposal-card').forEach(card => {
        card.classList.remove('completed');
        card.querySelector('.wrong-answer').classList.add('hidden');
        card.querySelector('.accepted').classList.add('hidden');
        card.querySelector('.proposal-buttons').style.display = 'flex';
    });

    document.querySelectorAll('.proposal-card .yes-btn').forEach(btn => {
        btn.addEventListener('click', handleProposalYes);
    });

    document.querySelectorAll('.proposal-card .no-btn').forEach(btn => {
        btn.addEventListener('click', handleProposalNo);
    });
}

function handleProposalYes(e) {
    const card = e.target.closest('.proposal-card');
    card.classList.add('completed');
    card.querySelector('.accepted').classList.remove('hidden');
    card.querySelector('.wrong-answer').classList.add('hidden');

    proposalsAccepted++;

    if (proposalsAccepted === 2) {
        setTimeout(() => {
            window.location.href = 'https://youtube.com/shorts/KUM2p2Weicg?si=CuGuh2liJPPwFWN4';
        }, 1500);
    }
}

function handleProposalNo(e) {
    const card = e.target.closest('.proposal-card');
    const wrongAnswer = card.querySelector('.wrong-answer');
    wrongAnswer.classList.remove('hidden');

    // Re-trigger animation
    wrongAnswer.style.animation = 'none';
    wrongAnswer.offsetHeight; // Trigger reflow
    wrongAnswer.style.animation = null;
}

// ==================== CHOCOLATE DAY - Catching Game ====================
let chocoScore = 0;
let chocoGameActive = false;
let chocolatesSpawned = 0;
const MAX_CHOCOLATES = 20;
const CHOCOLATES = ['🍫', '🍬', '🍭', '🧁', '🍩'];

function initChocolateGame() {
    chocoScore = 0;
    chocolatesSpawned = 0;
    chocoGameActive = false;

    document.getElementById('score').textContent = '0';
    document.getElementById('choco-arena').innerHTML = '';
    document.getElementById('choco-results').classList.add('hidden');
    document.getElementById('choco-game-area').style.display = 'block';
    document.getElementById('start-choco-game').style.display = 'inline-block';

    document.getElementById('start-choco-game').addEventListener('click', startChocolateGame);
    document.getElementById('replay-choco').addEventListener('click', () => {
        initChocolateGame();
        startChocolateGame();
    });
}

function startChocolateGame() {
    chocoGameActive = true;
    chocoScore = 0;
    chocolatesSpawned = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('start-choco-game').style.display = 'none';

    spawnChocolates();
}

function spawnChocolates() {
    if (!chocoGameActive || chocolatesSpawned >= MAX_CHOCOLATES) {
        if (chocolatesSpawned >= MAX_CHOCOLATES) {
            setTimeout(endChocolateGame, 2500);
        }
        return;
    }

    const arena = document.getElementById('choco-arena');
    const chocolate = document.createElement('div');
    chocolate.className = 'falling-chocolate';
    chocolate.textContent = CHOCOLATES[Math.floor(Math.random() * CHOCOLATES.length)];

    const arenaWidth = arena.offsetWidth;
    chocolate.style.left = (Math.random() * (arenaWidth - 50)) + 'px';

    const fallDuration = 2 + Math.random() * 2; // 2-4 seconds
    chocolate.style.animationDuration = fallDuration + 's';

    chocolate.addEventListener('click', (e) => catchChocolate(e, chocolate));
    chocolate.addEventListener('touchstart', (e) => {
        e.preventDefault();
        catchChocolate(e, chocolate);
    }, { passive: false });

    arena.appendChild(chocolate);
    chocolatesSpawned++;

    // Remove chocolate when it falls off screen
    setTimeout(() => {
        if (chocolate.parentNode) {
            chocolate.remove();
        }
    }, fallDuration * 1000);

    // Spawn next chocolate
    const nextSpawnDelay = 400 + Math.random() * 600; // 400-1000ms
    setTimeout(spawnChocolates, nextSpawnDelay);
}

function catchChocolate(e, chocolate) {
    if (chocolate.classList.contains('caught')) return;

    chocolate.classList.add('caught');
    chocoScore++;
    document.getElementById('score').textContent = chocoScore;

    setTimeout(() => {
        if (chocolate.parentNode) {
            chocolate.remove();
        }
    }, 300);
}

function endChocolateGame() {
    chocoGameActive = false;
    document.getElementById('choco-game-area').style.display = 'none';
    document.getElementById('choco-results').classList.remove('hidden');
    document.getElementById('final-score').textContent = chocoScore;

    if (chocoScore >= 15) {
        createConfetti();
    }
}

// ==================== Dev Controls (REMOVED FOR PRODUCTION) ====================
// Dev controls have been removed for deployment

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    showDay(getCurrentDay());

    // Close win modal
    document.getElementById('close-win').addEventListener('click', () => {
        document.getElementById('win-modal').classList.add('hidden');
    });

    // Restart game button
    document.getElementById('restart-btn').addEventListener('click', initMemoryGame);
});
