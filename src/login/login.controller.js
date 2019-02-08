(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService'];
    function LoginController($location, AuthenticationService, FlashService) {
        var vm = this;

        vm.login = login;
        vm.dataLoading = true;
        (function initController() {
            // reset login status
            AuthenticationService.ValidateUser()
                .then(function (data) {
                    if (data.success && data.success.toString() == 'true') {
                        $location.path('/home');
                    } else {
                        $location.path('/login');
                    }
                })
                .catch(function(err) {
                    console.log(err);
                    dataLoading = false;
                    FlashService.Error(err.message || 'UNKNOWN_ERROR');
                    $location.path('/login');
                })
        })();

        function login() {
            vm.dataLoading = true;
        };
    }

})();
