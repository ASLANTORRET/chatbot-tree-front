angular.module('ChartsApp').directive('uploadFile', function() {
    return {
        link: function (scope, el, attrs) {
            console.log("link function started");
            el.bind('change', function (event) {
                console.log("link bind started");
                var file = event.target.files[0];
                console.log("var files: ", file);
                var num = attrs.language;
                console.log("example number: " + num);
                if(num == "l1"){
                    scope.node.image1 = file ? file : undefined;
                    console.log("scope node image1: ", scope.node.image1);
                }
                else if(num == "l2"){
                    scope.node.image2 = file ? file : undefined;
                    console.log("scope node image2: ", scope.node.image2);
                }
            });
        }
    };
});