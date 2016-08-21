/**
 * Makes a input "clearable" (with a little x)
 * Usage:
 *
 * <div class="clear-input-container">
 *  <input type="text" app-clear-input />
 * </div>
 *
 * WARNING: If you do not provide the wrapper element, once will be created.
 * This may lead to undesirable formatting.
 */
(function () {
    "use strict";

    angular
        .module("app")
        .run(ApplyClearSearch)
        .directive("appClearInput", appClearInputDirectiveFactory);


    function appClearInputDirectiveFactory($log, $window){
        "ngInject";

        var $ = $window.$;

        return {
            restrict: "A",
            link: link
        };

        function link(scope, el){
            $(el).clearSearch({
                clearClass: "app-clear-input"
            });
        }
    }

    function ApplyClearSearch($log, $window) {
        var $ = $window.$;

        $.fn.clearSearch = function (options) {
            var settings = $.extend({
                'clearClass': 'clear_input',
                'focusAfterClear': true,
                'linkText': '&times;'
            }, options);
            return this.each(function () {
                var $this = $(this), btn,
                    divClass = settings.clearClass + '-wrap';

                if (!$this.parent().hasClass(divClass)) {
                    $this.wrap('<div style="position: relative;" class="' + divClass + '">' + $this.html() + '</div>');
                    $this.after('<div style="position: absolute; cursor: pointer;" class="' + settings.clearClass + '">' +
                        settings.linkText + '</div>');
                }
                btn = $this.next();

                function clearField() {
                    $this.val('').change();
                    triggerBtn();
                    if (settings.focusAfterClear) {
                        $this.focus();
                    }
                    if (typeof (settings.callback) === "function") {
                        settings.callback();
                    }
                }

                function triggerBtn() {
                    if (hasText()) {
                        btn.show();
                    } else {
                        btn.hide();
                    }
                    update();
                }

                function hasText() {
                    return $this.val().replace(/^\s+|\s+$/g, '').length > 0;
                }

                function update() {
                    var width = $this.outerWidth(), height = $this
                        .outerHeight();
                    btn.css({
                        top: height / 2 - btn.height() / 2,
                        left: width - height / 2 - btn.height() / 2
                    });
                }

                btn.on('click', clearField);
                $this.on('keyup keydown change focus', triggerBtn);
                triggerBtn();
            });
        };

    }

})();