angular.module('ChartsApp').directive('treeChart', function(bus) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<div id="graph"></div>',
        scope:{
            data: '='
        },
        link: function(scope, element) {

            var chart = d3.chart.architectureTree();

            scope.$watch("data", function(data) {
                if (typeof (data) === 'undefined') {
                    return;
                }
                chart.data(scope.data);

                // chart.data(scope.data);

                // d3.select(element[0])
                //     .call(chart);
            });

            bus.on('nameFilterChange', function(nameFilter) {
                console.log("name filter change:", nameFilter);
                chart.nameFilter(nameFilter);
            });

            bus.on('actionFilterChange', function(actionFilter) {
                chart.actionFilter(actionFilter);
            });
            
            // bus.on('actionsFilterChange', function(actionsFilter) {
            //     chart.actionsFilter(actionsFilter);
            // });

            /*bus.on('hostsFilterChange', function(hostsFilter) {
                chart.hostsFilter(hostsFilter);
            });*/

            bus.on('select', function(name) {
                chart.select(name);
            });

            bus.on('unselect', function() {
                chart.unselect();
            });

        }
    };
});
