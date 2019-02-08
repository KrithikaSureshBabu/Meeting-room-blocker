(function () {
    'use strict';

    angular
        .module('app')
        .controller('CalendarController', CalendarController);

    CalendarController.$inject = ['UserService', '$rootScope', '$location', 'uiCalendarConfig', 'FlashService'];
    function CalendarController(UserService, $rootScope, $location, uiCalendarConfig, FlashService) {
        var vm = this, isFirstTime = true;
        vm.status = {
            isOpenFrom: false,
            isOpenTo: false
        };
        vm.user = $rootScope.user;
        vm.myInput = '';
        vm.selectedRoom = '';
        vm.selectedRoomObj = {};
        vm.events = [];
        vm.eventSources = [vm.events];
        vm.addNewEvent = {
            name: vm.user && vm.user.displayName
        };

        // Validation Range
        vm.endDateBeforeRender = endDateBeforeRender
        vm.endDateOnSetTime = endDateOnSetTime
        vm.startDateBeforeRender = startDateBeforeRender
        vm.startDateOnSetTime = startDateOnSetTime

        function startDateOnSetTime() {
            $rootScope.$broadcast('start-date-changed');
        }

        function endDateOnSetTime() {
            $rootScope.$broadcast('end-date-changed');
        }

        function startDateBeforeRender($dates) {
            if (vm.addNewEvent.toDate) {
                var activeDate = moment(vm.addNewEvent.toDate);
                var currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
                $dates.filter(function (date) {
                    return (date.localDateValue() >= activeDate.valueOf() || date.localDateValue() < currentDate.valueOf())
                }).forEach(function (date) {
                    date.selectable = false;
                })
            } else {
                const todaySinceMidnight = moment().hour(0).minute(0).second(0).millisecond(0);
                $dates.filter(function (date) {
                    return date.localDateValue() < todaySinceMidnight.valueOf();
                }).forEach(function (date) {
                    date.selectable = false;
                });
            }
        }

        function endDateBeforeRender($view, $dates) {
            if (vm.addNewEvent.fromDate) {
                var activeDate = moment(vm.addNewEvent.fromDate).subtract(1, $view).add(1, 'minute');
                var currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
                $dates.filter(function (date) {
                    return (date.localDateValue() <= activeDate.valueOf() || date.localDateValue() < currentDate.valueOf())
                }).forEach(function (date) {
                    date.selectable = false;
                })
            } else {
                const todaySinceMidnight = moment().hour(0).minute(0).second(0).millisecond(0);
                $dates.filter(function (date) {
                    return date.localDateValue() < todaySinceMidnight.valueOf();
                }).forEach(function (date) {
                    date.selectable = false;
                });
            }
        }
        initController();

        vm.setDefault = function () {
            vm.addNewEvent.name = $rootScope.user && $rootScope.user.displayName;
        }

        function initController() {
            loadRoomList();
            //configure calendar
            vm.uiConfig = {
                calendar: {
                    height: 450,
                    editable: true,
                    displayEventTime: false,
                    header: {
                        left: 'month agendaWeek agendaDay',
                        center: 'title',
                        right: 'today prev,next'
                    },
                    eventClick: function (event) {
                        vm.SelectedEvent = event;
                    },
                    eventAfterAllRender: function () {
                        if (vm.events.length > 0 && isFirstTime) {
                            //Focus first event
                            uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', vm.events[0].start);
                            isFirstTime = false;
                        }
                    }
                }
            };
        }

        function loadRoomList() {
            UserService.GetRoomList()
                .then(function (data) {
                    if(data.success && data.success.toString() == 'true') {
                        vm.roomLists = data.list
                        if (!$rootScope.user) {
                            $rootScope.user = data.user;
                            vm.setDefault();
                        }
                    } else {
                        FlashService.Error(data && data.message || 'Invalid User!', true);
                        $location.path('/login');
                    }
                })
                .catch(function (e) {
                    console.log(e);
                    FlashService.Error(e.data && e.data.message || e.message || 'Invalid User!', true);
                    $location.path('/login');
                })
        }
        vm.selectRoom = function () {
            this.roomLists.forEach(function (v) {
                if (v._id === this.selectedRoom) {
                    this.selectedRoomObj = v;
                }
            }.bind(this));
            for(var i=vm.events.length-1; i>=0; i--) {
                vm.events.splice(i,1);
            }
            vm.addNewEvent = {
                name: (vm.user && vm.user.displayName) || ($rootScope.user && $rootScope.user.displayName)
            }
            UserService.GetCalendar(this.selectedRoom)
                .then(function (data) {
                    if (data && data.success) {
                        let calendarList = data.calendarList;
                        angular.forEach(calendarList, function (value, index) {
                            let meetings = value.meetings || {};
                            let slots = Object.keys(meetings);
                            for (let i = 0; i < slots.length; i++) {
                                let tmp = {};
                                let slot = slots[i].split('-');
                                let start = slot[0], end = slot[1];
                                let startTime = moment(value.date).hour(start.substr(0, 2)).minute(start.substr(2)).second(0).millisecond(0);
                                let endTime = moment(value.date).hour(end.substr(0, 2)).minute(end.substr(2)).second(0).millisecond(0);
                                tmp.title = meetings[slots[i]]['title'];
                                tmp.description = meetings[slots[i]]['description'];
                                tmp.name = meetings[slots[i]]['name'];
                                tmp.userId = meetings[slots[i]]['userId'];
                                tmp.start = new Date(startTime);
                                tmp.end = new Date(endTime);
                                tmp.allDay = false;
                                tmp.stick = true;
                                Array.prototype.push.apply(vm.events, [tmp]);
                            }
                        })
                    } else {
                        console.log('flash service', data.message);
                        FlashService.Error(data.message);
                    }
                })
                .catch(function (e) {
                    FlashService.Error(err.data && err.data.message || err.message);
                    console.log('flash service', e.message)
                })
        }
        vm.onTimeSet = function (nV, oV) {
            console.log(nV);
            // vm.status.isOpen = false;
            $('.btn-group.dropdown.open').removeClass('open');
        }
        vm.addEvent = function () {
            if(!vm.addNewEvent.title || !vm.addNewEvent.description || !vm.addNewEvent.fromDate || !vm.addNewEvent.toDate) {
                return FlashService.Error('All fields are mandatory');
            }
            let tmp = {
                title: vm.addNewEvent.title,
                description: vm.addNewEvent.description,
                name: vm.addNewEvent.name,
                userId: $rootScope.user.oid,
                start: new Date(vm.addNewEvent.fromDate),
                end: new Date(vm.addNewEvent.toDate),
                allDay: false,
                stick: true
            }
            UserService.UpdateEvent(tmp, this.selectedRoom, $rootScope.user.oid)
                .then(function (data) {
                    if (data && data.success) {
                        console.log('Event successfully created');
                        FlashService.Success('Event added successfully!');
                        vm.events.push(tmp);
                        vm.addNewEvent = {
                            name: (vm.user && vm.user.displayName) || ($rootScope.user && $rootScope.user.displayName)
                        }
                    } else {
                        console.log('Flash Service', data.message);
                        FlashService.Error(data.message);
                    }
                })
                .catch(function (err) {
                    FlashService.Error(err.data && err.data.message || err.message || 'Invalid User!');
                    console.log('Call Flash service')
                })
        }
    }

})();