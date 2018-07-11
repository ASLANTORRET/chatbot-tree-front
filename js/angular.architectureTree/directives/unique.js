angular.module('ChartsApp').directive('unique', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attr, mCtrl) {
            
            //console.log("started0: ", scope.actions);
            function myValidation(value) {
                var currentNode = scope.node;
                var valid = true;

                (function recurs(nodeEl){
                    console.log("node name: ", nodeEl.name, "value name: ", value);
                    if(nodeEl.name == value){
                        console.log("block inside", nodeEl.name == value);
                        valid = false;      
                    }                   

                    angular.forEach(nodeEl.children, function(cvalue, key) {
                        recurs(cvalue, value);
                    });
                })(currentNode);   

                mCtrl.$setValidity('unique', valid);    
                return value;
            }
            mCtrl.$parsers.push(myValidation);
        }
    };
});