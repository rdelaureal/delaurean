const audioContext = new AudioContext();

let keyboard = null;

// gain variables
let mainGain = null;
let volumeControl = null;

// filter variables
let filter = null;
let filterControl = null;
let filterCutoff = null;
let filterType = null;
let selectedFilter = null;

// envelope variables
let ampEG = null;
let attackControl = null;
let attackTime = null;
let releaseControl = null;
let releaseTime = null;

// oscillator variables
let oscillators = {};
let oscillatorType = null;
let selectedOsc = null;
let LFO = null;
let LFOtype = null;
let LFOfreq = null;

// utility variables
let noteDisplay = null;
let freqDisplay = null;
let preset = null;

freqs = notes();

// map computer keyboard keys to synthesizer keyboard keys
keymap = {
    "z":"C4",
    "s":"C#4",
    "x":"D4",
    "d":"D#4",
    "c":"E4",
    "v":"F4",
    "g":"F#4",
    "b":"G4",
    "h":"G#4",
    "n":"A4",
    "j":"A#4",
    "m":"B4",
    ",":"C5",
    "l":"C#5",
    ".":"D5",
    ";":"D#5",
    "/":"E5",
}

// map keyboard notes to correct frequencies (in hertz)
function notes() {
    freqs = {
        "C4": 261.625565300598634,
        "C#4": 277.182630976872096,
        "D4": 293.664767917407560,
        "D#4": 311.126983722080910,
        "E4": 329.627556912869929,
        "F4": 349.228231433003884,
        "F#4": 369.994422711634398,
        "G4": 391.995435981749294,
        "G#4": 415.304697579945138,
        "A4": 440.000000000000000,
        "A#4": 466.163761518089916,
        "B4": 493.883301256124111,
      
        "C5": 523.251130601197269,
        "C#5": 554.365261953744192,
        "D5": 587.329535834815120,
        "D#5": 622.253967444161821,
        "E5": 659.255113825739859,
    }
    
return freqs;
}

// when website loads, get controls and load synth
document.addEventListener('DOMContentLoaded', function() {

    // get synth controls
    keyboard = document.querySelector("#keyboard");
    oscillatorType = document.querySelector("#oscillator-types");
    volumeControl = document.querySelector("#volume");
    filterCutoff = document.querySelector("#cutoff");
    filterType = document.querySelector('#filter-types');
    attackControl = document.querySelector('#attack');
    releaseControl = document.querySelector('#release');
    LFOtype = document.querySelector('#lfo-type');
    LFOfreq = document.querySelector('#lfo-hz');
    noteDisplay = document.querySelector('#display-note');
    freqDisplay = document.querySelector('#display-freq');
    resetButton = document.querySelector('#reset-button');
    loadPresetButton = document.querySelector('#load-preset-button');
    savePresetButton = document.querySelector('#save-preset-button');

    // load the synth
    synth();

})


function synth() {
    // initialize main gain and volume control
    mainGain = audioContext.createGain();
    mainGain.connect(audioContext.destination);
    setVolume();
    volumeControl.addEventListener("change", setVolume);

    // initialize oscillator settings
    setOsc();
    oscillatorType.addEventListener('change', setOsc);

    // initialize filter
    filter = audioContext.createBiquadFilter();
    filter.connect(mainGain);
    setFilter();
    filterCutoff.addEventListener("change", setFilter);
    filterType.addEventListener("input", setFilter);

    // initialize envelope generator
    // TODO: for polysynth need separate EG for each oscillator that's playing
    ampEG = audioContext.createGain();
    ampEG.connect(filter);
    setEnvelope();
    attackControl.addEventListener('change', setEnvelope);
    releaseControl.addEventListener('change', setEnvelope);

    // initialize LFO
    LFO = audioContext.createOscillator();
    LFO.connect(mainGain.gain);
    setLFO();
    LFOtype.addEventListener('change', setLFO);
    LFOfreq.addEventListener('change', setLFO);
    LFO.start();

    // initialize buttons and presets
    resetButton.addEventListener('click', resetSynth);
    if (savePresetButton != null) {
        savePresetButton.addEventListener('click', savePreset);
        loadPresetButton.addEventListener('click', loadPreset);    
    }

    // get keyboard keys and add event listeners
    keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.addEventListener('mousedown', keyPress);
        key.addEventListener('mouseup', keyRelease);
    })

    // listen for (computer) keyboard events
    window.addEventListener('keydown', (event) => {
        if (event.repeat) {return};
        keyPress(event);
    })
    window.addEventListener('keyup', keyRelease)

}

// play a note
function play(freq) {

    // create oscillator
    const osc = audioContext.createOscillator();
    osc.connect(ampEG);
    osc.frequency.value = freq;
    osc.type = selectedOsc;
  
    // set amp envelope
    ampEG.gain.cancelScheduledValues(audioContext.currentTime);
    ampEG.gain.setValueAtTime(0, audioContext.currentTime);
    ampEG.gain.linearRampToValueAtTime(parseFloat(volumeControl.value), audioContext.currentTime + attackTime);

    osc.start();
  
    return osc;
}

// trigger play function when key is pressed
function keyPress(event) {
    console.log(event.type);
    let note = null;
    if (event.type === 'mousedown') {
        note = event.target.dataset['note'];
    } else if (event.type === 'keydown') {
        note = keymap[event.key];
    }
    oscillators[note] = play(freqs[note]);
    console.log(oscillators)

    // change key color while pressed
    let key = document.querySelector(`[data-note="${note}"]`);
    key.style.backgroundColor = 'paleturquoise';

    // display last note pressed
    const freq = freqs[note].toFixed(2);
    noteDisplay.innerText = note;
    freqDisplay.innerText = freq.toString();
}

