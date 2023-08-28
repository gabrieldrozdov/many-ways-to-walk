let body = document.querySelector("body");

// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// HANDWRITING
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Generate and animate handwritten portions
function byhandShuffle(e) {
	let byHandTargets = e.querySelectorAll(".walk-text-byhand");
	for (let i of byHandTargets) {
		temp = '';
		for (let j of i.innerText) {
			temp += `<span style='font-variation-settings:"SCRI" ${Math.floor(Math.random()*100)}, "SCRA" ${Math.floor(Math.random()*100)}'>${j}</span>`
		}
		i.innerHTML = temp;
	}
}
let byhandState = true;
function byhandAnimate() {
	setInterval(() => {
		if (!byhandState) {
			return
		}
		let byhandAnimateSpans = body.querySelectorAll(".walk-text-byhand span");
		for (let i of byhandAnimateSpans) {
			i.style.fontVariationSettings = `"SCRI" ${Math.floor(Math.random()*100)}, "SCRA" ${Math.floor(Math.random()*100)}`;
		}
	}, 200)
}
byhandAnimate();

// Text positions
let walkText = document.querySelector(".walk-text");
let walkTextCenter = walkText.querySelector('.walk-text-center');
let walkTextTop = walkText.querySelector('.walk-text-top');
let walkTextBottom = walkText.querySelector('.walk-text-bottom');
let walkTextLeft = walkText.querySelector('.walk-text-left');
let walkTextRight = walkText.querySelector('.walk-text-right');

// Fade in lines
function walkTextLineFade(e, delay) {
	e.style.opacity = 1;
	e.style.pointerEvents = "none";
	let lines = e.querySelectorAll(".walk-text-line");
	let totalLines = lines.length;
	let currentLine = 0;
	lines[currentLine].style.opacity = 1;
	currentLine++;
	if (currentLine >= totalLines) {
		e.style.pointerEvents = "unset";
	}
	setInterval(() => {
		if (currentLine >= totalLines) {
			e.style.pointerEvents = "unset";
			return
		}
		lines[currentLine].style.opacity = 1;
		currentLine++;
	}, delay)
}

// Clear text within element
function walkTextClear(e) {
	e.style.pointerEvents = "none";
	e.style.opacity = 0;
	setTimeout(() => {
		e.innerHTML = "";
	}, 550)
}



// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// INTERFACE
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Mouse cursor
let walkCursor = document.querySelector('.walk-cursor');
body.addEventListener("mousemove", function (e) {
	walkCursor.style.left = (e.pageX) + 'px';
	walkCursor.style.top = (e.pageY) + 'px';
}, false);
body.addEventListener("mousedown", function (e) {
	Tone.start();
	walkCursor.style.transform = "scale(.6)";
}, false);
body.addEventListener("mouseup", function (e) {
	walkCursor.style.transform = "scale(1)";
}, false);
function walkCursorStep() {
	if (parseInt(walkCursor.dataset.step) == 1) {
		walkCursor.dataset.step = 2;
	} else {
		walkCursor.dataset.step = 1;
	}
}

// Controls
let walkActiveStep = 0;
let walkControls = document.querySelector(".walk-controls");
let walkStepLeft = document.querySelector("#walk-step-left");
let walkStepRight = document.querySelector("#walk-step-right");
walkStepLeft.addEventListener("click", walkControlsFlip);
walkStepRight.addEventListener("click", walkControlsFlip);
walkStepLeft.addEventListener("mouseover", () => {walkCursor.style.opacity = 1});
walkStepRight.addEventListener("mouseover", () => {walkCursor.style.opacity = 1});
walkStepLeft.addEventListener("mouseleave", () => {walkCursor.style.opacity = .2});
walkStepRight.addEventListener("mouseleave", () => {walkCursor.style.opacity = .2});
function walkControlsFlip() {
	console.log(1);
	if (walkActiveStep == 0) {
		walkCursor.dataset.step = 2;
		walkStepLeft.style.pointerEvents = "none";
		walkStepRight.style.pointerEvents = "inherit";
		walkActiveStep = 1;
	} else {
		walkCursor.dataset.step = 1;
		walkStepLeft.style.pointerEvents = "inherit";
		walkStepRight.style.pointerEvents = "none";
		walkActiveStep = 0;
	}
	walkStepNext();
}



// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// AUDIO
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Effects
let walkReverb = new Tone.Reverb().toDestination();
walkReverb.wet.value = .5;
walkReverb.decay.value = 2;

// Footsteps
let walkStepSamplerRanges = {
	'carpet': 12,
	'concrete': 11,
	'creak': 11,
	'echo': 12,
	'gravel': 6,
	'sand': 16,
	'wet': 12,
	'wood': 9,
}
let walkStepSamplerTypes = Object.keys(walkStepSamplerRanges);
let walkStepSamplers = {};
for (let samplerType of walkStepSamplerTypes) {
	let temp = {};
	for (let i=0; i<walkStepSamplerRanges[samplerType]; i++) {
		temp[`C${i+1}`] = `walk-${samplerType + i}.mp3`;
	}
	walkStepSamplers[samplerType] = new Tone.Sampler({
		urls: temp,
		baseUrl: "sound/steps/",
		volume: -10,
	}).toDestination();
	walkStepSamplers[samplerType].connect(walkReverb);
}

// Play footstep given sound type
let notes = ['A','B','C','D','E','F','G'];
let randomNote = () => {return notes[Math.floor(Math.random()*notes.length)]};
function walkPlayStep(sound, vel) {
	let note = `${randomNote() + Math.floor(Math.random()*walkStepSamplerRanges[sound])}`;
	walkStepSamplers[sound].triggerAttackRelease(note, 1, Tone.now(), vel);
}

// Footsteps for each path
const walkPathFootsteps = {
	alley1: 'gravel',
	alley2: 'gravel',
	beach1: 'sand',
	beach2: 'wet',
	beach3: 'sand',
	boardwalk1: 'creak',
	bridge1: 'wood',
	edge1: 'gravel',
	escalator1: 'creak',
	fog1: 'gravel',
	fog2: 'gravel',
	garage1: 'echo',
	garage2: 'echo',
	grass1: 'sand',
	mall1: 'carpet',
	mall2: 'carpet',
	mall3: 'carpet',
	park1: 'concrete',
	park2: 'sand',
	pier1: 'concrete',
	pier2: 'creak',
	pier3: 'creak',
	stairs1: 'concrete',
	store1: 'echo',
	store2: 'echo',
	store3: 'wood',
	store4: 'concrete',
	store5: 'carpet',
	street1: 'concrete',
	street2: 'concrete',
	street3: 'concrete',
	street4: 'concrete',
	street5: 'concrete',
	street6: 'concrete',
	street7: 'concrete',
	street8: 'concrete',
	trail1: 'carpet',
	trail2: 'concrete',
	trail3: 'carpet',
	trail4: 'wood',
	tunnel1: 'concrete',
}
let walkFootstep1 = "carpet";
let walkFootstep1Vel = 1;
let walkFootstep2 = "concrete";
let walkFootstep2Vel = 0;

// Atmospheres
let walkAtmospherePlayer1 = new Tone.Player(`sound/atmospheres/none.mp3`).toDestination();
let walkAtmospherePlayer2 = new Tone.Player(`sound/atmospheres/trail1.mp3`).toDestination();
walkAtmospherePlayer1.loop = true;
walkAtmospherePlayer1.volume.value = -10;
walkAtmospherePlayer2.loop = true;
walkAtmospherePlayer2.volume.value = -10;

// Rhythm
let walkRhythm = new Tone.Player(`sound/rhythm.wav`).toDestination();
walkRhythm.volume.value = -20;
walkRhythm.connect(walkReverb);


// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// WALKING
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Total images in each path
const imgPathRanges = {
	alley1: 59,
	alley2: 53,
	beach1: 230,
	beach2: 116,
	beach3: 178,
	boardwalk1: 233,
	bridge1: 224,
	edge1: 143,
	escalator1: 86,
	fog1: 146,
	fog2: 126,
	garage1: 146,
	garage2: 104,
	grass1: 374,
	mall1: 221,
	mall2: 238,
	mall3: 58,
	park1: 105,
	park2: 248,
	pier1: 352,
	pier2: 133,
	pier3: 88,
	stairs1: 160,
	store1: 72,
	store2: 79,
	store3: 73,
	store4: 61,
	store5: 62,
	street1: 116,
	street2: 324,
	street3: 184,
	street4: 130,
	street5: 119,
	street6: 185,
	street7: 327,
	street8: 181,
	trail1: 305,
	trail2: 336,
	trail3: 272,
	trail4: 180,
	tunnel1: 348,
}
let stepPathKeys = Object.keys(imgPathRanges);

// Tracking variables for alternating featured path
let activePath1 = 'trail1';
let activePath1Range = imgPathRanges[activePath1];
let activePath1Sound = "";
let activePath2 = 'trail2';
let activePath2Range = imgPathRanges[activePath2];
let activePath2Sound = "";

// Total steps taken so far
let walkStepCount = 0;

// Total steps taken in current path
let stepPath1 = 0;
let stepPath2 = 0;

// 2 DOM elements for fading purposes
let walkDOM1 = document.querySelector("#walk-images1");
let walkDOM2 = document.querySelector("#walk-images2");
let activeDOM = walkDOM1;
let inactiveDOM = walkDOM2;
let walkPreload1 = document.querySelector("#walk-preload1");
let walkPreload2 = document.querySelector("#walk-preload2");

// Preload images for current path
let preloadedSteps1 = [];
let preloadedSteps2 = [];
function preloadSteps(targetDOM) {
	let temp = "";
	let stepDivide = 30;
	if (activePath1Range > 100) {
		stepDivide = 50;
	} else if (activePath1Range > 200) {
		stepDivide = 80;
	}
	if (targetDOM == walkDOM1) {
		preloadedSteps1 = [];
		for (let i=0; i<activePath1Range-1; i+=Math.floor(Math.random()*(activePath1Range/stepDivide)+1)) {
			preloadedSteps1.push(i);
			temp += `<img src='imgs/${activePath1}/${activePath1}-${i}.jpg'>`;
		}
		walkPreload1.innerHTML = temp;
	} else {
		preloadedSteps2 = [];
		for (let i=0; i<activePath2Range-1; i+=Math.floor(Math.random()*(activePath2Range/stepDivide)+1)) {
			preloadedSteps2.push(i);
			temp += `<img src='imgs/${activePath2}/${activePath2}-${i}.jpg'>`;
		}
		walkPreload2.innerHTML = temp;
	}
}
preloadSteps(activeDOM);
preloadSteps(inactiveDOM);

// Cap walk speed with cooldown
let cooldown = 0;
setInterval(() => {
	if (cooldown > 0) {
		cooldown--;
	}
}, 50)

