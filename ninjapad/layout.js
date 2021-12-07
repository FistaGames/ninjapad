// 2021 Ninja Dynamics
// Creative Commons Attribution 4.0 International Public License

ninjapad.layout = function() {
    var coldStart = true;

    function setOSDLayout() {

        // Cache screen size
        const scrHeight = ninjapad.jQElement.emuScreen.height();
        const scrWidth = ninjapad.jQElement.emuScreen.width();

        // Setup menu screen
        var osd = ninjapad.jQElement.osd;
        ninjapad.jQElement.osd.empty();
        ninjapad.jQElement.osd.detach().appendTo(ninjapad.jQElement.emuScreen);
        ninjapad.jQElement.osd.css("top", 0);
        ninjapad.jQElement.osd.css("left", 0);
        ninjapad.jQElement.osd.css("height", scrHeight);
        ninjapad.jQElement.osd.css("width", scrWidth);
        ninjapad.jQElement.osd.css("visibility", ninjapad.pause.pauseScreen.visibility);
        ninjapad.jQElement.osd.css("font-size", 0.05 * scrHeight);
        ninjapad.jQElement.osd.css("word-spacing", "0.5em");
        ninjapad.jQElement.osd.css("padding", "2em");
        ninjapad.jQElement.osd.append(ninjapad.pause.pauseScreen.content);

        // Setup input recorder menu
        var offset = `${ninjapad.jQElement.emuScreen.width() * 0.06}px`;
        ninjapad.jQElement.recMenu.css("right", offset);
        ninjapad.jQElement.recMenu.css("bottom", offset);
        ninjapad.jQElement.recMenu.css("font-size", 0.05 * scrHeight);
        ninjapad.jQElement.recMenu.css("padding", "0.2em");

        // Setup input recorder status
        ninjapad.jQElement.recStatus.css("left", offset);
        ninjapad.jQElement.recStatus.css("bottom", offset);
        ninjapad.jQElement.recStatus.css("font-size", 0.05 * scrHeight);
        ninjapad.jQElement.recStatus.css("padding", "0.2em");

        // Set visibility
        ninjapad.menu.inputRecorder.show();
        ninjapad.menu.inputRecorder.ready();
        ninjapad.menu.inputRecorder.selectMode(-1);
    }

    function setEmulationScreenLayout() {
        ninjapad.jQElement.emuScreen.removeAttr("style");
        ninjapad.jQElement.emuScreen.css("width", ninjapad.emulator.display.width);
        ninjapad.jQElement.emuScreen.css("height", ninjapad.emulator.display.height);
        ninjapad.jQElement.emuScreen.css("margin", "auto");
        ninjapad.jQElement.emuScreen.css("position", "relative");
    }

    function setDesktopLayout() {
        DEBUG && console.log("NinjaPad: Desktop mode selected");

        var useJQuery = !ninjapad.utils.isFullScreen() || ninjapad.utils.isIOSDevice();
        var width = useJQuery ? $(window).width() : window.innerWidth;
        var height = useJQuery ? $(window).height() : window.innerHeight;

        if (width > height) {
            ninjapad.jQElement.emuScreen.height("100%");
            var newHeight = ninjapad.jQElement.emuScreen.height();
            ninjapad.jQElement.emuScreen.width(256 * (newHeight / 240));
        }
        else {
            ninjapad.jQElement.emuScreen.width("100%");
            var newWidth = ninjapad.jQElement.emuScreen.width();
            ninjapad.jQElement.emuScreen.height(240 * (newWidth / 256));
        }
        ninjapad.jQElement.gamepad.height("0%");
        ninjapad.jQElement.gamepadButtons.hide();

        $("#REC_MENU").detach().appendTo(ninjapad.jQElement.emuScreen);
        $("#REC_STATUS").detach().appendTo(ninjapad.jQElement.emuScreen);
        var fontSize = `${ninjapad.jQElement.emuScreen.width() * 0.05}px`;
        ninjapad.jQElement.osd.css("font-size", fontSize);
    }

    function setMobileLayout() {
        DEBUG && console.log("NinjaPad: Mobile mode selected");

        if (coldStart) {
            DEBUG && console.log("NinjaPad: Mobile mode: Cold start");
            $("#ninjaPad").css("height", "100%");
            $("body").removeAttr("style").css("margin", "0%");
            setEmulationScreenLayout();
            ninjapad.jQElement.emuScreen.detach().appendTo("#SCREEN");
            $("#REC_MENU").detach().appendTo(ninjapad.jQElement.emuScreen);
            $("#REC_STATUS").detach().appendTo(ninjapad.jQElement.emuScreen);
            $("body *").not("#ninjaPad *").not("#ninjaPad").remove();
            coldStart = false;
        }

        var useJQuery = !ninjapad.utils.isFullScreen() || ninjapad.utils.isIOSDevice();
        var width = useJQuery ? $(window).width() : window.innerWidth;
        var height = useJQuery ? $(window).height() : window.innerHeight;

        if (height >= width || window.matchMedia("(orientation: portrait)").matches) {

            $("#SCREEN").detach().appendTo("#ninjaPad");
            $("#GAMEPAD").detach().appendTo("#ninjaPad");

            $("#GAMEPAD").removeAttr("style");

            var dPadState = $("#DPAD").css("display");
            $("#DPAD").removeAttr("style").css("display", dPadState);

            var analogState = $("#ANALOG").css("display");
            $("#ANALOG").removeAttr("style").css("display", analogState);

            $("#ACTION").removeAttr("style");

            $("#FUNCTIONAL-TR").removeAttr("style");
            $("#FUNCTIONAL-BL").removeAttr("style");

            $("#BUTTON_SELECT").css("top", "").detach().appendTo("#FUNCTIONAL-TR");
            $("#BUTTON_START").css("top", "").detach().appendTo("#FUNCTIONAL-BL");

            $("#analogSwitch").css("top", "").detach().appendTo("#FUNCTIONAL-TR");
            $("#menu").css("top", "").detach().appendTo("#FUNCTIONAL-BL");

            var opacity = 1;
            var bottom = "auto";

            ninjapad.jQElement.emuScreen.width(window.innerWidth);
            //ninjapad.jQElement.emuScreen.css("top", "0vh");
            var newWidth = ninjapad.jQElement.emuScreen.width();
            ninjapad.jQElement.emuScreen.height(240 * (newWidth / 256));

            var padHeight = ninjapad.utils.vw(47.5);
            var remainingHeight = height - ninjapad.jQElement.emuScreen.height();
            ninjapad.jQElement.gamepad.height(Math.max(padHeight, remainingHeight));

            var difference = remainingHeight - padHeight;
            if (difference < 0) {
                opacity += (difference / (padHeight * 2));
                bottom = 0;
            }
            ninjapad.jQElement.gamepad.css("bottom", bottom);
            ninjapad.jQElement.gamepad.css("display", "block");

            ninjapad.jQElement.gamepadButtons.css("opacity", opacity);
            ninjapad.jQElement.gamepadButtons.show();

            if (ninjapad.pause.state.cannotResume) {
                ninjapad.pause.state.cannotResume = false;
                ninjapad.pause.pauseEmulation();
            }
            DEBUG && console.log("NinjaPad: Touch controls enabled");
        }
        else {

            // var maxHeight = ninjapad.utils.isIOSDevice() ?
            //     window.innerHeight : "100%";

            // Display the GAMEPAD element and set the height to 100%
            ninjapad.jQElement.gamepad.css("display", "block");
            ninjapad.jQElement.gamepad.css("height", window.innerHeight);

            // Nest the SCREEN element on the GAMEPAD element
            $("#SCREEN").detach().appendTo("#GAMEPAD");

            // Set the EMULATION_SCREEN element height to 100%
            ninjapad.jQElement.emuScreen.height("90%"); //("90%");
            var newHeight = ninjapad.jQElement.emuScreen.height();
            ninjapad.jQElement.emuScreen.width(256 * (newHeight / 240));

            // Center the SCREEN element vertically
            ninjapad.jQElement.gamepad.css("display", "flex");

            // Get the width of the empty sides
            var w = ((width - ninjapad.jQElement.emuScreen.width()) / 2);

            // Calculate the maximum size for the button areas
            var s = 0.85 * Math.min(w, ninjapad.utils.vmin(55));
            var o = (w / 2) - (s / 2); // Offset

            $("#DPAD").css("top", "auto");
            $("#DPAD").css("bottom", "45%");
            $("#DPAD").css("left", o);
            $("#DPAD").css("width", s);
            $("#DPAD").css("height", s);

            $("#ANALOG").css("top", "auto");
            $("#ANALOG").css("bottom", "45%");
            $("#ANALOG").css("left", o);
            $("#ANALOG").css("width", s);
            $("#ANALOG").css("height", s);

            $("#ACTION").css("top", "auto");
            $("#ACTION").css("bottom", "45%");
            $("#ACTION").css("right", o);
            $("#ACTION").css("width", s);
            $("#ACTION").css("height", s);

            // - - - - - - - - - - - - - - - - - - -

            var bSel = $("#BUTTON_SELECT").detach();
            var bStr = $("#BUTTON_START").detach();

            var bAnl = $("#analogSwitch").detach();
            var bMen = $("#menu").detach();

            var functionalLeft = $("#FUNCTIONAL-BL");
            var functionalRight = $("#FUNCTIONAL-TR");

            bSel.appendTo(functionalLeft);
            bStr.appendTo(functionalRight);

            bAnl.appendTo(functionalLeft);
            bMen.appendTo(functionalRight);

            var fw = s / 3;
            var fh = functionalLeft.height() * (fw / functionalLeft.width());
            o = (w / 2) - (fw / 2);

            functionalLeft.css("width", fw);
            functionalLeft.css("height", fh);
            functionalLeft.css("top", "65%");
            functionalLeft.css("left", o);
            functionalLeft.css("right", "auto");

            functionalRight.css("width", fw);
            functionalRight.css("height", fh);
            functionalRight.css("top", "65%");
            functionalRight.css("left", "auto");
            functionalRight.css("right", o);

            bStr.css("top", bAnl.css("top"));
            bMen.css("top", bSel.css("top"));

            bSel.css("top", bAnl.css("top"));
            bAnl.css("top", bMen.css("top"));

            // Show buttons
            ninjapad.jQElement.gamepadButtons.show();

            DEBUG && console.log("NinjaPad: Touch controls disabled");
        }
    }

    function handleLandscapeMode() {
        ninjapad.pause.state.cannotResume = true;
        ninjapad.pause.pauseEmulation(
            ninjapad.utils.html(
                "span", "pauseScreenContent",
                `Landscape mode<br/>
                not supported yet<br/>
                <br/>
                Turn your device<br/>
                upright to play`
            )
        );
    }

    return {
        setPageLayout: function() {
            ninjapad.utils.isMobileDevice() ? setMobileLayout() : setDesktopLayout();
            ninjapad.layout.analogStickMovementRadius = $("#ANALOG").width() / 4;
            setOSDLayout();
        },

        showButtonPress: function(id, pressed) {
            var element = document.getElementById(id);
            $(element).css("border-style", pressed ? "inset" : "outset");
            DEBUG && console.log("NinjaPad:", pressed ? "Pressed" : "Released", element.id);
        }
    };
}();
