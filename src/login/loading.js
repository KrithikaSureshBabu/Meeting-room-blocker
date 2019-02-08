(function () {
    'use strict';

    angular
        .module('app')
        .directive('loadingSpinner', loadingSpinner);

    loadingSpinner.$inject = ['$http'];
    function loadingSpinner($http) {
        return {
            restrict: 'A',
            replace: true,
            template: '<div class="loader unixloader" data-initialize="loader" data-delay="500"></div>',
            link: function (scope, element, attrs) {
    
                scope.$watch('activeCalls', function (newVal, oldVal) {
                    if (newVal == 0) {
                        $(element).hide();
                    }
                    else {
                        $(element).show();
                    }
                });
            }
        };
    }

})();
