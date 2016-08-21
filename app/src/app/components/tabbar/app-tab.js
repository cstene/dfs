/**
 * Provides a reusable tabbed bar control that allows for any content to be present in 
 * the actual tabs, since they are defined with regular markup.
 * 
 * Usage:
 * 
 * See http://codepen.io/krcourville/pen/GZBzWE for example
 * 
 */
(function () {
    'use strict';

    angular.module('app')

        .component('appTabbar', {
            templateUrl: 'app/components/tabbar/app-tabbar.html',
            transclude: true,
            controller: AppTabbarController,

            bindings: {
                initialTabId: '<',
                onTabChange: '&',
                onTabToggle: '&'
            }
        })

        .component('appTab', {
            templateUrl: 'app/components/tabbar/app-tab.html',
            transclude: true,
            controller: AppTabController,
            bindings: {
                disableClick: '<',
                tabId: '<',
                isSelected: '<'
            },
            require: {
                appTabbarCtrl: '^appTabbar'
            }
        });

    function AppTabbarController($window) {
        var
          vm = this,
          _activeTabId = '',
          tabscrolls = {};


        Object.assign(vm, {
            tabs: [],
            registerTab: registerTab,
            unregisterTab: unregisterTab,
            selectTab: selectTab,
            scrollZero: scrollZero,

            $onInit: $onInit
        });

        function $onInit() {
            _activeTabId = vm.initialTabId;
        }

        function registerTab(tab) {
            tab.setSelected(tab.tabId === vm.initialTabId);
            vm.tabs.push(tab);
        }

        function unregisterTab(tab) {
            vm.tabs.splice(vm.tabs.indexOf(tab));
        }

        function selectTab(tab) {
            if (tab.tabId === _activeTabId) {
                scrollZero();
                // tab toggled
                if (vm.onTabToggle) {
                    vm.onTabToggle({ tabId: tab.tabId });
                }

            } else {
                // tab changed
                saveTabScroll();
                vm.tabs.forEach(function (t) {
                    t.setSelected(t === tab);
                });

                if (vm.onTabChange) {
                    vm.onTabChange({
                        tabId: tab.tabId,
                        tab: tab,
                        tabbar: vm
                    });
                }

                _activeTabId = tab.tabId;
            }
            restoreTabScroll();
        }

        function scrollZero(tabs) {
            if (typeof tabs === 'undefined') {
                tabscrolls[_activeTabId] = { x: 0, y: 0 };
            } else {
                tabs.forEach(function (tabId) {
                    tabscrolls[tabId] = { x: 0, y: 0 };
                });
            }
        }

        function saveTabScroll() {
            tabscrolls[_activeTabId] = {
                x: $window.scrollX,
                y: $window.scrollY
            };
        }

        function restoreTabScroll() {
            if (tabscrolls[_activeTabId]) {
                $window.scrollTo(
                    tabscrolls[_activeTabId].x,
                    tabscrolls[_activeTabId].y
                );
            }
        }
    }

    function AppTabController() {
        var
          vm = this,
            _isSelected = false;
        Object.assign(vm, {
            onSelect: onSelect,
            setSelected: setSelected,

            $onInit: $onInit,
            $onDestroy: $onDestroy
        });

        Object.defineProperties(vm, {
            cssClass: {
                get: function getCssClass() {
                    return _isSelected ?
                      'active' :
                      '';
                }
            }

        });

        function $onInit() {
            vm.appTabbarCtrl.registerTab(vm);
        }

        function $onDestroy() {
            vm.appTabbarCtrl.unregisterTab(vm);
        }

        function setSelected(isSelected) {
            _isSelected = isSelected;
        }

        function onSelect() {
            if (vm.disableClick) {
                return;
            }
            vm.appTabbarCtrl.selectTab(vm);
        }
    }


})();