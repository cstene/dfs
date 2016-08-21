(function () {
    'use strict';

    angular.module('app.sync')
        .controller('syncController', SyncController);    

    function SyncController(_, $window, $interval, cyanSyncService, cyanBootstrapUi, $state, config, cyanNative) {
        "ngInject";
        var vm = this;
        
        Object.assign(vm, {
            lastSyncMoment: null,
            refresh: refresh,
            intervalFunction: refresh,
            toggleLog: toggleLog,
            startInterval: startInterval,
            back: back,
            reInit: reInit,
            sync: sync        
        });
        
        activate();

        function activate(){
            vm.headerTitle = 'Sync';
            vm.logVisible = false;
            vm.intervalFunction();
            vm.startInterval();
        }

        function refresh() {
            cyanSyncService.getSyncStatus()
                .then(function (syncStatus) {
                    vm.syncStatus = syncStatus;
                    vm.lastSync = _(syncStatus)
                        .sortBy(function (s) { return s.date; })
                        .reverse()
                        .value()[1];
                    vm.lastSyncDate = vm.lastSync.lastSyncDate;
                    vm.lastSyncTime = vm.lastSync.lastSyncTime;
                    vm.lastSyncResult = !_.isNotNullOrUndefined(vm.lastSync.endTime) ? 'In Progress' : vm.lastSync.result;
                });
        }

        function toggleLog() {
            vm.logVisible = !vm.logVisible;
        }

        function startInterval() {
            vm.interval = $interval(function () { vm.intervalFunction(); }, 5000);
        }

        function back() {
            $interval.cancel(vm.interval);
            //$window.history.back();
            $state.go("boxes", { box: 'inbox' });
        }

        function reInit() {
            var opt = {
                message: 'Re-init will wipe downloaded data, and retrieve a fresh copy.  This may take 5 minutes or more to complete.  Do you wish to continue?',
                title: 'Reinitialize',
                cancelText: 'No',
                okText: 'Yes'
            };

            cyanBootstrapUi.promptOkCancel(opt)
                .then(function () {
                    return config.getUserGroupIdForSync();
                })
                .then(function (userGroupId) {
                    if (userGroupId !== null)
                    {
                        cyanNative.setSyncParameters({ userGroupId: userGroupId });
                    }

                    $interval.cancel(vm.interval);
                    return cyanSyncService.sync(true);
                })
                .then(function () {
                    vm.refresh();
                    vm.startInterval();
                });
        }

        function sync() {
            config.getUserGroupIdForSync()
            .then(function (userGroupId) {
                if (userGroupId !== null) {
                    cyanNative.setSyncParameters({ userGroupId: userGroupId });
                }                
                $interval.cancel(vm.interval);
                cyanSyncService.sync(false)
                    .then(function () {
                        vm.refresh();
                        vm.startInterval();
                    });
            });
        }
    }
})();