// Take step forward
let transitionRange = 20;
function walkStepNext() {
	if (cooldown == 0) {
		walkStepCount++;

		if (activeDOM == walkDOM1) {
			walkPlayStep(walkFootstep1, walkFootstep1Vel);
			stepPath1++;
		} else {
			walkPlayStep(walkFootstep2, walkFootstep2Vel);
			stepPath2++;
		}

		if (stepPath1 >= preloadedSteps1.length-transitionRange) {
			stepPath2++;
			walkDOM2.style.backgroundImage = `url("imgs/${activePath2}/${activePath2}-${preloadedSteps2[stepPath2]}.jpg")`;

			let toZero = (preloadedSteps1.length-stepPath1)/transitionRange;
			let toOne = Math.abs(preloadedSteps1.length-stepPath1-transitionRange)/transitionRange;
			walkDOM1.style.opacity = toZero;
			walkDOM1.style.filter = `brightness(${(toOne+1)*110}%) blur(${toOne*25}px)`;
			walkDOM2.style.opacity = toOne;
			walkDOM2.style.filter = `brightness(${(toZero+1)*100}%) blur(${toZero*25}px)`;

			// Sound transition
			walkFootstep1Vel = toZero;
			walkFootstep2Vel = toOne;
			walkPlayStep(walkFootstep2, walkFootstep2Vel);
			if (stepPath1 == preloadedSteps1.length-transitionRange) {
				walkAtmospherePlayer2.volume.value = -50;
				walkAtmospherePlayer2.start();
			}
			walkAtmospherePlayer1.volume.value = -25*toOne - 10;
			walkAtmospherePlayer2.volume.value = -25*toZero - 10;
			if (toZero == 0) {
				walkAtmospherePlayer1.stop();
			}
		} else if (stepPath2 >= preloadedSteps2.length-transitionRange) {
			stepPath1++;
			walkDOM1.style.backgroundImage = `url("imgs/${activePath1}/${activePath1}-${preloadedSteps1[stepPath1]}.jpg")`;

			let toZero = (preloadedSteps2.length-stepPath2)/transitionRange;
			let toOne = Math.abs(preloadedSteps2.length-stepPath2-transitionRange)/transitionRange;
			walkDOM2.style.opacity = toZero;
			walkDOM2.style.filter = `brightness(${(toOne+1)*110}%) blur(${toOne*25}px)`;
			walkDOM1.style.opacity = toOne;
			walkDOM1.style.filter = `brightness(${(toZero+1)*100}%) blur(${toZero*25}px)`;

			// Sound transition
			walkFootstep2Vel = toZero;
			walkFootstep1Vel = toOne;
			walkPlayStep(walkFootstep1, walkFootstep1Vel);
			if (stepPath2 == preloadedSteps2.length-transitionRange) {
				walkAtmospherePlayer1.volume.value = -50;
				walkAtmospherePlayer1.start();
			}
			walkAtmospherePlayer2.volume.value = -25*toOne - 10;
			walkAtmospherePlayer1.volume.value = -25*toZero - 10;
			if (toZero == 0) {
				walkAtmospherePlayer2.stop();
			}
		}

		console.log(stepPath1);
		console.log(stepPath2);

		if (stepPath1 >= preloadedSteps1.length || stepPath2 >= preloadedSteps2.length) {
			if (activeDOM == walkDOM1) {
				activeDOM = walkDOM2;
				inactiveDOM = walkDOM1;
				newPath(walkDOM1);
			} else {
				activeDOM = walkDOM1;
				inactiveDOM = walkDOM2;
				newPath(walkDOM2);
			}
		} else {
			if (activeDOM == walkDOM1) {
				walkDOM1.style.backgroundImage = `url("imgs/${activePath1}/${activePath1}-${preloadedSteps1[stepPath1]}.jpg")`;
			} else {
				walkDOM2.style.backgroundImage = `url("imgs/${activePath2}/${activePath2}-${preloadedSteps2[stepPath2]}.jpg")`;
			}
			cooldown = 3;
		}
	}
}

// Generates a random key for path object
function randomPath() {
	return stepPathKeys[Math.floor(Math.random()*stepPathKeys.length)];
}

// Initializes div for new walk path
function newPath(targetDOM) {
	if (targetDOM == walkDOM1) {
		activePath1 = randomPath();
		activePath1Range = imgPathRanges[activePath1];
		stepPath1 = 0;
		walkFootstep1 = walkPathFootsteps[activePath1];
		walkAtmospherePlayer1.load(`sound/atmospheres/${activePath1}.mp3`);
	} else {
		activePath2 = randomPath();
		activePath2Range = imgPathRanges[activePath2];
		stepPath2 = 0;
		walkFootstep2 = walkPathFootsteps[activePath2];
		walkAtmospherePlayer2.load(`sound/atmospheres/${activePath2}.mp3`);
	}
	preloadSteps(targetDOM);
}



// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// NARRATIVE
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Resolves for promises and delays
function walkResolveAfterDelay(delay) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}
let walkResolve = false;
function walkResolveCheck() {
	return new Promise(resolve => {
		let loop = setInterval(() => {
			if (walkResolve) {
				resolve();
				clearInterval(loop);
			}
		}, 50);
	});
}
function walkResolveTrigger() {
	walkResolve = true;
	setTimeout(() => {
		walkResolve = false;
	}, 50)
}

// Main sequence
let walkContainer = document.querySelector(".walk-container");
async function walkSequence() {
	walkTextCenter.innerHTML = `
		<span class='walk-text-line'>This is a theater</span>
		<span class='walk-text-line'>and you are an actor</span>
		<span class='walk-text-line'>performing in a show.</span>
	`;
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveAfterDelay(10000);
	walkTextClear(walkTextCenter);
	await walkResolveAfterDelay(750);


	walkTextCenter.innerHTML = `
		<span class='walk-text-line'>Is that okay with you?</span>
		<span class='walk-text-line'>
			<div class='walk-intro-options'>
				<div class='walk-button' onclick='walkResolveTrigger(); walkRhythm.start();'>
					<div class='walk-button-text walk-text-byhand'>Yes.</div>
					<div class='walk-button-background'></div>
				</div>
				<div class='walk-button' onclick='window.close();'>
					<div class='walk-button-text walk-text-byhand'>No.</div>
					<div class='walk-button-background'></div>
				</div>
			</div>
		</span>
	`;
	byhandShuffle(walkTextCenter);
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveCheck();
	walkTextClear(walkTextCenter);
	await walkResolveAfterDelay(750);


	walkTextCenter.innerHTML = `
		<span class='walk-text-line'>This show is called:</span>
		<div class='walk-text-break'></div>
		<span class='walk-text-line walk-text-byhand'>“There are many ways to take a walk.”</span>
	`;
	byhandShuffle(walkTextCenter);
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveAfterDelay(10000);
	walkTextClear(walkTextCenter);
	await walkResolveAfterDelay(750);


	walkTextCenter.innerHTML = `
		<span class='walk-text-line'>One way to take a walk is to <span class="walk-text-byhand">take a walk.</span></span>
		<div class='walk-text-break'></div>
		<span class='walk-text-line'>If you’d like, you can leave the theater</span>
		<span class='walk-text-line'>and take a walk.</span>
	`;
	byhandShuffle(walkTextCenter);
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveAfterDelay(10000);
	walkTextClear(walkTextCenter);
	await walkResolveAfterDelay(750);


	walkTextTop.innerHTML = `
		<span class='walk-text-line'>Another way to take a walk</span>
	`;
	let loop = setInterval(() => {
		walkStepNext();
	}, 1000)
	walkTextLineFade(walkTextTop, 2500);
	await walkResolveAfterDelay(2500);
	walkTextBottom.innerHTML = `
		<span class='walk-text-line'>is to <span class="walk-text-byhand">watch a walk.</span></span>
	`;
	byhandShuffle(walkTextBottom);
	walkTextLineFade(walkTextBottom, 2500);
	await walkResolveAfterDelay(5000);
	walkTextClear(walkTextTop);
	walkTextClear(walkTextBottom);
	await walkResolveAfterDelay(750);


	walkTextLeft.innerHTML = `
		<span class='walk-text-line'>You didn’t take this walk</span>
	`;
	walkTextLineFade(walkTextLeft, 2500);
	await walkResolveAfterDelay(2500);
	walkTextRight.innerHTML = `
		<span class='walk-text-line'>but now you’re taking a walk</span>
	`;
	walkTextLineFade(walkTextRight, 2500);
	await walkResolveAfterDelay(2500);
	walkTextBottom.innerHTML = `
		<span class='walk-text-line walk-text-byhand'>through this walk.</span>
	`;
	byhandShuffle(walkTextBottom);
	walkTextLineFade(walkTextBottom, 2500);
	await walkResolveAfterDelay(5000);
	walkTextClear(walkTextLeft);
	walkTextClear(walkTextRight);
	walkTextClear(walkTextBottom);
	await walkResolveAfterDelay(750);
	clearInterval(loop);
	await walkResolveAfterDelay(1000);


	walkTextTop.innerHTML = `
		<span class='walk-text-line'>A walk can be <span class="walk-text-byhand">hasty</span></span>
	`;
	byhandShuffle(walkTextTop);
	walkTextLineFade(walkTextTop, 2500);
	await walkResolveAfterDelay(1000);
	loop = setInterval(() => {
		walkStepNext();
	}, 350)
	await walkResolveAfterDelay(5000);
	walkTextClear(walkTextTop);
	clearInterval(loop);
	walkTextBottom.innerHTML = `
		<span class='walk-text-line'>or <span class="walk-text-byhand">unhurried</span></span>
	`;
	byhandShuffle(walkTextBottom);
	walkTextLineFade(walkTextBottom, 2500);
	loop = setInterval(() => {
		walkStepNext();
	}, 2500)
	await walkResolveAfterDelay(10000);
	walkTextClear(walkTextBottom);
	clearInterval(loop);
	walkTextLeft.innerHTML = `
		<span class='walk-text-line'>or</span>
	`;
	walkTextLineFade(walkTextLeft, 2500);
	await walkResolveAfterDelay(1000);
	loop = setInterval(() => {
		walkStepNext();
		setTimeout(() => {
			walkStepNext();
		}, 200)
	}, 1000)
	await walkResolveAfterDelay(500);
	walkTextRight.innerHTML = `
		<span class='walk-text-line walk-text-byhand'>irregular.</span>
	`;
	byhandShuffle(walkTextRight);
	walkTextLineFade(walkTextRight, 2500);
	await walkResolveAfterDelay(7000);
	walkTextClear(walkTextLeft);
	walkTextClear(walkTextRight);
	await walkResolveAfterDelay(1000);
	clearInterval(loop);

	walkContainer.style.opacity = .2;
	walkTextCenter.innerHTML = `
		<span class='walk-text-line'>But usually</span>
		<span class='walk-text-line'>walks are taken</span>
		<span class='walk-text-line'><span class="walk-text-byhand">step by step.</span></span>
	`;
	byhandShuffle(walkTextCenter);
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveAfterDelay(10000);
	walkTextClear(walkTextCenter);
	await walkResolveAfterDelay(750);


	walkControls.style.pointerEvents = "all";
	walkContainer.style.opacity = 1;
	walkStepLeft.addEventListener("click", walkResolveTrigger);
	walkTextLeft.innerHTML = `
		<span class='walk-text-line'>Step with your <span class="walk-text-byhand">left foot.</span></span>
	`;
	byhandShuffle(walkTextLeft);
	walkTextLineFade(walkTextLeft, 2500);
	await walkResolveCheck();
	walkStepLeft.removeEventListener("click", walkResolveTrigger);
	walkTextClear(walkTextLeft);
	walkStepRight.addEventListener("click", walkResolveTrigger);
	walkTextRight.innerHTML = `
		<span class='walk-text-line'>Now your <span class="walk-text-byhand">right foot.</span></span>
	`;
	byhandShuffle(walkTextRight);
	walkTextLineFade(walkTextRight, 2500);
	await walkResolveCheck();
	walkStepRight.removeEventListener("click", walkResolveTrigger);
	walkTextClear(walkTextRight);
	walkTextTop.innerHTML = `
		<span class='walk-text-line'>Keep going.</span>
	`;
	walkTextLineFade(walkTextTop, 2500);
	await walkResolveAfterDelay(3000);
	walkTextBottom.innerHTML = `
		<span class='walk-text-line'><span class="walk-text-byhand">Left, right, left, right.</span></span>
	`;
	byhandShuffle(walkTextBottom);
	walkTextLineFade(walkTextBottom, 2500);
	await walkResolveAfterDelay(6000);
	walkTextClear(walkTextTop);
	walkTextClear(walkTextBottom);


	loop = setInterval(() => {
		if (walkStepCount > 250) {
			walkResolveTrigger();
			clearInterval(loop);
		}
	}, 20);
	await walkResolveCheck();
	walkControls.style.pointerEvents = "none";

	walkContainer.style.opacity = .2;
	walkTextCenter.innerHTML = `
		<span class='walk-text-line'><span class="walk-text-byhand">There are many ways to take a walk.</span></span>
	`;
	byhandShuffle(walkTextCenter);
	walkTextLineFade(walkTextCenter, 2500);
	await walkResolveAfterDelay(6000);
	walkTextClear(walkTextCenter);
	walkTextTop.innerHTML = `
		<span class='walk-text-line'>One way to take a walk</span>
	`;
	byhandShuffle(walkTextTop);
	walkTextLineFade(walkTextTop, 2500);
	await walkResolveAfterDelay(3000);
	walkTextBottom.innerHTML = `
		<span class='walk-text-line'>is to feel its <span class="walk-text-byhand">rhythm.</span></span>
	`;
	byhandShuffle(walkTextBottom);
	walkTextLineFade(walkTextBottom, 2500);
	await walkResolveAfterDelay(2500);
	let vignette = document.querySelector(".vignette");
	let walkRhythmStart = false;
	let rhythmLoop = setInterval(() => {
		vignette.style.transition = "unset";
		vignette.style.filter = "invert(50%)";
		setTimeout(() => {
			vignette.style.transition = "filter .5s";
			vignette.style.filter = "invert(0%)";
			walkRhythm.start();
		}, 50)
		if (walkRhythmStart == true) {
			walkControls.style.pointerEvents = "all";
			walkContainer.style.opacity = 1;
			setTimeout(() => {
				walkControls.style.pointerEvents = "none";
				walkContainer.style.opacity = .8;
			}, 250)
			setTimeout(() => {
				walkControls.style.pointerEvents = "all";
				walkContainer.style.opacity = 1;
			}, 600)
		}
	}, 800);
	await walkResolveAfterDelay(8000);
	walkTextClear(walkTextTop);
	walkTextClear(walkTextBottom);
	walkTextLeft.innerHTML = `
		<span class='walk-text-line'>Listen to this <span class="walk-text-byhand">beat.</span></span>
	`;
	byhandShuffle(walkTextLeft);
	walkTextLineFade(walkTextLeft, 2500);
	await walkResolveAfterDelay(3000);
	walkTextRight.innerHTML = `
		<span class='walk-text-line'>Step to that <span class="walk-text-byhand">tempo.</span></span>
	`;
	byhandShuffle(walkTextRight);
	walkTextLineFade(walkTextRight, 2500);
	await walkResolveAfterDelay(3000);
	walkRhythmStart = true;
	await walkResolveAfterDelay(8000);
	walkTextClear(walkTextLeft);
	walkTextClear(walkTextRight);
	loop = setInterval(() => {
		if (walkStepCount > 500) {
			walkResolveTrigger();
			clearInterval(rhythmLoop);
			clearInterval(loop);
		}
	}, 20);
	await walkResolveCheck();
}

walkSequence();


// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————
// MISC
// ——————————————————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————————————————————

// Scroll wheel controls
body.addEventListener("wheel", tempScroll);
function tempScroll(event) {
	// Read scroll event
	if (event.deltaY > 10) {
	} else if (event.deltaY < -10) {
	}
}

// Arrow key controls (for dev testing)
body.addEventListener("keydown", checkKey);
function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') { // up arrow
		walkStepNext();
    }
    else if (e.keyCode == '40') { // down arrow
    }
    else if (e.keyCode == '37') { // left arrow
    }
    else if (e.keyCode == '39') { // right arrow
    }
}