(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['UserService', '$rootScope', '$location', 'FlashService'];
    function HomeController(UserService, $rootScope, $location, FlashService) {
        var vm = this;

        vm.user = {};

        initController();

        function initController() {
            loadCurrentUser();
        }

        function loadCurrentUser() {
            UserService.GetByUsername()
                .then(function (user) {
                    $rootScope.user = vm.user = user.user;
                })
                .catch(function(err) {
                    FlashService.Error(err.data && err.data.message || err.message || 'Invalid User!', true);
                    $location.path('/login');
                });
        }
        vm.logout = function () {
            UserService.Logout()
                .then(function (data) {
                    $location.path('/login');
                })
                .catch(e => {console.log(e);$location.path('/login');});
        }
        vm.showCalendar = function(user) {
            $location.path('/calendar');
        }
    }

})();