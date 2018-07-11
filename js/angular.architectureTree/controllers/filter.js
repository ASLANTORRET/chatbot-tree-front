angular.module('ChartsApp').controller('filterCtrl', function ($scope, bus) {
    'use strict';

    bus.on('updateData', function(data) {
        $scope.actions = computeActions(data);
        $scope.names = collectNames(data);
    });

    $scope.nameFilter = '';

    var actionsFilter = [];

    $scope.$watch('nameFilter', function(title) {
        console.log("name filter:", title);
        bus.emit('nameFilterChange', title);
    });

    $scope.toggleActionFilter = function(action) {
        if ($scope.isActionInFilter(action)) {
            actionsFilter.splice(actionsFilter.indexOf(action), 1);
        } else {
            actionsFilter.push(action);
        }
        bus.emit('actionFilterChange', actionsFilter);
    };

    $scope.isActionInFilter = function(action) {
        return actionsFilter.indexOf(action) !== -1;
    };

    function computeActions(rootNode) {
        var actions = [];

        function addNodeActions(node) {
            if (node.action) {
                actions[node.action] = true;
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeActions(childNode);
                });
            }
        }

        addNodeActions(rootNode);

        return Object.keys(actions).sort();
    }

    function collectNames(rootNode) {
        var names = [];

        function addNodeNames(node) {
            if (node.name) {
                names.push(node.name);
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeNames(childNode);
                });
            }
        }

        addNodeNames(rootNode);

        return Object.keys(names).sort();
    }

});
