/**
 * POKÉMON BATTLE ARENA - SCRIPT
 * This file contains all the core logic for the Pokémon Battle Arena.
 * It manages the game state, handles user interactions, renders the UI,
 * and executes all game mechanics like attacks, status effects, and evolutions.
 */

// --- DATA CONSTANTS ---
// These are hardcoded data structures essential for game calculations.

// The Pokémon type effectiveness chart.
// Format: AttackingType: { DefendingType: multiplier, ... }
const typeChart = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fighting: { Normal: 2, Flying: 0.5, Poison: 0.5, Rock: 2, Bug: 0.5, Ghost: 0, Steel: 2, Psychic: 0.5, Ice: 2, Dark: 2, Fairy: 0.5 },
    Flying: { Fighting: 2, Rock: 0.5, Bug: 2, Steel: 0.5, Grass: 2, Electric: 0.5 },
    Poison: { Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Grass: 2, Fairy: 2 },
    Ground: { Flying: 0, Poison: 2, Rock: 2, Bug: 0.5, Steel: 2, Fire: 2, Grass: 0.5, Electric: 2 },
    Rock: { Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5, Fire: 2, Ice: 2 },
    Bug: { Fighting: 0.5, Flying: 0.5, Poison: 0.5, Ghost: 0.5, Steel: 0.5, Fire: 0.5, Grass: 2, Psychic: 2, Dark: 2, Fairy: 0.5 },
    Ghost: { Normal: 0, Ghost: 2, Psychic: 2, Dark: 0.5 },
    Steel: { Rock: 2, Steel: 0.5, Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Fairy: 2 },
    Fire: { Rock: 0.5, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Dragon: 0.5 },
    Water: { Ground: 2, Rock: 2, Fire: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
    Grass: { Flying: 0.5, Poison: 0.5, Ground: 2, Rock: 2, Bug: 0.5, Steel: 0.5, Fire: 0.5, Water: 2, Grass: 0.5, Dragon: 0.5 },
    Electric: { Flying: 2, Ground: 0, Water: 2, Grass: 0.5, Electric: 0.5, Dragon: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Steel: 0.5, Psychic: 0.5, Dark: 0 },
    Ice: { Flying: 2, Ground: 2, Steel: 0.5, Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Dragon: 2 },
    Dragon: { Steel: 0.5, Dragon: 2, Fairy: 0 },
    Dark: { Fighting: 0.5, Ghost: 2, Psychic: 2, Dark: 0.5, Fairy: 0.5 },
    Fairy: { Fighting: 2, Poison: 0.5, Steel: 0.5, Fire: 0.5, Dragon: 2, Dark: 2 }
};

