(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http', '$rootScope', '$cookies'];
    function UserService($http, $rootScope, $cookies) {
        var service = {};

        
        service.GetByUsername = GetByUsername;
        service.Logout = Logout;
        service.GetRoomList = GetRoomList;
        service.UpdateEvent = UpdateEvent;
        service.GetCalendar = GetCalendar;

        return service;

        function GetByUsername(username) {
            return $http.get('/accountInfo')
                    .then(function(res) {
                        if(res.data && res.data.success && res.data.success.toString() == 'true') {
                            return res.data;
                        } else {
                            throw new Error(res.data && res.data.message || 'Invalid user!');
                        }
                    })
                    .catch(function (err){
                        throw err;
                    });
        }

        function Logout(id) {
            delete $rootScope.bearerToken;
            delete $rootScope.user;
            $cookies.remove('connect.sid');
            return $http.delete('/logout').then(handleSuccess, handleError('Error deleting user'));
        }

        function GetRoomList() {
            return $http.get('/api/roomlist')
                .then(function (res) {
                    if(res && res.data) {
                        return res.data;
                    }
                    throw new Error('Invalid Response');
                })
                .catch(function(e) {
                    throw e;
                })
        }

        function UpdateEvent(event, roomId, userId) {
            let reqBody = { roomId };
            reqBody.name = event.name;
            reqBody.title = event.title;
            reqBody.userId = userId ;
            reqBody.description = event.description;
            reqBody.startTime = event.start;
            reqBody.endTime = event.end;
            return $http.post('/api/updatemeeting', reqBody)
                .then(function(res) {
                    if(res && res.data) {
                        return res.data;
                    }
                    throw new Error('Invalid Response');
                })
                .catch(function(e) {
                    throw e;
                })
        }

        function GetCalendar(selectedRoom) {
            return $http.get('/api/calendarlist?roomId=' + selectedRoom )
                .then(function (res) {
                    if(res && res.data) {
                        return res.data;
                    }
                    throw new Error('Invalid Response');
                })
                .catch(function(e) {
                    throw e;
                })
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