// stop tone when key is released
function keyRelease(event) {
    let note = null;
    if (event.type === 'mouseup') {
        note = event.target.dataset['note'];
    } else if (event.type === 'keyup') {
        note = keymap[event.key];
    }
    
    // set release envelope
    ampEG.gain.cancelScheduledValues(audioContext.currentTime);
    ampEG.gain.linearRampToValueAtTime(0, audioContext.currentTime + releaseTime);

    // stop oscillator
    osc = oscillators[note]
    osc.stop(audioContext.currentTime + releaseTime);

    delete oscillators[note];

    // change key color back to normal
    let key = document.querySelector(`[data-note="${note}"]`);
    if (key.classList.contains('white')) {
        key.style.backgroundColor = 'white';
    } else if (key.classList.contains('black')) {
        key.style.backgroundColor = 'black';
    }

}

// change the volume
function setVolume() {
    mainGain.gain.value = volumeControl.value;
}

// set the oscillator controls
function setOsc() {
    // get selected oscillator type from radio buttons
    const oscNodes = oscillatorType.childNodes;
    for (i=0; i < oscNodes.length; i++) {
        if (oscNodes[i].nodeName === 'INPUT') {
            if (oscNodes[i].checked === true) {
                selectedOsc = oscNodes[i].value;
            }
        }
    }
}

// set the filter 
function setFilter() {
    filter.frequency.value = parseFloat(filterCutoff.value);
    filter.gain.value = 25;

    // get selected filter type from radio buttons
    const filterTypeNodes = filterType.childNodes;
    for (i=0; i < filterTypeNodes.length; i++) {
        if (filterTypeNodes[i].nodeName === 'INPUT') {
            if (filterTypeNodes[i].checked === true) {
                selectedFilter = filterTypeNodes[i].value;
            }
        }
    }

    filter.type = selectedFilter;

    console.log(filter);
}

// set the envelope
function setEnvelope() {
    attackTime = parseFloat(attackControl.value, 10);
    releaseTime = parseFloat(releaseControl.value, 10);
}

// set the LFO
function setLFO() {
    LFO.frequency.value = parseFloat(LFOfreq.value);
    LFO.type = LFOtype.options[LFOtype.selectedIndex].value;
}

// reset the synth
function resetSynth() {
    console.log('clicked')
    oscillatorType.childNodes[5].checked = true;
    volumeControl.value = .5;
    filterCutoff.value = 5000;
    filterType.childNodes[1].checked = true;
    attackControl.value = .1;
    releaseControl.value = .3;
    LFOtype.options[0].selected = true;
    LFOfreq.value = 0;
    noteDisplay.innerText = "X";
    freqDisplay.innerText = "000.00";

    let presets = document.querySelector('#presets');
    if (presets != null) {
        presets.options[0].selected = true;
    }

    setOsc();
    setVolume();
    setFilter();
    setEnvelope();
    setLFO();
}

// save current control settings as preset
function savePreset() {
    let title = prompt("Please enter a name for your new preset.");

    if (title === null || title === "") {
        window.alert("A name is required in order to save a preset. Please try again.")
    }
    else {

        // save current synth settings
        const presetData = new FormData();
        presetData.append('title', title);
        presetData.append('oscillatorType', selectedOsc)
        presetData.append('filterCutoff', filterCutoff.value)
        presetData.append('filterType', selectedFilter)
        presetData.append('attackTime', attackControl.value)
        presetData.append('releaseTime', releaseControl.value)
        presetData.append('LFOtype', LFOtype.value)
        presetData.append('LFOfreq', LFOfreq.value)

        // Display the values
        for (const value of presetData.values()) {
            console.log(value);
        }

        // get CSRF cookie
        const csrftoken = getCookie('csrftoken');

        // send form data via AJAX POST
        var ajaxPost = new XMLHttpRequest();
        ajaxPost.open("POST", "/presets");
        ajaxPost.setRequestHeader('X-CSRFToken', csrftoken)
        ajaxPost.onload = function () {
          console.log(this.response);
        };
        ajaxPost.send(presetData);

    }
}

// load a preset
function loadPreset() {
    let presets = document.querySelector('#presets');
    preset = presets.options[presets.selectedIndex].value;

    if (preset != 'blank') {
        // get preset details from server
        fetch(`/presets/${preset}`)
        .then(response => response.json())
        .then(preset => {
            console.log(preset);
            
            // reload synth with preset data
            attackControl.value = preset.attackTime;
            releaseControl.value = preset.releaseTime;
            filterCutoff.value = preset.filterCutoff;
            LFOfreq.value = preset.LFOfreq;

            // set oscillator types
            const oscTypeNodes = oscillatorType.childNodes;
            const filterTypeNodes = filterType.childNodes;
            const lfoTypeOptions = LFOtype.options;

            for (i=0; i < oscTypeNodes.length; i++) {
                if (oscTypeNodes[i].nodeName === 'INPUT') {
                    if (oscTypeNodes[i].value === preset.oscillatorType) {
                        oscTypeNodes[i].checked = true;
                    }
                }
            }
            for (i=0; i < filterTypeNodes.length; i++) {
                if (filterTypeNodes[i].nodeName === 'INPUT') {
                    if (filterTypeNodes[i].value === preset.filterType) {
                        filterTypeNodes[i].checked = true;
                    }
                }
            }
            for (i=0; i < lfoTypeOptions.length; i++) {
                if (lfoTypeOptions[i].value === preset.LFOtype) {
                    lfoTypeOptions[i].selected = true;
                }
            }
        
            setFilter();
            setEnvelope();
            setLFO();
        });
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}