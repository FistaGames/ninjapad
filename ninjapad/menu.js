// 2021 Ninja Dynamics
// Creative Commons Attribution 4.0 International Public License

ninjapad.menu = function() {

    const pop = ninjapad.utils.pop;
    const inColor = ninjapad.utils.inColor;
    const iRModes = ["OFF", "ON-R", "ON-S"];

    var countdown = null;
    var isOpen = false;
    var iRMode = 0;

    var fnESC = null;
    var fnESCArgs = [];

    function recMenu() {
        const states = ninjapad.recorder.states();
        const status = ninjapad.recorder.status();
        const hasData = ninjapad.recorder.hasData();
        const isStopped = status == states.STOP;
        const isRecording = status == states.REC;
        return ninjapad.utils.createMenu(null,
            ninjapad.utils.link(
                isRecording ? "Restart" : "Record",
                js="ninjapad.menu.inputRecorder.start();"
            ),
            ninjapad.utils.link(
                "Play",
                js="ninjapad.menu.inputRecorder.play();",
                hide=!(hasData && isStopped)
            ),
            ninjapad.utils.link(
                "Stop",
                js="ninjapad.menu.inputRecorder.stop()",
                hide=isStopped
            ),
            ninjapad.utils.link(
                "Clear",
                js="ninjapad.menu.inputRecorder.clear()",
                hide=!(hasData && isStopped)
            ),
            ninjapad.utils.link(
                "Import",
                js="ninjapad.menu.inputRecorder.import()",
                hide=!isStopped
            ),
            ninjapad.utils.link(
                "Export",
                js="ninjapad.menu.inputRecorder.export()",
                hide=!(hasData && isStopped)
            )
        );
    }

    function optionsMenu() {
        return ninjapad.utils.createMenu(null,
            ninjapad.utils.link(
                "Import save data",
                js="ninjapad.menu.showMessage('Not implemented yet')"
            ),
            ninjapad.utils.link(
                "Export save data",
                js="ninjapad.menu.showMessage('Not implemented yet')"
            ),
            ninjapad.utils.link(
                `Input recorder ${inColor("lime", iRModes[iRMode])}`,
                js=`ninjapad.menu.inputRecorder.selectMode();
                ninjapad.menu.show.optionsMenu()`
            )
        );
    }

    function mainMenu() {
        return ninjapad.utils.createMenu(null,
            ninjapad.utils.link(
                "Load ROM",
                js="ninjapad.menu.uploadROM()",
                hide=SINGLE_ROM
            ),
            ninjapad.utils.link(
                "Save State",
                js="ninjapad.menu.saveState()"
            ),
            ninjapad.utils.link(
                "Load State",
                js="ninjapad.menu.loadState()"
            ),
            ninjapad.utils.link(
                "Options",
                js="ninjapad.menu.show.optionsMenu()"
            ),
            ninjapad.utils.link(
                "Reset",
                js="ninjapad.menu.reset()"
            ),
            ninjapad.utils.link(
                "About",
                js="ninjapad.menu.about()"
            )
        );
    }

    function allowUserInteraction(ontap=null) {
        ninjapad.utils.allowInteraction("pauseScreenContent");
        ninjapad.utils.assignNoPropagation(ontap, "OSD", ontap && "end");
    }

    function preventUserInteraction(ontap=null) {
        ninjapad.utils.assign(null, "pauseScreenContent");
        ninjapad.utils.assignNoPropagation(ontap, "OSD", ontap && "end");
    }

    function showMessage(msg, backtap) {
        if (!ninjapad.pause.state.isEmulationPaused) {
            DEBUG && console.log("NinjaPad:", msg);
            return;
        }
        ninjapad.pause.setScreenContent(
            ninjapad.utils.html("div", "error", msg)
        );
        preventUserInteraction(backtap);
        fnESC = backtap;
    }

    function showMenu(fnMenu, backtap=null) {
        ninjapad.pause.setScreenContent(fnMenu());
        allowUserInteraction(backtap);
        fnESC = backtap;
    }

    function openMenu(menu, backtap=null) {
        ninjapad.pause.pauseEmulation(menu());
        allowUserInteraction(backtap);
        fnESC = backtap;
        isOpen = true;
    }

    function returnToMainMenu(event) {
        if (event) event.stopPropagation();
        showMenu(mainMenu, closeMenuAndResumeEmulation);
    }

    function returnToRecorderMenu(event) {
        if (event) event.stopPropagation();
        showMenu(recMenu, closeMenuAndResumeEmulation);
    }

    function closeMenuAndResumeEmulation(event) {
        if (event) event.stopPropagation();
        if (ninjapad.pause.state.cannotResume) return false;
        var color_off = ninjapad.utils.getCSSVar("#menu", "color");
        ninjapad.utils.changeButtonColor("#menu", color_off);
        ninjapad.pause.state.isEmulationPaused && ninjapad.pause.resumeEmulation();
        fnESC = null; fnESCArgs = [];
        isOpen = false;
        return true;
    }

    return {
        pressESC: function() {
            if (fnESC) {
                fnESC(...fnESCArgs);
                fnESC = null; fnESCArgs = [];
                return;
            }
            ninjapad.menu.toggle.mainMenu();
        },

        loadState: function(id="", resume=true) {
            const romData = ninjapad.emulator.getROMData();
            if (!romData) {
                showMessage("No ROM loaded", returnToMainMenu);
                return;
            }
            const hash = sha256(romData);
            const data = localStorage.getItem(id + hash);
            if (!data) {
                showMessage("No save data", returnToMainMenu);
                return {id: hash, result: false};
            }
            try {
                ninjapad.emulator.loadState(
                    uint8ToUtf16.decode(data)
                );
                if (resume) closeMenuAndResumeEmulation();
                return {id: hash, result: true};
            }
            catch (e) {
                showMessage(`Error<br/><br/>${e.message}`, returnToMainMenu);
                DEBUG && console.log(e);
                return {id: hash, result: false};
            }
        },

        saveState: function(id="", resume=true) {
            const romData = ninjapad.emulator.getROMData();
            if (!romData) {
                showMessage("No ROM loaded", returnToMainMenu);
                return {id: null, result: false};
            }
            const hash = sha256(romData);
            const data = ninjapad.emulator.saveState();
            try {
                const optimizedData = uint8ToUtf16.encode(data);
                localStorage.setItem(id + hash, optimizedData);
                if (resume) closeMenuAndResumeEmulation();
                return {id: hash, result: true};
            }
            catch (e) {
                showMessage(`Error<br/><br/>${e.message}`, returnToMainMenu);
                DEBUG && console.log(e);
                return {id: hash, result: false};
            }
        },

        reset: function() {
            ninjapad.emulator.reloadROM();
            ninjapad.menu.inputRecorder.ready();
            ninjapad.recorder.clear();
            closeMenuAndResumeEmulation();
        },

        uploadROM: function() {
            ninjapad.jQElement.uploadROM.trigger("click");

            const inputElement = document.getElementById("uploadROM");
            inputElement.addEventListener("change", handleFiles, false);

            function handleFiles() {
                inputElement.removeEventListener("change", handleFiles);
                const file = ninjapad.utils.getFile(inputElement);
                if (!file) return false;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                const isROMLoaded = ninjapad.emulator.isROMLoaded()
                var saveData = isROMLoaded ? ninjapad.emulator.saveState() : null;
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        ninjapad.emulator.loadROMData(reader.result);
                        ninjapad.menu.inputRecorder.ready();
                        ninjapad.recorder.clear();
                        ninjapad.autoload();
                        closeMenuAndResumeEmulation();
                    }
                    catch (e) {
                        if (saveData) {
                            ninjapad.emulator.reloadROM();
                            ninjapad.emulator.loadState(saveData);
                        }
                        showMessage(
                            `Error<br/><br/>${e.message.strip(".")}`,
                            returnToMainMenu
                        );
                        DEBUG && console.log(e);
                    }
                }
                reader.readAsBinaryString(file);
            }
        },

        show: {
            recorderMenu: function() {
                return showMenu(recMenu, closeMenuAndResumeEmulation);
            },

            optionsMenu: function() {
                return showMenu(optionsMenu, returnToMainMenu);
            }
        },

        about: function() {
            ninjapad.pause.setScreenContent(
                ninjapad.utils.html("div", "about", ABOUT)
            )
            allowUserInteraction(returnToMainMenu);
            fnESC = returnToMainMenu;
        },

        open: {
            inputRecorder: function(event) {
                if (event) event.stopPropagation();
                var color_on = ninjapad.utils.getCSSVar("#menu", "color_on");
                ninjapad.utils.changeButtonColor("#menu", color_on, glow=true);
                openMenu(recMenu, closeMenuAndResumeEmulation);
            }
        },

        close: function() {
            closeMenuAndResumeEmulation();
        },

        toggle: {
            mainMenu: function() {
                if (isOpen) {
                    closeMenuAndResumeEmulation();
                    clearInterval(countdown);
                    countdown = null;
                    return;
                }
                var color_on = ninjapad.utils.getCSSVar("#menu", "color_on");
                ninjapad.utils.changeButtonColor("#menu", color_on, glow=true);
                openMenu(mainMenu, closeMenuAndResumeEmulation);
            }
        },

        showMessage: function(msg, backtap) {
            showMessage(msg, backtap);
        },

        inputRecorder: {
            show: function() {
                ninjapad.jQElement.recMenu.html(`
                    <div><a href="#" onclick="ninjapad.menu.open.inputRecorder();">
                        VCR MENU
                    </a></div>
                `);
            },

            ready: function() {
                ninjapad.jQElement.recStatus.html(`
                    <div>READY</div>
                `);
            },

            start: function() {
                var secs = 3;
                ninjapad.pause.pauseEmulation(secs);
                preventUserInteraction();
                function _start() {
                    ninjapad.pause.setScreenContent(--secs);
                    if (secs) return;
                    clearInterval(countdown);
                    countdown = null;
                    ninjapad.recorder.start();
                    ninjapad.jQElement.recStatus.html(`
                        <div style="font-size: 3vmin;">🔴</div>
                        <div>&nbsp;REC</div>
                    `);
                }
                if (iRMode == 1) ninjapad.emulator.reloadROM();
                countdown = setInterval(_start, 1000);
            },

            stop: function() {
                ninjapad.menu.inputRecorder.ready();
                ninjapad.recorder.setCallback("stop", ninjapad.menu.show.recorderMenu);
                ninjapad.recorder.stop();
            },

            cancel: function() {
                if (!countdown) return false;
                // - - - - - - - - - - - - - - - -
                ninjapad.menu.show.recorderMenu();
                clearInterval(countdown);
                countdown = null;
                return true;
            },

            play: function() {
                ninjapad.jQElement.recStatus.html(`
                    <div style="font-size: 5vmin; color: lime">▶</div>
                    <div>&nbsp;PLAY</div>
                `);
                ninjapad.recorder.setCallback("play", ninjapad.menu.inputRecorder.ready);
                ninjapad.recorder.play();
            },

            clear: function() {
                ninjapad.menu.inputRecorder.ready();
                ninjapad.recorder.setCallback("clear", ninjapad.menu.show.recorderMenu);
                ninjapad.recorder.clear();
            },

            import: function() {
                ninjapad.jQElement.uploadRec.trigger("click");

                const inputElement = document.getElementById("uploadRec");
                inputElement.addEventListener("change", handleFiles, false);

                function handleFiles() {
                    inputElement.removeEventListener("change", handleFiles);
                    const file = ninjapad.utils.getFile(inputElement);
                    if (!file) return false;
                    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    const reader = new FileReader();
                    reader.onload = function () {
                        try {
                            const data = new Uint8Array(reader.result);
                            const files = fflate.unzipSync(data);
                            const replay = fflate.objFromU8(files.metaData);
                            replay.inputData = files.inputData;
                            replay.saveData = files.saveData;
                            if (!ninjapad.recorder.import(replay, true)) {
                                showMessage(
                                    ninjapad.recorder.getErrorMessage(true),
                                    returnToRecorderMenu
                                );
                                return false;
                            }
                            // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                            showMessage(
                                "Import successful",
                                returnToRecorderMenu
                            );
                            return true;
                        }
                        catch (e) {
                            showMessage(
                                `Error<br/><br/>${e.message.strip(".")}`,
                                returnToRecorderMenu
                            );
                            DEBUG && console.log(e);
                            return false;
                        }
                    }
                    reader.readAsArrayBuffer(file);
                    return true;
                }
            },

            export: function() {
                const exportData = ninjapad.recorder.export();
                const saveData = exportData.pop("saveData");
                const inputData = exportData.pop("inputData");
                const metaData = fflate.strToU8(JSON.stringify(exportData));
                const filename = exportData.romHash.substring(48);
                const filedata = fflate.zipSync(
                    {
                        "metaData": metaData,
                        "inputData": inputData,
                        "saveData": saveData
                    },
                    {
                        level: 0
                    }
                );
                try {
                    ninjapad.utils.download(
                        filedata, filename,
                        "application/zip"
                    );
                }
                catch (e) {
                    showMessage(e, null);
                }
            },

            selectMode: function(mode) {
                iRMode = (
                    mode == undefined ?
                    ninjapad.utils.nextIndex(iRModes, iRMode) :
                    mode
                );
                if (iRMode) {
                    ninjapad.jQElement.recMenu.show();
                    ninjapad.jQElement.recStatus.show();
                }
                else {
                    ninjapad.jQElement.recMenu.hide();
                    ninjapad.jQElement.recStatus.hide();
                }
            }
        }
    }
}();