// Maps Pokémon type names to their corresponding CSS color variables.
const typeColors = { normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD' };

// --- GLOBAL VARIABLES & CACHES ---
// These variables hold state or pre-calculated values for performance.

// This variable will hold the pre-generated HTML for the HP gauge segments to avoid regenerating it on every render.
let gaugeSegmentsHTML = '';
// A cache to store all available Pokémon names for fast searching.
let allPokemonNames = [];
// A cache for a filtered subset of Pokémon names used for initial team population.
let filteredPokemonNames = [];

// A mapping of Pokémon types to different sets of parallax background images for the arena.
const arenaBackgrounds = {
    'Normal': [
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/plx-1.png',
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/plx-2.png',
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/plx-3.png',
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/plx-4.png',
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/plx-5.png',
        'https://raw.githubusercontent.com/Sapeksh2001/Prallax-Window/main/ground.png'
    ],
    'Fire': [
        'https://img.freepik.com/premium-vector/volcano-landscape-pixel-art-background_59146-138.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-landscape-volcano-background_59146-121.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-landscape-volcano-background_59146-121.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-landscape-volcano-background_59146-121.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-landscape-volcano-background_59146-121.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-landscape-volcano-background_59146-121.jpg?w=1060'
    ],
    'Water': [
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060',
        'https://img.freepik.com/premium-vector/pixel-art-underwater-background-with-fish-coral-seaweed-vector-illustration_614533-289.jpg?w=1060'
    ]
};


// --- APPLICATION INITIALIZATION ---
// This code runs once the page has loaded.
window.addEventListener('load', () => {
    // --- SOUND SETUP ---
    // Initialize Tone.js synthesizers for various sound effects.
    const synth = new Tone.Synth().toDestination();
    const noiseSynth = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0 } }).toDestination();
    const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();

    // Helper functions to play specific sounds for different actions.
    function playClickSound() { synth.triggerAttackRelease("C5", "8n"); }
    function playAttackSound() { noiseSynth.triggerAttackRelease("0.1"); }
    function playStatusSound() { polySynth.triggerAttackRelease(["E5", "G#5"], "16n"); }
    function playConfirmSound() { polySynth.triggerAttackRelease(["C4", "G4"], "8n"); }
    function playErrorSound() { synth.triggerAttackRelease("F#3", "8n"); }
    function playHealSound() { polySynth.triggerAttackRelease(["C5", "E5", "G5"], "8n"); }
    function playFaintSound() { synth.triggerAttackRelease("C3", "4n"); }
    function playEvolveSound() { polySynth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "4n"); }
    // --- END: SOUND SETUP ---

    // --- GAME STATE ---
    // The single source of truth for the entire application. All UI is rendered based on this object.
    let gameState = {
        players: [], // Array of player objects
        currentEditing: { playerId: null, slotId: null }, // Tracks which player/slot is being edited in the modal
        timer: { interval: null, timeLeft: 120, isRunning: false }, // State for the round timer
        round: 1, // Current round number
        activeTurnPlayerId: null, // ID of the player currently selected as the attacker
        selectedAttackTargetId: null, // ID of the player selected as the attack target
        selectedStatusTargetId: null, // ID of the player selected for status/stat changes
        weather: 'none', // Current weather condition ('none', 'sandstorm', 'hail')
    };

    // --- DOM ELEMENT REFERENCES ---
    // Caching references to frequently used DOM elements for better performance.
    const playerGrid = document.getElementById('player-grid');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const newPlayerInput = document.getElementById('new-player-name');
    const endRoundBtn = document.getElementById('end-round-btn');
    const teamModal = document.getElementById('team-modal');
    const closeTeamModalBtn = document.getElementById('close-team-modal');
    const confirmTeamBtn = document.getElementById('confirm-team-btn');
    const modalPlayerName = document.getElementById('team-modal-title');
    const teamSlotsContainer = document.getElementById('team-editor-grid');
    const editorForm = document.getElementById('pokemon-editor-form');
    const attackerSelect = document.getElementById('attacker-select');
    const attackTargetSelect = document.getElementById('attack-target-select');
    const moveTypeSelect = document.getElementById('move-type-select');
    const movePowerInput = document.getElementById('move-power-input');
    const typeEffectivenessDisplay = document.getElementById('type-effectiveness-display');
    const statusTargetSelect = document.getElementById('status-target-select');
    const statusButtons = document.querySelectorAll('.status-btn');
    const generateNumberBtn = document.getElementById('generate-number-btn');
    const randomNumberDisplay = document.getElementById('random-number-display');
    const evolveBtn = document.getElementById('evolve-btn');
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const physicalAttackBtn = document.getElementById('physical-attack-btn');
    const specialAttackBtn = document.getElementById('special-attack-btn');
    const statSelect = document.getElementById('stat-select');
    const statValueInput = document.getElementById('stat-value-input');
    const statModType = document.getElementById('stat-mod-type');
    const updateStatBtn = document.getElementById('update-stat-btn');
    const managementPokemonSelect = document.getElementById('management-pokemon-select');
    const changeFormBtn = document.getElementById('change-form-btn');
    const selectionModal = document.getElementById('selection-modal');
    const closeSelectionModalBtn = document.getElementById('close-selection-modal');
    const selectionModalTitle = document.getElementById('selection-modal-title');
    const selectionGrid = document.getElementById('selection-grid');
    const reviveBtn = document.getElementById('revive-btn');
    const weatherBtn = document.getElementById('weather-btn');
    const sandstormOverlay = document.getElementById('sandstorm-overlay');
    const hailOverlay = document.getElementById('hail-overlay');
    
    // The Pokémon data is expected to be loaded from `pokemon_data.js` into this global variable.
    const pokemonData = window.MergedPokemonData || {};

    /**
     * Initializes the application. This is the main entry point.
     * It sets up data, game state, UI elements, and performs the initial render.
     */
    function init() {
        // Fail gracefully if the Pokémon data file is missing or empty.
        if (Object.keys(pokemonData).length === 0) {
            makeAnnouncement("Error: Pokémon data file not found or is empty.", true);
            return;
        }
        // Start Tone.js audio context on the first click, as required by modern browsers.
        document.body.addEventListener('click', () => Tone.start(), { once: true });
        
        // --- CRITICAL ORDER OF OPERATIONS ---
        // 1. Prepare all necessary data and pre-calculated values first.
        cacheAllPokemonNames();
        cacheFilteredPokemonNames(); 
        generateGaugeSegmentsHTML();
        
        // 2. Populate the initial game state (e.g., with default players).
        prepopulateGameState(); 
        
        // 3. Set up UI elements (like dropdowns) and attach event listeners.
        populateMoveTypeSelector();
        setupEventListeners();
        
        // 4. Once everything is set up, perform the first render of the entire UI.
        render(); 
        lucide.createIcons(); // Initialize Lucide icons.
        setArena('Normal'); // Set the default battle background.
    }
    
    /**
     * Attaches all necessary event listeners to the interactive DOM elements.
     */
    function setupEventListeners() {
        addPlayerBtn.addEventListener('click', () => { playClickSound(); addPlayer(); });
        endRoundBtn.addEventListener('click', () => { playConfirmSound(); endRound(); });
        closeTeamModalBtn.addEventListener('click', () => { playClickSound(); toggleModal(teamModal, false); });
        closeSelectionModalBtn.addEventListener('click', () => { playClickSound(); toggleModal(selectionModal, false); });
        confirmTeamBtn.addEventListener('click', () => { playConfirmSound(); toggleModal(teamModal, false); render(); });
        
        // When the attacker changes, update the game state and the arena background.
        attackerSelect.addEventListener('change', (e) => { 
            gameState.activeTurnPlayerId = e.target.value ? parseInt(e.target.value) : null; 
            updateAttackPreview(); 
            if (gameState.activeTurnPlayerId) {
                const player = gameState.players.find(p => p.id === gameState.activeTurnPlayerId);
                const pokemon = player.team[player.activePokemonIndex];
                if (pokemon) {
                    setArena(pokemon.types[0]); // Change arena based on attacker's primary type.
                }
            }
            render(); 
        });
        // When the attack target changes, update the game state.
        attackTargetSelect.addEventListener('change', (e) => { 
            gameState.selectedAttackTargetId = e.target.value ? parseInt(e.target.value) : null; 
            updateAttackPreview(); 
            render(); 
        });

        moveTypeSelect.addEventListener('change', updateAttackPreview);
        statusTargetSelect.addEventListener('change', (e) => { gameState.selectedStatusTargetId = e.target.value ? parseInt(e.target.value) : null; updateStatusButtonStyles(); render(); });
        statusButtons.forEach(btn => {
            if (btn.id !== 'weather-btn') {
                btn.addEventListener('click', toggleStatus);
            }
        });
        weatherBtn.addEventListener('click', cycleWeather);
        generateNumberBtn.addEventListener('click', () => { playClickSound(); const num = Math.floor(Math.random() * 100) + 1; randomNumberDisplay.textContent = num; });
        evolveBtn.addEventListener('click', handleEvolve);
        timerStartBtn.addEventListener('click', startTimer);
        timerPauseBtn.addEventListener('click', pauseTimer);
        timerResetBtn.addEventListener('click', resetTimer);
        physicalAttackBtn.addEventListener('click', () => handleAttack('physical'));
        specialAttackBtn.addEventListener('click', () => handleAttack('special'));
        updateStatBtn.addEventListener('click', handleStatUpdate);
        changeFormBtn.addEventListener('click', openFormChangeModal);
        managementPokemonSelect.addEventListener('change', updateManagementButtons);
        reviveBtn.addEventListener('click', handleRevive);
    }

    /**
     * Adds a new player to the game from the control panel input.
     */
    function addPlayer() {
        const name = newPlayerInput.value.trim();
        if (name && gameState.players.length < 6) {
            const newPlayer = { id: Date.now(), name: name, team: Array(6).fill(null), activePokemonIndex: 0, statuses: {} };
            gameState.players.push(newPlayer);
            newPlayerInput.value = '';
            render();
            openTeamManager(newPlayer.id); // Open the team manager for the new player.
        }
    }

    /**
     * Increments the round counter and applies end-of-round effects like weather damage.
     */
    function endRound() {
        gameState.round++;
        applyWeatherDamage();
        render();
        makeAnnouncement(`Round ${gameState.round} has begun!`);
    }

    /**
     * The main rendering function. It's called whenever the game state changes
     * to ensure the UI is always up-to-date.
     */
    function render() {
        renderPlayerCards();
        updateControlPanel();
        updateWeatherView();
        endRoundBtn.textContent = `END ROUND ${gameState.round}`;
    }
    
    /**
     * Clears and redraws all player cards in the grid.
     */
    function renderPlayerCards() {
        playerGrid.innerHTML = '';
        gameState.players.forEach(player => playerGrid.appendChild(createPlayerCard(player)));
        // Fill remaining grid slots with empty placeholders.
        for (let i = gameState.players.length; i < 6; i++) playerGrid.appendChild(createEmptyPlayerCard());
    }
    
    /**
     * Creates a placeholder card for an empty player slot.
     * @returns {HTMLElement} The empty card element.
     */
    function createEmptyPlayerCard() {
        const card = document.createElement('div');
        card.className = "player-card p-4 flex flex-col items-center justify-center h-full text-gray-500 border-dashed";
        card.innerHTML = `<div class="text-center"><i data-lucide="user-plus" class="w-16 h-16 mx-auto"></i><p class="mt-2">EMPTY SLOT</p></div>`;
        lucide.createIcons();
        return card;
    }

    /**
     * Creates the complete HTML element for a single player card based on the player's state.
     * @param {object} player - The player object from the game state.
     * @returns {HTMLElement} The fully constructed player card element.
     */
    function createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = "player-card p-4 flex flex-col items-center justify-between h-full";
        card.id = `player-card-${player.id}`;
        card.dataset.playerId = player.id;
        // Dynamically add classes based on game state (e.g., active turn, selected target).
        card.classList.toggle('active-turn', player.id === gameState.activeTurnPlayerId);
        card.classList.toggle('selected-target', player.id === gameState.selectedAttackTargetId);
        card.classList.toggle('selected-status-target', player.id === gameState.selectedStatusTargetId);

        const activePokemon = player.team[player.activePokemonIndex];
        // Handle case where player has no active Pokémon.
        if (!activePokemon) {
            card.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center"><h3 class="font-bold text-2xl text-gray-400">${player.name}</h3><p class="text-sm text-gray-500 mt-4">No active Pokémon.</p><button onclick="window.openTeamManager(${player.id})" class="w-full mt-4 bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs">Manage Team</button></div>`;
            return card;
        }

        // --- Tier Logic for Borders and Holographic Effects ---
        const tier = activePokemon.tier ? activePokemon.tier.toLowerCase() : '';
        if (tier.includes('legendary') || tier.includes('mythical') || tier.includes('ultra beast') || tier.includes('mega') || tier.includes('gmax')) {
            card.classList.add('holo-gold');
        } else if (tier === 'final') {
            card.classList.add('holo-silver');
        }
        const tierClass = `tier-border-${tier.replace(/ /g, '-').replace(':', '')}`;
        card.classList.add(tierClass);


        const isFainted = activePokemon.currentHP <= 0;
        if(isFainted) card.classList.add('opacity-50', 'bg-red-900/30');

        // Calculate the rotation for the HP gauge needle.
        const hpPercent = (activePokemon.currentHP / activePokemon.maxHp);
        const totalAngle = 270; // The gauge spans 270 degrees.
        const startAngle = -135;
        let needleRotation = startAngle + (hpPercent * totalAngle);
        // Clamp the rotation value to stay within the gauge's bounds.
        needleRotation = Math.max(startAngle, Math.min(startAngle + totalAngle, needleRotation));

        // Generate HTML for various card components.
        const typesHTML = activePokemon.types.map(type => `<span class="type-badge" style="background-color: var(--type-${type.toLowerCase()})">${type.toUpperCase()}</span>`).join('');
        const tierHTML = `<p class="pokemon-tier"><span class="tier-label">Tier:</span> ${activePokemon.tier ? activePokemon.tier : 'Unknown'}</p>`;
        const stats = activePokemon.stats;
        const isParalyzed = player.statuses.paralyze;
        
        // Generate HTML for the team icons at the bottom of the card.
        const teamIconsHTML = player.team.map((p, i) => {
            const isActive = i === player.activePokemonIndex;
            const isFaintedTeamMember = p && p.currentHP <= 0;
            const pokeballImg = isFaintedTeamMember ? 'https://img.pokemondb.net/sprites/items/luxury-ball.png' : 'https://img.pokemondb.net/sprites/items/poke-ball.png';
            const sprite = p ? p.sprite : pokeballImg;
            const borderClass = isActive ? 'border-2 border-yellow-400' : 'border-2 border-slate-600';
            return `<img src="${sprite}" title="${p ? p.fullName : 'Empty'}" class="w-12 h-12 team-pokeball bg-slate-800 p-1 ${borderClass} ${isFaintedTeamMember ? 'grayscale' : ''}" onclick="window.handleTeamIconClick(${player.id}, ${i})">`;
        }).join('');
        
        const turnIndicatorHTML = player.id === gameState.activeTurnPlayerId ? `<div class="turn-indicator-arrow"><i data-lucide="chevrons-down" class="w-8 h-8"></i></div>` : '';
        
        // Generate HTML for the stat display, applying modifiers and paralysis effect.
        const statHTML = Object.entries(stats).map(([key, value]) => {
            if(key === 'hp') return ''; // HP is displayed in the gauge, not here.
            const modifier = activePokemon.statModifiers ? (activePokemon.statModifiers[key] || 0) : 0;
            let colorClass = '';
            if (modifier > 0) colorClass = 'text-green-400';
            if (modifier < 0) colorClass = 'text-red-400';
            if (key === 'spe' && isParalyzed) colorClass = 'stat-paralyzed';
            // Speed is halved when paralyzed.
            const finalStat = isParalyzed && key === 'spe' ? Math.floor((value + modifier) / 2) : (value + modifier);
            return `<div class="${colorClass}">${finalStat}</div>`;
        }).join('');
        
        // Generate HTML for status condition icons.
        let statusIconsHTML = '';
        if (player.statuses.poison || player.statuses.bad_poison) statusIconsHTML += `<i data-lucide="skull" class="w-5 h-5 text-purple-400"></i>`;
        if (player.statuses.burn) statusIconsHTML += `<i data-lucide="flame" class="w-5 h-5 text-orange-400"></i>`;
        if (player.statuses.paralyze) statusIconsHTML += `<i data-lucide="zap" class="w-5 h-5 text-yellow-400"></i>`;
        if (player.statuses.curse) statusIconsHTML += `<i data-lucide="ghost" class="w-5 h-5 text-indigo-400"></i>`;
        
        const gifUrl = activePokemon.sprite;
        const fallbackUrl = 'https://placehold.co/96x96/000000/FFFFFF?text=?';

        // Assemble the final inner HTML for the card.
        card.innerHTML = `
            <div class="entry-animation-container"></div>
            ${turnIndicatorHTML}
            <div class="w-full">
                <div class="w-full flex justify-between items-start">
                    <h2 class="text-2xl font-bold">${player.name}</h2>
                    <button onclick="window.openTeamManager(${player.id})" class="text-slate-400 hover:text-white"><i data-lucide="settings-2" class="w-5 h-5"></i></button>
                </div>
                <h3 class="text-2xl font-bold text-center">${activePokemon.fullName}</h3>
                ${tierHTML}
                <div class="flex justify-center gap-2 mt-1">${typesHTML}</div>
            </div>

            <div class="flex flex-col items-center justify-center flex-grow">
                 <div class="relative">
                    <img src="${gifUrl}" onerror="this.onerror=null;this.src='${fallbackUrl}';" alt="${activePokemon.fullName}" class="pokemon-sprite w-32 h-32 ${isFainted ? 'grayscale' : ''}">
                    ${isFainted ? '<div class="absolute inset-0 flex items-center justify-center"><span class="text-red-500 text-2xl font-bold -rotate-12 bg-black/50 px-2">FAINTED</span></div>' : ''}
                    <div class="absolute top-0 right-0 flex flex-col gap-1">${statusIconsHTML}</div>
                </div>
                <div class="hp-gauge-container">
                    <div class="hp-gauge-segments-container">${gaugeSegmentsHTML}</div>
                    <div class="hp-gauge-pivot"></div>
                    <div class="hp-gauge-needle" style="transform: rotate(${needleRotation}deg);"></div>
                    <div class="hp-gauge-center" onclick="window.editHP(${player.id})">
                        <div class="current-hp">${activePokemon.currentHP}</div>
                        <div class="max-hp">/ ${activePokemon.maxHp}</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-5 grid-rows-2 text-center text-lg w-full">
                <div class="flex justify-center items-center" title="Attack"><i data-lucide="sword"></i></div>
                <div class="flex justify-center items-center" title="Defense"><i data-lucide="shield"></i></div>
                <div class="flex justify-center items-center" title="Special Attack"><i data-lucide="swords"></i></div>
                <div class="flex justify-center items-center" title="Special Defense"><i data-lucide="shield-check"></i></div>
                <div class="flex justify-center items-center ${isParalyzed ? 'stat-paralyzed' : ''}" title="Speed"><i data-lucide="zap"></i></div>
                ${statHTML}
            </div>

            <div class="grid grid-cols-6 gap-1 w-full">
                ${teamIconsHTML}
            </div>
        `;
        lucide.createIcons(); // Re-initialize icons for the newly created card.
        return card;
    }

    /**
     * Allows the GM to manually edit a Pokémon's HP via a prompt.
     * @param {number} playerId - The ID of the player whose Pokémon's HP is to be edited.
     */
    window.editHP = (playerId) => {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;
        const pokemon = player.team[player.activePokemonIndex];
        if (!pokemon) return;

        const newHP = prompt(`Enter new HP for ${pokemon.fullName} (Max: ${pokemon.maxHp}):`, pokemon.currentHP);
        if (newHP !== null && !isNaN(newHP)) {
            const oldHP = pokemon.currentHP;
            // Sanitize the input to be between 0 and max HP.
            const newHPValue = Math.max(0, Math.min(pokemon.maxHp, parseInt(newHP)));
            pokemon.currentHP = newHPValue;
            playClickSound();

            // Trigger appropriate animation based on HP change.
            if (newHPValue === 0 && oldHP > 0) {
                animateSprite(playerId, 'faint', render);
            } else if (newHPValue < oldHP) {
                animateSprite(playerId, 'damage', render);
            } else if (newHPValue > oldHP) {
                animateSprite(playerId, 'heal', render);
            } else {
                render();
            }
        }
    };

    /**
     * Updates the control panel dropdowns and buttons, enabling/disabling them
     * and populating them with the current list of active Pokémon.
     */
    function updateControlPanel() {
        // Only include players with an active Pokémon.
        const activePlayers = gameState.players.filter(p => p && p.team[p.activePokemonIndex]);
        // For attack/status dropdowns, only include non-fainted Pokémon.
        const nonFaintedPlayers = activePlayers.filter(p => p.team[p.activePokemonIndex] && p.team[p.activePokemonIndex].currentHP > 0);
        
        const enabled = nonFaintedPlayers.length > 0;
        [attackerSelect, attackTargetSelect, statusTargetSelect, endRoundBtn, updateStatBtn].forEach(el => el.disabled = !enabled);
        managementPokemonSelect.disabled = activePlayers.length === 0; // Management can be done on fainted Pokémon.

        // Store current selections to reapply them after repopulating.
        const currentAttacker = attackerSelect.value;
        const currentAttackTarget = attackTargetSelect.value;
        const currentStatusTarget = statusTargetSelect.value;
        const currentManagementTarget = managementPokemonSelect.value;
        
        // Clear existing options.
        attackerSelect.innerHTML = '<option value="">-- Attacker --</option>';
        attackTargetSelect.innerHTML = '<option value="">-- Target --</option>';
        statusTargetSelect.innerHTML = '<option value="">-- Player --</option>';
        managementPokemonSelect.innerHTML = '<option value="">-- Pokémon --</option>';

        // Populate dropdowns with non-fainted Pokémon.
        nonFaintedPlayers.forEach(player => {
            const pokemon = player.team[player.activePokemonIndex];
            const optionText = `${player.name} - ${pokemon.fullName}`;
            attackerSelect.add(new Option(optionText, player.id));
            attackTargetSelect.add(new Option(optionText, player.id));
            statusTargetSelect.add(new Option(optionText, player.id));
        });
        
        // The Management dropdown includes fainted Pokémon for revival.
        activePlayers.forEach(player => {
            const pokemon = player.team[player.activePokemonIndex];
            if (pokemon) {
                const optionText = `${player.name} - ${pokemon.fullName} ${pokemon.currentHP <= 0 ? '(FNT)' : ''}`;
                managementPokemonSelect.add(new Option(optionText, `${player.id}-${player.activePokemonIndex}`));
            }
        });

        // Reapply previous selections if they are still valid.
        attackerSelect.value = currentAttacker;
        attackTargetSelect.value = currentAttackTarget;
        statusTargetSelect.value = currentStatusTarget;
        managementPokemonSelect.value = currentManagementTarget;
        
        // Update button styles and states.
        updateStatusButtonStyles();
        updateManagementButtons();
    }
    
    /**
     * Opens the team management modal for a specific player.
     * @param {number} playerId - The ID of the player whose team to manage.
     */
    window.openTeamManager = (playerId) => {
        playClickSound();
        gameState.currentEditing.playerId = playerId;
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;
        modalPlayerName.textContent = `Manage ${player.name}'s Team`;
        renderTeamEditorGrid();
        editorForm.classList.add('hidden'); // Hide the editor form initially.
        toggleModal(teamModal, true);
    };
    
    /**
     * Renders the grid of 6 Pokémon slots inside the team management modal.
     */
    function renderTeamEditorGrid() {
        const player = gameState.players.find(p => p.id === gameState.currentEditing.playerId);
        if (!player) return;
        teamSlotsContainer.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const pokemon = player.team[i];
            const slot = document.createElement('div');
            slot.className = 'bg-slate-700 p-2 text-center cursor-pointer hover:bg-slate-600 relative';
            slot.dataset.slotId = i;

            // Display Pokémon info if the slot is filled.
            if (pokemon) {
                slot.innerHTML = `
                    ${player.activePokemonIndex === i ? '<div class="absolute top-1 left-1 text-yellow-400"><i data-lucide="star" class="w-4 h-4 fill-current"></i></div>' : ''}
                    <img src="${pokemon.sprite}" alt="${pokemon.fullName}" class="mx-auto h-16">
                    <p class="font-bold text-xs mt-1">${pokemon.fullName}</p>
                    <div class="flex justify-center gap-1 mt-1">
                        <button class="edit-pokemon-btn text-xs bg-yellow-600 hover:bg-yellow-700 p-1"><i data-lucide="pencil" class="w-3 h-3"></i></button>
                        <button class="remove-pokemon-btn text-xs bg-red-600 hover:bg-red-700 p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                    </div>`;
            } else { // Display an "add" button if the slot is empty.
                slot.className += ' flex items-center justify-center border-2 border-dashed border-slate-600 min-h-[110px]';
                slot.innerHTML = `<button class="add-pokemon-btn text-slate-400 hover:text-white"><i data-lucide="plus-circle" class="w-8 h-8"></i></button>`;
            }
            teamSlotsContainer.appendChild(slot);
        }
        
        lucide.createIcons();

        // Add event listeners to the newly created slots.
        teamSlotsContainer.querySelectorAll('div[data-slot-id]').forEach(slot => {
            slot.addEventListener('click', (e) => {
                playClickSound();
                const targetButton = e.target.closest('button');
                const slotId = parseInt(slot.dataset.slotId);
                if (targetButton?.classList.contains('edit-pokemon-btn')) openPokemonEditor(slotId);
                else if (targetButton?.classList.contains('remove-pokemon-btn')) removePokemon(slotId);
                else if (targetButton?.classList.contains('add-pokemon-btn')) openPokemonEditor(slotId);
                else if (player.team[slotId]) {
                    // Clicking the slot itself (not a button) makes that Pokémon active.
                    switchActivePokemon(gameState.currentEditing.playerId, slotId, true);
                    renderTeamEditorGrid();
                }
            });
        });
    }

    /**
     * Handles clicks on the small team icons on the main player card.
     * @param {number} playerId - The ID of the player.
     * @param {number} slotId - The index of the clicked team slot (0-5).
     */
    window.handleTeamIconClick = (playerId, slotId) => {
        playClickSound();
        const player = gameState.players.find(p => p.id === playerId);
        // Can only switch to a non-fainted Pokémon.
        if (player && player.team[slotId] && player.team[slotId].currentHP > 0) {
            switchActivePokemon(playerId, slotId);
        } else if (player && player.team[slotId] && player.team[slotId].currentHP <= 0) {
            makeAnnouncement("Cannot switch to a fainted Pokémon!", true);
        } else {
            // If the slot is empty, open the team manager.
            openTeamManager(playerId);
        }
    };

    /**
     * Switches a player's active Pokémon, with animations.
     * @param {number} playerId - The ID of the player to switch.
     * @param {number} slotId - The new active Pokémon's slot index.
     * @param {boolean} [isFromModal=false] - Flag to prevent animations when switching from within the modal.
     */
    function switchActivePokemon(playerId, slotId, isFromModal = false) {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player || player.activePokemonIndex === slotId) return;

        const newPokemon = player.team[slotId];
        if (newPokemon.currentHP <= 0) return; // Cannot switch to a fainted Pokémon.

        const doSwitch = () => {
            player.activePokemonIndex = slotId;
            player.statuses = {}; // Status conditions are cleared on switch.
            if (isFromModal) {
                renderTeamEditorGrid();
            } else {
                render(); // Re-render main view to show the new Pokémon.
                playPokemonCry(newPokemon);
                playEntryAnimation(playerId, newPokemon.types[0]);
            }
        };

        // Play a switch-out animation before performing the switch logic.
        if (!isFromModal) {
            animateSprite(playerId, 'switch-out', doSwitch);
        } else {
            doSwitch();
        }
    }

    /**
     * Creates a new Pokémon object for the game state from the main pokemonData structure.
     * @param {string} pokemonName - The exact name of the Pokémon to create.
     * @returns {object|null} The created Pokémon object or null if not found.
     */
    function createPokemonObject(pokemonName) {
        const searchResult = findPokemonData(pokemonName);
        if (!searchResult) {
            console.error(`Pokemon with name "${pokemonName}" not found in pokemonData.`);
            return null;
        }
        const data = searchResult.foundNode;
        const baseData = searchResult.baseNode;
        // Construct a clean object for use in the game state.
        return {
            baseName: baseData.Name,
            fullName: data.Name,
            maxHp: data.stats.hp,
            currentHP: data.stats.hp,
            stats: data.stats,
            types: data.types[0].split(' '), // Handle dual types like "Grass Poison".
            sprite: data.sprite,
            cry: data.cry,
            tier: data.tier,
            data: data, // Store the raw data for the current form.
            baseData: baseData, // Store the raw data for the base form (for form changes).
            moves: [], // Placeholder for moves.
            statModifiers: {} // Stores temporary in-battle stat changes.
        };
    }

    /**
     * Opens the form to add or edit a Pokémon in the team management modal.
     * @param {number} slotId - The slot index to edit (0-5).
     */
    function openPokemonEditor(slotId) {
        gameState.currentEditing.slotId = slotId;
        const player = gameState.players.find(p => p.id === gameState.currentEditing.playerId);
        const pokemon = player?.team[slotId];
        
        // Dynamically create the editor form with a search input.
        editorForm.innerHTML = `
            <h4 class="text-lg text-yellow-300 mb-3">${pokemon ? 'Edit' : 'Add'} Pokémon (Slot ${slotId + 1})</h4>
            <div class="mb-2">
                <label for="pokedex-search" class="text-xs">Search Pokémon</label>
                <input type="text" id="pokedex-search" class="w-full bg-slate-900 p-2 mt-1 text-xs" value="${pokemon?.fullName || ''}">
                <div id="pokedex-search-results" class="bg-slate-900 border border-slate-600 mt-1"></div>
            </div>
            <div class="flex gap-2 mt-4">
                <button id="confirm-pokemon-edit" class="bg-green-600 hover:bg-green-700 p-2 text-xs w-full">Confirm</button>
                <button id="cancel-pokemon-edit" class="bg-gray-600 hover:bg-gray-700 p-2 text-xs w-full">Cancel</button>
            </div>
        `;
        editorForm.classList.remove('hidden');

        // Logic for the live Pokémon search.
        const searchInput = document.getElementById('pokedex-search');
        const searchResults = document.getElementById('pokedex-search-results');
        
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            searchResults.innerHTML = '';
            if (query.length < 2) return;
            // Filter the cached list of names and show top 5 results.
            const results = allPokemonNames.filter(name => name.toLowerCase().includes(query)).slice(0, 5);
            results.forEach(name => {
                const div = document.createElement('div');
                div.className = 'p-2 cursor-pointer hover:bg-slate-700 text-xs';
                div.textContent = name;
                div.onclick = () => { searchInput.value = name; searchResults.innerHTML = ''; };
                searchResults.appendChild(div);
            });
        });

        document.getElementById('confirm-pokemon-edit').addEventListener('click', () => { playConfirmSound(); confirmPokemonEdit(); });
        document.getElementById('cancel-pokemon-edit').addEventListener('click', () => { playClickSound(); editorForm.classList.add('hidden'); });
    }

    /**
     * Confirms the addition/edit of a Pokémon and updates the game state.
     */
    function confirmPokemonEdit() {
        const player = gameState.players.find(p => p.id === gameState.currentEditing.playerId);
        const slotId = gameState.currentEditing.slotId;
        if (!player || slotId === null) return;

        const pokemonName = document.getElementById('pokedex-search').value;
        const newPokemon = createPokemonObject(pokemonName);

        if (newPokemon) {
            player.team[slotId] = newPokemon;
            // If this is the first Pokémon added, make it the active one.
            if (player.team.filter(p => p).length === 1) player.activePokemonIndex = slotId;
            renderTeamEditorGrid();
            editorForm.classList.add('hidden');
        } else {
            makeAnnouncement("Invalid Pokémon name.", true);
        }
    }

    /**
     * Removes a Pokémon from a player's team.
     * @param {number} slotId - The slot index to clear.
     */
    function removePokemon(slotId) {
        const player = gameState.players.find(p => p.id === gameState.currentEditing.playerId);
        if (player) {
            player.team[slotId] = null;
            // If the removed Pokémon was the active one, find a new active Pokémon.
            if (player.activePokemonIndex === slotId) {
                player.activePokemonIndex = player.team.findIndex(p => p !== null);
                if (player.activePokemonIndex === -1) player.activePokemonIndex = 0;
            }
            renderTeamEditorGrid();
        }
    }

    /**
     * Toggles the visibility of a modal element.
     * @param {HTMLElement} modal - The modal element to toggle.
     * @param {boolean} show - True to show the modal, false to hide it.
     */
    function toggleModal(modal, show) {
        modal.classList.toggle('visible', show);
    }

    /**
     * Populates the "Move Type" dropdown in the control panel with all Pokémon types.
     */
    function populateMoveTypeSelector() {
        moveTypeSelect.innerHTML = '<option value="">Select Type</option>';
        Object.keys(typeColors).forEach(type => {
            const option = document.createElement('option');
            option.value = type.charAt(0).toUpperCase() + type.slice(1);
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            moveTypeSelect.appendChild(option);
        });
    }

    /**
     * Calculates and displays the type effectiveness multiplier for the selected attack preview.
     */
    function updateAttackPreview() {
        const moveType = moveTypeSelect.value;
        const targetId = parseInt(attackTargetSelect.value);
        if (!moveType || !targetId) { typeEffectivenessDisplay.textContent = '--'; return; }
        
        const targetPlayer = gameState.players.find(p => p.id === targetId);
        if (!targetPlayer || !targetPlayer.team[targetPlayer.activePokemonIndex]) { typeEffectivenessDisplay.textContent = '--'; return; }
        
        const targetPokemon = targetPlayer.team[targetPlayer.activePokemonIndex];
        const targetTypes = targetPokemon.types;
        let multiplier = 1;
        
        // Calculate the total multiplier based on the target's type(s).
        targetTypes.forEach(targetType => {
            const effectiveness = typeChart[moveType]?.[targetType];
            if (effectiveness !== undefined) multiplier *= effectiveness;
        });

        // Display a helpful message based on the multiplier.
        let message = `x${multiplier}`;
        if (multiplier >= 2) message += " (Super effective!)";
        if (multiplier < 1 && multiplier > 0) message += " (Not very effective...)";
        if (multiplier === 0) message += " (No effect!)";
        typeEffectivenessDisplay.textContent = message;
    }

    /**
     * Updates the visual style of status buttons (e.g., highlighting active statuses).
     */
    function updateStatusButtonStyles() {
        const targetId = parseInt(statusTargetSelect.value);
        const player = gameState.players.find(p => p.id === targetId);
        const conditions = player ? player.statuses : {};
        statusButtons.forEach(btn => {
            if (btn.dataset.status) {
                btn.classList.toggle('status-button-active', !!conditions[btn.dataset.status]);
            }
        });
    }
    
    /**
     * Toggles a status effect on or off for the selected target.
     * @param {Event} event - The click event from the status button.
     */
    function toggleStatus(event) {
        playStatusSound();
        const status = event.target.closest('button').dataset.status;
        const targetId = parseInt(statusTargetSelect.value);
        if (!targetId) return;
        const player = gameState.players.find(p => p.id === targetId);
        // Add status if not present, remove it if it is.
        if (player.statuses[status]) delete player.statuses[status];
        else player.statuses[status] = true;
        render(); // Re-render to show the status icon change.
    }

    /**
     * Handles the logic for evolving a selected Pokémon.
     */
    function handleEvolve() {
        const selectedValue = managementPokemonSelect.value;
        if (!selectedValue) { makeAnnouncement("Select a Pokémon to evolve first.", true); return; }
        
        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;

        const pokemonToEvolve = player.team[slotId];
        if (!pokemonToEvolve) return;

        const possibleEvolutions = pokemonToEvolve.data.evolutions.filter(evo => typeof evo === 'object' && evo.Name);

        if (!possibleEvolutions || possibleEvolutions.length === 0) {
            makeAnnouncement(`${pokemonToEvolve.fullName} cannot evolve further.`, true);
            return;
        }

        // If there's only one evolution path, confirm it directly.
        if (possibleEvolutions.length === 1) {
            confirmEvolution(possibleEvolutions[0].Name);
        } else { // If there are multiple paths (e.g., Eevee), open a choice modal.
            openEvolutionChoiceModal(possibleEvolutions);
        }
    }
    
    /**
     * Populates the game state with random sample data for a quick start.
     */
    function prepopulateGameState() {
        console.log("Starting to prepopulate game state...");
        const playerNames = ['Ash', 'Misty', 'Brock', 'Gary', 'Jessie', 'James'];
        
        // Shuffle the list of filtered Pokémon to ensure variety.
        if (filteredPokemonNames.length < playerNames.length * 6) {
            console.error("Not enough unique Pokémon to create teams for all players. Duplicates may occur.");
        }
        const shuffledPokemon = [...filteredPokemonNames].sort(() => 0.5 - Math.random());
        let pokemonPool = [...shuffledPokemon];

        playerNames.forEach((name, index) => {
            // Replenish the pool if we run out of unique Pokémon.
            if (pokemonPool.length < 6) {
                 console.warn("Re-using Pokémon for default teams as the unique pool was exhausted.");
                 pokemonPool = [...shuffledPokemon];
            }
            
            // Take the next 6 unique Pokémon from the pool for the current player.
            const teamNamesForPlayer = pokemonPool.splice(0, 6);
            const team = teamNamesForPlayer.map(pokemonName => createPokemonObject(pokemonName)).filter(p => p !== null);
            
            while (team.length < 6) team.push(null); // Ensure team array always has 6 slots.

            gameState.players.push({ id: Date.now() + index, name: name, team, activePokemonIndex: 0, statuses: {} });
        });
        console.log("Finished prepopulating game state with 6 players. Players:", gameState.players);
    }

    /**
     * Handles the entire attack sequence from reading inputs to applying damage and animations.
     * @param {string} attackType - 'physical' or 'special'.
     */
    function handleAttack(attackType) {
        playAttackSound();

        // Get all necessary values from the UI.
        const attackerId = parseInt(attackerSelect.value);
        const targetId = parseInt(attackTargetSelect.value);
        const moveType = moveTypeSelect.value;
        const movePower = parseInt(movePowerInput.value);

        // --- Validation ---
        if (!attackerId || !targetId || !moveType || isNaN(movePower) || movePower <= 0) {
            makeAnnouncement("Attacker, Target, Move Type, and Power are required!", true);
            return;
        }
        const attackerPlayer = gameState.players.find(p => p.id === attackerId);
        const targetPlayer = gameState.players.find(p => p.id === targetId);
        if (!attackerPlayer || !targetPlayer) {
            makeAnnouncement("Invalid attacker or target.", true);
            return;
        }
        const attackerPokemon = attackerPlayer.team[attackerPlayer.activePokemonIndex];
        const targetPokemon = targetPlayer.team[targetPlayer.activePokemonIndex];
        if (attackerPokemon.currentHP <= 0) {
            makeAnnouncement(`${attackerPokemon.fullName} is fainted and cannot attack!`, true);
            return;
        }
        if (targetPokemon.currentHP <= 0) {
            makeAnnouncement(`${targetPokemon.fullName} is already fainted!`, true);
            return;
        }
        
        playPokemonCry(attackerPokemon);

        // --- Damage Calculation ---
        // 1. Calculate Type Effectiveness
        let typeEffectiveness = 1;
        targetPokemon.types.forEach(targetType => {
            const effectiveness = typeChart[moveType]?.[targetType];
            if (effectiveness !== undefined) typeEffectiveness *= effectiveness;
        });

        // 2. Get final stats (base stats + in-battle modifiers)
        const attackerStats = { ...attackerPokemon.stats, ...attackerPokemon.statModifiers };
        const targetStats = { ...targetPokemon.stats, ...targetPokemon.statModifiers };
        
        const offensiveStat = attackType === 'physical' ? (attackerStats.atk + (attackerPokemon.statModifiers.atk || 0)) : (attackerStats.spa + (attackerPokemon.statModifiers.spa || 0));
        const defensiveStat = attackType === 'physical' ? (targetStats.def + (targetPokemon.statModifiers.def || 0)) : (targetStats.spd + (targetPokemon.statModifiers.spd || 0));
        
        // 3. Simplified damage formula
        let damage = (movePower * typeEffectiveness) + offensiveStat - defensiveStat;
        if (damage < 1 && typeEffectiveness > 0) damage = 1; // Minimum 1 damage if not immune.
        if (typeEffectiveness === 0) damage = 0;
        damage = Math.floor(damage);

        // --- Apply Damage and Update State ---
        const oldHP = targetPokemon.currentHP;
        targetPokemon.currentHP = Math.max(0, oldHP - damage);
        
        // --- Announce and Animate ---
        let announcement = `${attackerPokemon.fullName} used a ${attackType} ${moveType} attack on ${targetPokemon.fullName} for ${damage} damage!`;
        if (typeEffectiveness > 1) announcement += " It's super effective!";
        if (typeEffectiveness < 1 && typeEffectiveness > 0) announcement += " It's not very effective...";
        if (typeEffectiveness === 0) announcement = `${targetPokemon.fullName} is immune!`;
        makeAnnouncement(announcement);
        
        // Callback function to run after the animation completes.
        const onAnimationComplete = () => {
            if (targetPokemon.currentHP === 0) {
                playPokemonCry(targetPokemon);
                makeAnnouncement(`${targetPokemon.fullName} fainted!`);
                animateSprite(targetId, 'faint', render);
            } else {
                render();
            }
        };

        if (damage > 0) {
            animateSprite(targetId, 'damage', onAnimationComplete);
        } else {
            render();
        }
    }

    /**
     * Handles modifying a Pokémon's stats or HP from the control panel.
     */
    function handleStatUpdate() {
        const targetId = parseInt(statusTargetSelect.value);
        const statToUpdate = statSelect.value;
        const value = parseInt(statValueInput.value);
        const modType = statModType.value;

        if (!targetId || !statToUpdate || isNaN(value)) {
            makeAnnouncement("Please select a target, stat, and value.", true);
            return;
        }

        const player = gameState.players.find(p => p.id === targetId);
        const pokemon = player?.team[player.activePokemonIndex];
        if (!pokemon) return;

        // Handle HP modification separately from other stats.
        if (statToUpdate === 'hp') {
            const oldHP = pokemon.currentHP;
            let newHP = oldHP;
            switch (modType) {
                case 'set': newHP = value; break;
                case '+': newHP += value; break;
                case '-': newHP -= value; break;
                case '+%': newHP += Math.floor(pokemon.maxHp * (value / 100)); break;
                case '-%': newHP -= Math.floor(pokemon.maxHp * (value / 100)); break;
            }
            pokemon.currentHP = Math.max(0, Math.min(pokemon.maxHp, newHP));
            
            // Trigger appropriate animation based on HP change.
            if (pokemon.currentHP === 0 && oldHP > 0) animateSprite(targetId, 'faint', render);
            else if (pokemon.currentHP > oldHP) animateSprite(targetId, 'heal', render);
            else if (pokemon.currentHP < oldHP) animateSprite(targetId, 'damage', render);
            else render();
        } else { // Handle stat modifiers for Atk, Def, etc.
            if (!pokemon.statModifiers) pokemon.statModifiers = {};
            const baseStat = pokemon.stats[statToUpdate];
            let change = 0;

            switch (modType) {
                case 'set': pokemon.statModifiers[statToUpdate] = value - baseStat; break;
                case '+': change = value; pokemon.statModifiers[statToUpdate] = (pokemon.statModifiers[statToUpdate] || 0) + change; break;
                case '-': change = -value; pokemon.statModifiers[statToUpdate] = (pokemon.statModifiers[statToUpdate] || 0) + change; break;
                case '+%': change = Math.floor(baseStat * (value / 100)); pokemon.statModifiers[statToUpdate] = (pokemon.statModifiers[statToUpdate] || 0) + change; break;
                case '-%': change = -Math.floor(baseStat * (value / 100)); pokemon.statModifiers[statToUpdate] = (pokemon.statModifiers[statToUpdate] || 0) + change; break;
            }
            if (change > 0) animateSprite(targetId, 'heal', render);
            else if (change < 0) animateSprite(targetId, 'damage', render);
            else render();
        }
        playConfirmSound();
    }

    /**
     * Opens the modal to select a new form for a Pokémon (e.g., Deoxys-Attack).
     */
    function openFormChangeModal() {
        const selectedValue = managementPokemonSelect.value;
        if (!selectedValue) return;

        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        const pokemon = player?.team[slotId];
        if (!pokemon || !pokemon.baseData) return;

        // Get all available forms from the Pokémon's base data.
        const allForms = [pokemon.baseData, ...Object.values(pokemon.baseData.forms || {})];
        const availableForms = allForms.filter(form => form.Name && form.Name !== pokemon.fullName);

        if (availableForms.length === 0) {
            makeAnnouncement(`${pokemon.fullName} has no other forms to change into.`, true);
            return;
        }

        // Populate and show the generic selection modal.
        selectionModalTitle.textContent = `Change ${pokemon.fullName}'s Form`;
        selectionGrid.innerHTML = '';
        availableForms.forEach(formData => {
            if (typeof formData !== 'object' || !formData.Name) return;
            const formDiv = document.createElement('div');
            formDiv.className = 'bg-slate-700 p-2 text-center cursor-pointer hover:bg-slate-600';
            formDiv.innerHTML = `<img src="${formData.sprite}" alt="${formData.Name}" class="mx-auto h-16"><p class="font-bold text-xs mt-1">${formData.Name}</p>`;
            formDiv.onclick = () => confirmFormChange(formData.Name);
            selectionGrid.appendChild(formDiv);
        });
        toggleModal(selectionModal, true);
    }

    /**
     * Opens the modal to select an evolution for a Pokémon with multiple evolution paths.
     * @param {Array<object>} evolutionObjects - An array of possible evolution data objects.
     */
    function openEvolutionChoiceModal(evolutionObjects) {
        const selectedValue = managementPokemonSelect.value;
        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        const pokemon = player?.team[slotId];
        
        selectionModalTitle.textContent = `Evolve ${pokemon.fullName} into...`;
        selectionGrid.innerHTML = '';
        evolutionObjects.forEach(evoData => {
            if (evoData) {
                const evoDiv = document.createElement('div');
                evoDiv.className = 'bg-slate-700 p-2 text-center cursor-pointer hover:bg-slate-600';
                evoDiv.innerHTML = `<img src="${evoData.sprite}" alt="${evoData.Name}" class="mx-auto h-16"><p class="font-bold text-xs mt-1">${evoData.Name}</p>`;
                evoDiv.onclick = () => confirmEvolution(evoData.Name);
                selectionGrid.appendChild(evoDiv);
            }
        });
        toggleModal(selectionModal, true);
    }

    /**
     * Confirms the form change and updates the game state with the new Pokémon object.
     * @param {string} formName - The name of the new form to change into.
     */
    function confirmFormChange(formName) {
        const selectedValue = managementPokemonSelect.value;
        if (!selectedValue) return;

        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        const pokemon = player?.team[slotId];
        if (!pokemon) return;

        const onAnimationComplete = () => {
            const oldName = pokemon.fullName;
            const newPokemon = createPokemonObject(formName);
            if (newPokemon) {
                player.team[slotId] = newPokemon; // Replace the old Pokémon object with the new one.
                makeAnnouncement(`${oldName} changed form to ${newPokemon.fullName}!`);
            }
            toggleModal(selectionModal, false);
            render();
            playPokemonCry(player.team[slotId]);
        }
        
        animateSprite(playerId, 'evolve', onAnimationComplete); // Use 'evolve' animation for form change.
    }

    /**
     * Confirms the evolution and updates the game state.
     * @param {string} evolutionName - The name of the Pokémon to evolve into.
     */
    function confirmEvolution(evolutionName) {
        const selectedValue = managementPokemonSelect.value;
        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        const pokemonToEvolve = player.team[slotId];

        if (player && pokemonToEvolve) {
            const onAnimationComplete = () => {
                const oldName = pokemonToEvolve.fullName;
                const newPokemon = createPokemonObject(evolutionName);
                if (newPokemon) {
                    player.team[slotId] = newPokemon;
                    makeAnnouncement(`${oldName} evolved into ${evolutionName}!`);
                }
                if (selectionModal.classList.contains('visible')) {
                    toggleModal(selectionModal, false);
                }
                render();
                playPokemonCry(player.team[slotId]);
            }
            animateSprite(playerId, 'evolve', onAnimationComplete);
        } else {
            makeAnnouncement(`Error evolving into ${evolutionName}.`, true);
        }
    }

    /**
     * Handles reviving a fainted Pokémon to 50% HP.
     */
    function handleRevive() {
        const selectedValue = managementPokemonSelect.value;
        if (!selectedValue) {
            makeAnnouncement("Select a fainted Pokémon to revive.", true);
            return;
        }

        const [playerId, slotId] = selectedValue.split('-').map(Number);
        const player = gameState.players.find(p => p.id === playerId);
        const pokemon = player?.team[slotId];

        if (pokemon && pokemon.currentHP <= 0) {
            pokemon.currentHP = Math.floor(pokemon.maxHp / 2); // Revive to 50% HP.
            playHealSound();
            makeAnnouncement(`${pokemon.fullName} has been revived!`);
            render();
        } else {
            makeAnnouncement("This Pokémon is not fainted.", true);
        }
    }


    // --- TIMER FUNCTIONS ---
    function startTimer() { playClickSound(); if (gameState.timer.isRunning) return; gameState.timer.isRunning = true; gameState.timer.interval = setInterval(() => { if (gameState.timer.timeLeft > 0) { gameState.timer.timeLeft--; updateTimerDisplay(); } else { pauseTimer(); } }, 1000); }
    function pauseTimer() { playClickSound(); gameState.timer.isRunning = false; clearInterval(gameState.timer.interval); }
    function resetTimer() { playClickSound(); pauseTimer(); gameState.timer.timeLeft = 120; updateTimerDisplay(); }
    function updateTimerDisplay() { const minutes = Math.floor(gameState.timer.timeLeft / 60); const seconds = gameState.timer.timeLeft % 60; timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; timerDisplay.classList.toggle('low-time', gameState.timer.timeLeft <= 10 && gameState.timer.timeLeft > 0); }

    /**
     * Shows a temporary announcement banner at the top of the screen.
     * @param {string} text - The message to display.
     * @param {boolean} [isError=false] - If true, the banner will have a red border.
     */
    function makeAnnouncement(text, isError = false) {
        if (isError) playErrorSound(); else playConfirmSound();
        const announcementBanner = document.getElementById('announcement-banner');
        const announcementText = document.getElementById('announcement-text');
        announcementText.textContent = text;
        announcementBanner.classList.toggle('border-red-500', isError);
        announcementBanner.classList.toggle('border-white', !isError);
        announcementBanner.classList.remove('hidden');
        announcementBanner.classList.add('announcement-enter');
        setTimeout(() => {
            announcementBanner.classList.remove('announcement-enter');
            announcementBanner.classList.add('announcement-exit');
            setTimeout(() => {
                announcementBanner.classList.add('hidden');
                announcementBanner.classList.remove('announcement-exit');
            }, 500);
        }, 2500);
    }

    /**
     * Plays the cry of a given Pokémon if available.
     * @param {object} pokemon - The Pokémon object from the game state.
     */
    function playPokemonCry(pokemon) {
        if (pokemon && pokemon.cry) {
            const cryAudio = new Audio(pokemon.cry);
            cryAudio.volume = 0.4;
            cryAudio.play().catch(e => console.error("Audio play failed:", e));
        }
    }

    /**
     * Core animation engine. Applies a CSS animation class to a Pokémon's sprite.
     * @param {number} playerId - The ID of the player card to animate.
     * @param {string} animationType - The type of animation (e.g., 'damage', 'heal').
     * @param {function} callback - A function to execute after the animation completes.
     */
    function animateSprite(playerId, animationType, callback) {
        const card = document.getElementById(`player-card-${playerId}`);
        if (!card) { if (callback) callback(); return; }
        const sprite = card.querySelector('.pokemon-sprite');
        if (!sprite) { if (callback) callback(); return; }

        const animationClasses = ['damage-animation', 'heal-animation', 'faint-animation', 'evolve-animation', 'switch-out-animation', 'switch-in-animation'];
        sprite.classList.remove(...animationClasses); // Clean up previous animations.
        void sprite.offsetHeight; // Force a browser reflow to restart the animation.

        const animationClass = `${animationType}-animation`;
        let duration = 800; // Default duration.

        switch (animationType) {
            case 'damage': playAttackSound(); duration = 300; break;
            case 'heal': playHealSound(); duration = 800; break;
            case 'faint': playFaintSound(); duration = 800; break;
            case 'evolve': playEvolveSound(); duration = 1000; break;
            case 'switch-out': duration = 400; break;
            case 'switch-in': duration = 400; break;
        }

        sprite.classList.add(animationClass);
        setTimeout(() => {
            if (sprite.classList.contains(animationClass)) {
                 sprite.classList.remove(animationClass);
            }
            if (callback) callback();
        }, duration);
    }
    
    /**
     * Creates the HTML for the HP gauge segments once at startup for performance.
     */
    function generateGaugeSegmentsHTML() {
        const colors = ['var(--hp-color-red)', 'var(--hp-color-orange)', 'var(--hp-color-yellow-orange)', 'var(--hp-color-yellow)', 'var(--hp-color-yellow-green)', 'var(--hp-color-green)'];
        const totalSegments = 60;
        const totalAngle = 270;
        const startAngle = -135;
        let segments = '';

        for (let i = 0; i < totalSegments; i++) {
            const colorIndex = Math.floor(i / (totalSegments / colors.length));
            const color = colors[colorIndex];
            const rotation = startAngle + (i / (totalSegments - 1)) * totalAngle;
            segments += `<div class="hp-segment-rotator" style="transform: rotate(${rotation}deg);"><div class="hp-segment-visual" style="background-color: ${color};"></div></div>`;
        }
        gaugeSegmentsHTML = segments; // Store the result in the global cache.
    }

    /**
     * Finds a Pokémon's data in the new nested structure, searching through base forms, forms, and evolutions.
     * @param {string} name - The name of the Pokémon to find.
     * @returns {{foundNode: object, baseNode: object}|null} An object containing the found node and its base form node, or null.
     */
    function findPokemonData(name) {
        if (!name) return null;
        
        // Inner recursive function to traverse the data structure.
        function search(node, isTopLevel = false) {
            if (!node || typeof node !== 'object') return null;

            // Check if the current node is the one we're looking for.
            if (node.Name && node.Name.toLowerCase() === name.toLowerCase()) {
                return { foundNode: node, formParentNode: node };
            }

            // Check within the node's forms.
            if (node.forms) {
                for (const formName in node.forms) {
                    const formNode = node.forms[formName];
                    if (formNode.Name && formNode.Name.toLowerCase() === name.toLowerCase()) {
                        return { foundNode: formNode, formParentNode: node };
                    }
                }
            }

            // If at the top level, also search its evolutions recursively.
            if (isTopLevel && node.evolutions) {
                for (const evo of node.evolutions) {
                    const result = search(evo, true);
                    if (result) return result;
                }
            }
            
            return null;
        }

        // Iterate through all top-level Pokémon in the data file.
        for (const topLevelName in pokemonData) {
            const result = search(pokemonData[topLevelName], true);
            if (result) {
                return { foundNode: result.foundNode, baseNode: result.formParentNode };
            }
        }

        return null;
    }

    /**
     * Recursively traverses the entire pokemonData object and caches all unique Pokémon names.
     */
    function cacheAllPokemonNames() {
        const names = new Set();
        const recursiveCache = (pokemonNode) => {
            if (!pokemonNode || typeof pokemonNode !== 'object' || !pokemonNode.Name) return;
            names.add(pokemonNode.Name);

            if (pokemonNode.forms) {
                for (const formName in pokemonNode.forms) recursiveCache(pokemonNode.forms[formName]);
            }
            if (pokemonNode.evolutions) {
                pokemonNode.evolutions.forEach(evo => recursiveCache(evo));
            }
        };

        for (const basePokemonName in pokemonData) {
            recursiveCache(pokemonData[basePokemonName]);
        }
        allPokemonNames = Array.from(names);
    }

    /**
     * Caches Pokémon names from specific tiers, used for the initial game setup.
     */
    function cacheFilteredPokemonNames() {
        const allowedTiers = ['Basic', 'Ultra Beast', 'Legendary', 'Mythical'];
        const names = new Set();
        const recursiveCache = (pokemonNode) => {
            if (!pokemonNode || typeof pokemonNode !== 'object' || !pokemonNode.Name) return;
            
            if (pokemonNode.tier && allowedTiers.includes(pokemonNode.tier)) {
                names.add(pokemonNode.Name);
            }

            if (pokemonNode.forms) {
                for (const formName in pokemonNode.forms) recursiveCache(pokemonNode.forms[formName]);
            }
            if (pokemonNode.evolutions) {
                pokemonNode.evolutions.forEach(evo => recursiveCache(evo));
            }
        };

        for (const basePokemonName in pokemonData) {
            recursiveCache(pokemonData[basePokemonName]);
        }
        filteredPokemonNames = Array.from(names);
    }
    
    /**
     * Enables or disables the management buttons (Evolve, Change Form, Revive)
     * based on the properties of the selected Pokémon.
     */
    function updateManagementButtons() {
        const selectedValue = managementPokemonSelect.value;
        const hasSelection = !!selectedValue;
        
        // Disable all by default.
        evolveBtn.disabled = true;
        changeFormBtn.disabled = true;
        reviveBtn.disabled = true;

        if (hasSelection) {
            const [playerId, slotId] = selectedValue.split('-').map(Number);
            const player = gameState.players.find(p => p.id === playerId);
            const pokemon = player?.team[slotId];
            
            if (pokemon) {
                const isFainted = pokemon.currentHP <= 0;
                // Revive is only enabled if fainted.
                reviveBtn.disabled = !isFainted;
                // Evolve and Change Form are only enabled if not fainted and have valid options.
                const canEvolve = !isFainted && pokemon.data?.evolutions?.length > 0 && pokemon.data.evolutions.some(e => e.Name);
                evolveBtn.disabled = !canEvolve;
                const base = pokemon.baseData || pokemon.data;
                const allForms = [base, ...Object.values(base.forms || {})];
                const otherForms = allForms.filter(f => f.Name && f.Name !== pokemon.fullName);
                changeFormBtn.disabled = isFainted || otherForms.length === 0;
            }
        }
    }

    /**
     * Cycles through weather conditions ('none', 'sandstorm', 'hail').
     */
    function cycleWeather() {
        const weathers = ['none', 'sandstorm', 'hail'];
        const currentIndex = weathers.indexOf(gameState.weather);
        const nextIndex = (currentIndex + 1) % weathers.length;
        gameState.weather = weathers[nextIndex];
        makeAnnouncement(`Weather changed to ${gameState.weather}.`);
        updateWeatherView();
    }

    /**
     * Shows or hides the weather overlay elements based on the current game state.
     */
    function updateWeatherView() {
        sandstormOverlay.classList.toggle('hidden', gameState.weather !== 'sandstorm');
        hailOverlay.classList.toggle('hidden', gameState.weather !== 'hail');
    }

    /**
     * Applies damage from weather effects to appropriate Pokémon at the end of a round.
     */
    function applyWeatherDamage() {
        if (gameState.weather === 'none') return;

        let affected = [];
        gameState.players.forEach(player => {
            const pokemon = player.team[player.activePokemonIndex];
            if (pokemon && pokemon.currentHP > 0) {
                let takeDamage = false;
                // Sandstorm damages non-Rock, Ground, or Steel types.
                if (gameState.weather === 'sandstorm' && !pokemon.types.includes('Rock') && !pokemon.types.includes('Ground') && !pokemon.types.includes('Steel')) {
                    takeDamage = true;
                }
                // Hail damages non-Ice types.
                if (gameState.weather === 'hail' && !pokemon.types.includes('Ice')) {
                    takeDamage = true;
                }
                if (takeDamage) {
                    // Weather damage is 1/16th of max HP.
                    pokemon.currentHP = Math.max(0, pokemon.currentHP - Math.floor(pokemon.maxHp / 16));
                    affected.push(pokemon.fullName);
                }
            }
        });
        if (affected.length > 0) {
            makeAnnouncement(`${affected.join(', ')} are buffeted by the ${gameState.weather}!`);
        }
    }

    /**
     * Changes the parallax background images based on the Pokémon type.
     * @param {string} type - The primary type of the active Pokémon.
     */
    function setArena(type) {
        const backgrounds = arenaBackgrounds[type] || arenaBackgrounds['Normal'];
        const layers = document.querySelectorAll('.parallax-layer');
        layers.forEach((layer, index) => {
            if (backgrounds[index]) {
                layer.style.backgroundImage = `url('${backgrounds[index]}')`;
            }
        });
    }

    /**
     * Plays a type-based entry animation on a player card when a Pokémon switches in.
     * @param {number} playerId - The ID of the player whose card should be animated.
     * @param {string} type - The primary type of the Pokémon entering battle.
     */
    function playEntryAnimation(playerId, type) {
        const card = document.getElementById(`player-card-${playerId}`);
        if (!card) return;
        const container = card.querySelector('.entry-animation-container');
        if (!container) return;

        const effect = document.createElement('div');
        effect.className = 'entry-animation-effect';
        
        // Use a specific animation class if it exists in the CSS, otherwise use a default.
        const typeClass = `entry-anim-${type.toLowerCase()}`;
        let classExists = Array.from(document.styleSheets)
            .flatMap(sheet => { try { return Array.from(sheet.cssRules); } catch { return []; } })
            .some(rule => rule.selectorText === `.${typeClass}`);

        effect.classList.add(classExists ? typeClass : 'entry-anim-default');
        container.appendChild(effect);

        // Remove the animation element after it has played.
        setTimeout(() => {
            effect.remove();
        }, 600); // Must match animation duration in CSS.
    }

    // Start the application!
    init();
});
