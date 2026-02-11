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
    if (germanyDate.getMonth() === 1) {
        return germanyDate.getDate();
    }
    return -1;
}

// ==================== Page Routing ====================
function showDay(day) {
    document.querySelectorAll('.day-section').forEach(section => {
        section.classList.add('hidden');
    });
    stopHugGame();

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
            sectionId = 'promise-day';
            initPromiseDay();
            break;
        case 12:
            sectionId = 'hug-day';
            initHugDay();
            break;
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
        13: '💋 Kiss Day 💋',
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

    const pairs = [...ROSE_EMOJIS, ...ROSE_EMOJIS];
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

    wrongAnswer.style.animation = 'none';
    wrongAnswer.offsetHeight;
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

    const fallDuration = 2 + Math.random() * 2;
    chocolate.style.animationDuration = fallDuration + 's';

    chocolate.addEventListener('click', (e) => catchChocolate(e, chocolate));
    chocolate.addEventListener('touchstart', (e) => {
        e.preventDefault();
        catchChocolate(e, chocolate);
    }, { passive: false });

    arena.appendChild(chocolate);
    chocolatesSpawned++;

    setTimeout(() => {
        if (chocolate.parentNode) {
            chocolate.remove();
        }
    }, fallDuration * 1000);

    const nextSpawnDelay = 400 + Math.random() * 600;
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

// ==================== PROMISE DAY ====================
let promisesCompleted = 0;

function initPromiseDay() {
    promisesCompleted = 0;

    document.querySelectorAll('.promise-card').forEach((card, index) => {
        card.classList.remove('completed');
        if (index === 0) {
            card.classList.remove('locked');
        } else {
            card.classList.add('locked');
        }
        card.querySelector('.promise-wrong').classList.add('hidden');
        card.querySelector('.promise-accepted').classList.add('hidden');
        card.querySelector('.promise-buttons').style.display = 'flex';
    });

    document.getElementById('promise-complete').classList.add('hidden');

    // Attach click handlers (clone to avoid duplicate listeners)
    document.querySelectorAll('.promise-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', handlePromiseClick);
    });
}

function handlePromiseClick(e) {
    const btn = e.target;
    const card = btn.closest('.promise-card');
    const isCorrect = btn.dataset.correct === 'true';

    if (isCorrect) {
        card.classList.add('completed');
        card.querySelector('.promise-accepted').classList.remove('hidden');
        card.querySelector('.promise-wrong').classList.add('hidden');
        promisesCompleted++;

        // Unlock next card
        const nextCard = card.nextElementSibling;
        if (nextCard && nextCard.classList.contains('promise-card')) {
            setTimeout(() => {
                nextCard.classList.remove('locked');
            }, 500);
        }

        // All done?
        if (promisesCompleted === 3) {
            setTimeout(() => {
                document.getElementById('promise-complete').classList.remove('hidden');
                createConfetti();
            }, 800);
        }
    } else {
        const wrongMsg = card.querySelector('.promise-wrong');
        wrongMsg.classList.remove('hidden');

        wrongMsg.style.animation = 'none';
        wrongMsg.offsetHeight;
        wrongMsg.style.animation = null;
    }
}

// ==================== HUG DAY - Reaction Game ====================
let hugMeter = 0;
let hugGameActive = false;
let hugGlowInterval = null;
let hugDrainInterval = null;
let currentGlowingBtn = null;

function initHugDay() {
    hugMeter = 0;
    hugGameActive = true;
    updateHugMeter();

    document.getElementById('hug-complete').classList.add('hidden');

    const buttons = document.querySelectorAll('.hug-btn');
    buttons.forEach(btn => {
        btn.classList.remove('glowing', 'wrong-tap');

        // Clone to clear old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', handleHugTap);
        newBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleHugTap(e);
        }, { passive: false });
    });

    // Start glow cycle
    startGlowCycle();

    // Start drain - meter slowly goes down
    hugDrainInterval = setInterval(() => {
        if (!hugGameActive) return;
        hugMeter = Math.max(0, hugMeter - 1.5);
        updateHugMeter();
    }, 200);
}

function startGlowCycle() {
    if (hugGlowInterval) clearInterval(hugGlowInterval);

    setRandomGlow();
    hugGlowInterval = setInterval(() => {
        if (!hugGameActive) return;
        setRandomGlow();
    }, 1200);
}

function setRandomGlow() {
    const buttons = document.querySelectorAll('.hug-btn');
    buttons.forEach(b => b.classList.remove('glowing'));

    const index = Math.floor(Math.random() * 3);
    buttons[index].classList.add('glowing');
    currentGlowingBtn = buttons[index];
}

function handleHugTap(e) {
    if (!hugGameActive) return;

    const btn = e.target.closest('.hug-btn');
    if (!btn) return;

    if (btn.classList.contains('glowing')) {
        // Correct tap!
        hugMeter = Math.min(100, hugMeter + 8);
        updateHugMeter();

        btn.classList.remove('glowing');

        // Immediately pick a new glowing button
        setRandomGlow();
        if (hugGlowInterval) clearInterval(hugGlowInterval);
        hugGlowInterval = setInterval(() => {
            if (!hugGameActive) return;
            setRandomGlow();
        }, 1200);

        if (hugMeter >= 100) {
            hugGameComplete();
        }
    } else {
        // Wrong button - penalty
        hugMeter = Math.max(0, hugMeter - 5);
        updateHugMeter();

        btn.classList.add('wrong-tap');
        setTimeout(() => btn.classList.remove('wrong-tap'), 300);
    }
}

function updateHugMeter() {
    const fill = document.getElementById('hug-meter-fill');
    const label = document.getElementById('hug-meter-label');
    if (fill && label) {
        fill.style.width = hugMeter + '%';
        label.textContent = Math.round(hugMeter) + '%';
    }
}

function hugGameComplete() {
    hugGameActive = false;
    stopHugGame();

    document.getElementById('hug-complete').classList.remove('hidden');
    createConfetti();
}

function stopHugGame() {
    hugGameActive = false;
    if (hugGlowInterval) {
        clearInterval(hugGlowInterval);
        hugGlowInterval = null;
    }
    if (hugDrainInterval) {
        clearInterval(hugDrainInterval);
        hugDrainInterval = null;
    }
}

// ==================== Dev Controls ====================
function initDevControls() {
    const toggleBtn = document.getElementById('toggle-dev');
    const devPanel = document.getElementById('dev-panel');
    const dateOverride = document.getElementById('date-override');

    if (!toggleBtn || !devPanel || !dateOverride) return;

    toggleBtn.addEventListener('click', () => {
        devPanel.classList.toggle('hidden');
    });

    dateOverride.addEventListener('change', () => {
        showDay(getCurrentDay());
    });
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    initDevControls();
    createFloatingHearts();
    showDay(getCurrentDay());

    // Close win modal
    document.getElementById('close-win').addEventListener('click', () => {
        document.getElementById('win-modal').classList.add('hidden');
    });

    // Restart game button
    document.getElementById('restart-btn').addEventListener('click', initMemoryGame);

    // Close promise modal
    document.getElementById('close-promise')?.addEventListener('click', () => {
        document.getElementById('promise-complete').classList.add('hidden');
    });

    // Close hug modal
    document.getElementById('close-hug')?.addEventListener('click', () => {
        document.getElementById('hug-complete').classList.add('hidden');
    });
});
