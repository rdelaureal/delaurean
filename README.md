# The de Laurean Web Synthesizer

The de Laurean is a web-based synthesizer with polyphonic capabilities, created by Ryan de Laureal for Harvard's CS50 Web course. Written using Django and Javascript's [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and playable via a user's mouse or computer keyboard, it contains a digital oscillator, filter, amplitude envelope generator, and low-frequency oscillator. It allows for user control of filter cutoff frequency, envelope attack and release time, LFO frequency, and volume, and provides the user a choice between four different oscillator waveforms.

The application makes use of Django's database models, allowing users to register for accounts in order to save different synthesizer settings as "presets" and load them back for later use. It is styled to be mobile-responsive.

## Distinctiveness and complexity.

No other assignment in CS50 Web explores audio applications or the Web Audio API, making this project wholly distinct from others in the course. To satisfy the complexity requirement, the synthesizer has been coded from scratch, not utilizing any external Javascript libraries. The project contains 15 distinct Javascript functions and over 400 lines of code, making it twice as complex as other projects in the course, and with more interactive features. It utilizes two Django models: one User model, which allows users to register for accounts, and a Preset model, allowing users to store their synthesizer settings as presets and load them back for later use.

## What’s contained in each file.

On the backend is a Django project with a single "synth" app: its views are contained in **synth/views.py**, its database models can be found in **synth/models.py**, and its URL routes can be found in **synth/urls.py**. 

The project utilizes four HTML pages, found in the "synth/templates" folder, each extending a **layout.html** file: an about page (**about.html**), a login page (**login.html**), a registration page (**register.html**), and the main application page (**index.html**). These are styled using Bootstrap, Google Fonts, and a **styles.css** file, found in the "synth/static" folder.

The bulk of the project's functionality resides in the **synth.js** file. First, a new AudioContext is created an a number of global variables are declared, which will later be updated and utilized by the various functions. The `notes()` function maps each musical note to its frequency in hertz, allowing for the correct sound to be generated, and the user's keyboard keys are mapped to the notes of the synthesizer keyboard in the keymap object.

When the webpage is loaded, the synthesizer is initialized: new AudioNodes are created and connected to the AudioContext, and event listeners are added to the synth controls and keyboard. Now when the synth controls are altered, functions are triggered, updating the properties of the active AudioNodes. Pressing a key triggers the `keyPress()` function, which then triggers the `play()` function, where a new OscillatorNode is created, generating a tone. When a key is released, the `keyRelease()` function is triggered, stopping the tone.

When the synth's Reset button is clicked, the `resetSynth()` function is triggered, reverting the synth controls back to their default settings. The `savePreset()` and `loadPreset()` functions, connected to their respective buttons, perform AJAX requests to the server to GET and POST synth preset data, allowing for presets to be stored and retrieved from Django's SQLite database. 

## How to run the application.

Once the project is running on a server, visiting the homepage will load the synthesizer. At the top are five color-coded modules, allowing the user to control the oscillator, filter, envelope, LFO, and volume settings. Below that is a 17-note keyboard, beginning at middle C (C4) and running through E5, which can be played by either clicking on a key with the mouse, or via the user's computer keyboard by pressing the letter-keys corresponding to each keyboard key. When a key is pressed, a tone will be generated and the musical note and frequency (in hertz) will display in the orange utilities module.

Below the keyboard, a Reset button, when clicked, will revert the synthesizer back to its default settings, and if the user is not logged in, a message will be displayed with a link to the registration page. Clicking this link will allow the user to create an account, and existing users can log in by clicking the link in the top navigation bar.

Once a user is logged in, a drop-down menu and two additional buttons will appear below the keyboard. The Save Preset button will allow the user to save the synthesizer's current settings; clicking it will generate a pop-up alert prompting the user to enter a name for their new preset. Once a preset has been saved, it will appear in the drop-down menu, allowing the user to select it and load it by clicking the Load Preset button.

The synthesizer has polyphonic capabilities, meaning that multiple notes can be played simultaneously by pressing multiple keys.

## Additional information.

The application functions best in Firefox.
