(function () {
    'use strict';

    angular.module("app.common.header", [])
        .directive("headerFilterSortSearch", HeaderFilterSortSearchDirective);

    function HeaderFilterSortSearchDirective() {
        return {
            restrict: "A",
            bindToController: {
                title: "@",
                filterOptions: "<",
                sortOptions: "<",
                filterValue: "<",
                sortValue: "<",
                searchValue: "<",

                onValueChange: "&"
            },
            templateUrl: "app/components/header-filter-sort-search/header-filter-sort-search.html",
            controller: HeaderFilterSortSearchController,
            controllerAs: 'hfssCtrl'
        };
    }

    function HeaderFilterSortSearchController() {
        "ngInject";

        var vm = this;

        Object.assign(vm, {
            isSearching: false,
            focusInput: false,
            defaultFilterValue: vm.filterValue,

            // actions
            hideSearch: hideSearch,
            showSearch: showSearch,
            sortSelected: sortSelected,
            filterSelected: filterSelected,
            searchChanged: searchChanged
        });

        function hideSearch() {
            vm.isSearching = false;

            filterSelected(vm.defaultFilterValue);

            vm.searchValue = '';
            searchChanged(vm.searchValue);
        }

        function showSearch() {
            vm.isSearching = true;
            vm.focusInput = true;
        }

        function sortSelected(value) {
            vm.sortValue = value;
            notifyChange('sort', value);
        }

        function filterSelected(value) {
            vm.filterValue = value;
            notifyChange('filter', value);
        }

        function searchChanged() {
            notifyChange('search', vm.searchValue);
        }

        function notifyChange(key, value) {
            if (vm.onValueChange) {
                vm.onValueChange({
                    key: key,
                    value: value
                });
            }

        }
    }


})();
