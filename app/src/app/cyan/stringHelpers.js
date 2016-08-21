(function() {
    "use strict";

    angular
        .module("app.cyan")
        .decorator("stringHelpers", stringHelperDecorator);

    function stringHelperDecorator($delegate) {
        /**
         * Pad a string to the specified length by repeating the given characters at the beginning of the string.
         * @param {String} string The string to pad.
         * @param {Number} length The desired length of the returned string.
         * @param {String} chars The string to repeat to the left of the result to reach the desired length.
         * @returns {String} A string of the specified length.
         */
        $delegate.padLeft = function(string, length, chars) {
            var s = String(string);
            var ch = typeof (chars) === "undefined" ? " " : String(chars);
            ch = ch.length > 0 ? ch : " ";
            var pad = "";
            while (s.length + pad.length < length) {
                pad = pad + ch.substring(0, length - s.length - pad.length);
            }
            return pad + s;
        };

        /**
         * Pad a string to the specified length by repeating the given characters at the end of the string.
         * @param {String} string The string to pad.
         * @param {Number} length The desired length of the returned string.
         * @param {String} chars The string to repeat to the left of the result to reach the desired length.
         * @returns {String} A string of the specified length.
         */
        $delegate.padRight = function(string, length, chars) {
            var s = String(string);
            var ch = typeof (chars) === "undefined" ? " " : String(chars);
            ch = ch.length > 0 ? ch : " ";
            var pad = "";
            while (s.length + pad.length < length) {
                pad = pad + ch.substring(0, length - s.length - pad.length);
            }
            return s + pad;
        };

        return $delegate;
    }
})();