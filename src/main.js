const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = { 'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10 };

const STRATEGY = {
    HARD: {
        17: "SSSSSSSSSS", 16: "SSSSSHHHHH", 15: "SSSSSHHHHH", 14: "SSSSSHHHHH",
        13: "SSSSSHHHHH", 12: "HHSSSHHHHH", 11: "DDDDDDDDDD", 10: "DDDDDDDDHH",
        9:  "HDDDDHHHHH", 8:  "HHHHHHHHHH"
    },
    SOFT: {
        "A9": "SSSSSSSSSS", "A8": "SSSSSDSSSS", "A7": "DDDDDSSHHH", "A6": "HDDDDHHHHH",
        "A5": "HHDDDHHHHH", "A4": "HHDDDHHHHH", "A3": "HHHDDHHHHH", "A2": "HHHDDHHHHH"
    },
    PAIRS: {
        "AA": "PPPPPPPPPP", "TT": "SSSSSSSSSS", "99": "PPPPPSPPSS", "88": "PPPPPPPPPP",
        "77": "PPPPPPНННН", "66": "PPPPPHHHHH", "55": "DDDDDDDDHH", "44": "HHHPPHHHHH",
        "33": "PPPPPPНННН", "22": "PPPPPPНННН"
    }
};

const hide = (id) => document.getElementById(id).classList.add('hidden');
const show = (id) => document.getElementById(id).classList.remove('hidden');

let gameMode = null;
let runningCount = 0;
let tempCountInput = 0;
let playerHands = [[], [], []];
let currentHandIdx = 0;
let dealerHand = [];
let stats = { strat: {c:0, t:0}, bet: {c:0, t:0}, count: {c:0, t:0} };

function selectMode(mode) {
    gameMode = mode;
    runningCount = 0;
    stats = { strat: {c:0, t:0}, bet: {c:0, t:0}, count: {c:0, t:0} };
    updateStatsDisplay();
    hide('menu-screen');
    show('game-screen');
    document.getElementById('stats-bar').classList.toggle('opacity-20', mode === 'STRATEGY');
    startFlow();
}

function exitToMenu() {
    hide('game-screen');
    show('menu-screen');
    gameMode = null;
}

function startFlow() {
    tempCountInput = 0; 
    document.getElementById('temp-count-display').innerText = tempCountInput;
    document.getElementById('feedback-msg').innerText = "";
    hide('next-btn');

    if (gameMode === 'COUNT') {
        showUI('pre-counting-ui');
        document.getElementById('dealer-hand').innerHTML = '';
        playerHands = [[], [], []];
        renderHands();
    } else {
        dealPhase();
    }
}

function verifyPreCount() {
    stats.count.t++;
    if (tempCountInput === runningCount) {
        stats.count.c++;
        document.getElementById('feedback-msg').innerHTML = "<span class='text-emerald-400'>Count Correct!</span>";
        showUI('betting-ui');
    } else {
        document.getElementById('feedback-msg').innerHTML = `<span class='text-red-400'>Incorrect! Count is ${runningCount}</span>`;
    }
    updateStatsDisplay();
}

function handleBetAction(choice) {
    if (gameMode === 'COUNT') stats.bet.t++;
    const correct = (runningCount >= 2 && choice === 'MAX') || (runningCount < 2 && choice === 'MIN');
    if (correct) {
        if (gameMode === 'COUNT') stats.bet.c++;
        document.getElementById('feedback-msg').innerHTML = "<span class='text-emerald-400'>Correct Bet!</span>";
    } else {
        document.getElementById('feedback-msg').innerHTML = `<span class='text-red-400'>Wrong Bet! Count was ${runningCount}</span>`;
    }
    updateStatsDisplay();
    
    if (gameMode === 'COUNT') {
        dealAndAutoPlay();
    } else {
        dealPhase();
    }
}

async function dealAndAutoPlay() {
    currentHandIdx = 0;
    document.getElementById('feedback-msg').innerText = "Dealing...";
    
    dealerHand = [drawCard(), drawCard()]; 
    playerHands = [[drawCard(), drawCard()], [drawCard(), drawCard()], [drawCard(), drawCard()]];
    
    renderHands();
    const $dealer = document.getElementById('dealer-hand');
    $dealer.innerHTML = renderCard(dealerHand[0]) + `<div class="card dealer-card-back">?</div>`;
    
    await sleep(800);

    for (let i = 0; i < 3; i++) {
        currentHandIdx = i;
        renderHands();
        await sleep(400);
        
        while (true) {
            const optimal = getOptimalMove(playerHands[i], dealerHand[0]);
            if (optimal === 'S') break;
            
            playerHands[i].push(drawCard());
            renderHands();
            await sleep(500);
            
            if (getHandTotal(playerHands[i]) >= 21) break;
            if (optimal === 'D') break;
        }
    }

    currentHandIdx = -1; 
    renderHands();
    document.getElementById('feedback-msg').innerText = "Dealer plays...";
    
    $dealer.innerHTML = dealerHand.map(renderCard).join('');
    await sleep(800);

    while (true) {
        const total = getHandTotal(dealerHand);
        let hasSoftAce = false;
        let sum = 0;
        dealerHand.forEach(c => sum += VALUES[c.rank]);
        let aces = dealerHand.filter(c => c.rank === 'A').length;
        while (sum > 21 && aces > 0) { sum -= 10; aces--; }
        if (sum === 17 && aces > 0) hasSoftAce = true;

        if (total < 17 || (total === 17 && hasSoftAce)) {
            dealerHand.push(drawCard());
            $dealer.innerHTML = dealerHand.map(renderCard).join('');
            await sleep(800);
        } else {
            break;
        }
    }

    document.getElementById('feedback-msg').innerText = "";
    showUI('next-btn');
}

function dealPhase() {
    currentHandIdx = 0;
    playerHands = [[drawCard(), drawCard()], [drawCard(), drawCard()], [drawCard(), drawCard()]];
    dealerHand = [drawCard()]; 
    
    document.getElementById('dealer-hand').innerHTML = renderCard(dealerHand[0]);
    renderHands();
    showUI('playing-ui');
}

function handlePlayAction(move) {
    const currentHand = playerHands[currentHandIdx];
    const optimal = getOptimalMove(currentHand, dealerHand[0]);
    stats.strat.t++;

    if (move === optimal) {
        stats.strat.c++;
        document.getElementById('feedback-msg').innerHTML = `<span class='text-emerald-400'>Perfect!</span>`;
    } else {
        document.getElementById('feedback-msg').innerHTML = `<span class='text-red-400'>Wrong (Opt: ${optimal})</span>`;
    }
    updateStatsDisplay();

    if (currentHandIdx < 2) {
        currentHandIdx++;
        renderHands();
    } else {
        showUI('next-btn');
    }
}

function drawCard() {
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const card = { rank, suit: SUITS[Math.floor(Math.random() * SUITS.length)], value: VALUES[rank] };
    if (card.rank === '5') runningCount++;
    if (card.rank === 'A') runningCount--;
    return card;
}

function getHandTotal(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach(c => {
        total += VALUES[c.rank];
        if (c.rank === 'A') aces++;
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function getOptimalMove(hand, dealerCard) {
    const dealerIdx = ['2','3','4','5','6','7','8','9','10','A'].indexOf(dealerCard.rank);
    const total = getHandTotal(hand);
    let type = 'HARD', key = Math.min(Math.max(total, 8), 17);

    if (hand.length === 2) {
        if (hand[0].rank === hand[1].rank) {
            type = 'PAIRS'; key = (['10','J','Q','K'].includes(hand[0].rank) ? 'TT' : hand[0].rank + hand[0].rank);
        } else if (hand.some(c => c.rank === 'A')) {
            const other = hand.find(c => c.rank !== 'A');
            type = 'SOFT'; key = 'A' + (other ? VALUES[other.rank] : '1');
            if (key === 'A11') key = 'A1';
        }
    }
    return STRATEGY[type][key][dealerIdx];
}

function showUI(id) {
    ['pre-counting-ui', 'betting-ui', 'playing-ui', 'next-btn'].forEach(ui => {
        document.getElementById(ui).classList.toggle('hidden', ui !== id);
    });
    renderHands();
}

function adjustTempCount(n) {
    tempCountInput += n;
    document.getElementById('temp-count-display').innerText = tempCountInput;
}

function renderHands() {
    for (let i = 0; i < 3; i++) {
        const container = document.getElementById(`hand-${i}`);
        container.innerHTML = playerHands[i].length ? `
            <div class="flex -space-x-6">${playerHands[i].map(renderCard).join('')}</div>
            <p class="text-[10px] font-bold text-white/40 uppercase">Hand ${i+1}</p>
        ` : '';
        container.classList.toggle('active-hand', i === currentHandIdx && !document.getElementById('playing-ui').classList.contains('hidden'));
    }
}

function renderCard(card) {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return `<div class="card ${isRed ? 'red' : ''}">
        <div>${card.rank === '10' ? 'T' : card.rank}</div>
        <div class="text-center text-lg leading-none">${card.suit}</div>
        <div class="self-end rotate-180">${card.rank === '10' ? 'T' : card.rank}</div>
    </div>`;
}

function updateStatsDisplay() {
    const calc = (s) => s.t === 0 ? "100%" : Math.round((s.c / s.t) * 100) + "%";
    document.getElementById('strat-accuracy').innerText = calc(stats.strat);
    document.getElementById('bet-accuracy').innerText = calc(stats.bet);
    document.getElementById('count-accuracy').innerText = calc(stats.count);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
