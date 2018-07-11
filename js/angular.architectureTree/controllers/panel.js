angular.module('ChartsApp').controller('panelCtrl', function ($scope, $timeout, $window, data, bus) {
    'use strict';
    $scope.langs = ["RU", "UZ"];
    var storagePath = location.href.substring(0, location.href.lastIndexOf("/")) + "/files/";
    var container = angular.element(document.querySelector('#panel')),
        graph = document.querySelector('#graph');

    bus.on('updateData', function(data) {
        var clonedData = angular.copy(data);
        $scope.data = formatData(clonedData);
    });

    function formatData(data) {

        var addParent = function(node) {
            if (node.children) {
                node.children.forEach(function(childNode) {
                    childNode.parent = node;
                    addParent(childNode);
                });
            }
        };

        var addDependents = function(node) {
            if (node.dependsOn) {
                node.dependsOn.forEach(function(dependsOn) {
                    var dependency = getNodeByName(dependsOn, data);
                    if (!dependency) {
                        console.log('Dependency', dependsOn, 'not found for node', node);
                        return;
                    }
                    if (!dependency.dependents) {
                        dependency.dependents = [];
                    }
                    dependency.dependents.push(node.name);
                });
            }
            if (node.children) {
                node.children.map(addDependents);
            }
        };

        var addDetails = function(node) {
            addDetailsForNode(node);
            if (node.children) {
                node.children.map(addDetails);
            }
        };

        /**
         * Add details to a node, including inherited ones (shown between parentheses).
         *
         * Mutates the given node.
         *
         * Example added properties:
         * {
         *   details: {
         *     Dependencies: ["Foo", "Bar (Babar)"],
         *     Dependents: ["Baz", "Buzz"];
         *     Actions: ["Foo", "Bar (Babar)" }
         *     Host: ["OVH", "fo (Foo)"]
         *   }
         * }
         */
        var addDetailsForNode = function(node) {
            node.details = {};
            var dependsOn = getDetailCascade(node, 'dependsOn');
            if (dependsOn.length > 0) {
                node.details.Dependencies = dependsOn.map(getValueAndAncestor);
            }
            if (node.dependents) {
                node.details.Dependents = node.dependents;
            }
            var actions = getDetailCascade(node, 'actions');
            if (actions.length > 0) {
                node.details.Actions = actions.map(getValueAndAncestor);
            }
            if (node.host) {
                node.details.Host = [];
                for (var i in node.host) {
                    node.details.Host.push(i);
                }
            }

            return node;
        };

        var getDetailCascade = function(node, detailName, via) {
            var values = [];
            if (node[detailName]) {
                node[detailName].forEach(function(value) {
                    values.push({ value: value, via: via });
                });
            }
            if (node.parent) {
                values = values.concat(getDetailCascade(node.parent, detailName, node.parent.name));
            }
            return values;
        };

        var getValueAndAncestor = function(detail) {
            return detail.via ? detail.value + ' (' + detail.via + ')' : detail.value;
        };

        addParent(data);
        addDependents(data);
        addDetails(data);

        return data;
    }


    /**
     * Returns the node path
     * @param {Object} d
     * @returns {Array}
     */
    var getNodePath = function(node) {
        var path = [],
            current = node;

        do {
            path.push(current.name);
            current = current.parent;
        } while (typeof(current) !== 'undefined');

        return path.reverse();
    };

    var getNodeByName = function(name, data) {
        if (data.name === name) {
            return data;
        }
        if (!data.children) return null;
        for (var i = data.children.length - 1; i >= 0; i--) {
            var matchingNode = getNodeByName(name, data.children[i]);
            if (matchingNode) return matchingNode;
        }
    };

    // Events
    container
        .on('hoverNode', function(event) {
            $scope.node = getNodeByName(event.detail, $scope.data);
            $scope.detail = true;
            $scope.edit = false;
            if ($scope.edit) {
                $scope.leaveEdit();
            }
            $scope.$digest();
        })
        .on('selectNode', function(event) {
            $scope.enterEdit(event.detail);
            $scope.$digest();
        })
        .on('unSelectNode', function(event) {
            if ($scope.edit) {
                $scope.leaveEdit();
                $scope.$digest();
            }
        })
        /*.on('moveNode', function(event) {
            $scope.moveNodeByDrag(event.original, event.target);
            $scope.$digest();
        })*/;

    $scope.enterEdit = function(name) {
        $scope.originalNode = getNodeByName(name, $scope.data);
        $scope.node = angular.copy($scope.originalNode);
        $scope.detail = false;
        $scope.edit = true;

        // have to keep the host keys in an array to manage edition
        $scope.hostKeys = {};
        angular.forEach($scope.node.host, function(value, key) {
            $scope.hostKeys[key] = key;
        });
    };

    $scope.leaveEdit = function() {
        $scope.node = angular.copy($scope.originalNode);
        $scope.detail = true;
        $scope.edit = false;
        bus.emit('unselect');
    };

    $scope.editNode = function(form, $event) {
        $event.preventDefault();

        if($scope.node.action == "none"){
            $scope.node.action = null;
        }
        if(document.getElementById("message_ru").value.length){
            $scope.node.descriptions.RU = document.getElementById("message_ru").value;
            console.log("message_ru: ", $scope.node.descriptions.RU);
        }
        if(document.getElementById("message_uz").value.length){
            $scope.node.descriptions.UZ = document.getElementById("message_uz").value;
        }
        if(document.getElementById("title_ru").value.length){
            $scope.node.titles.RU = document.getElementById("title_ru").value;
        }
        if(document.getElementById("title_uz").value.length){
            $scope.node.titles.UZ = document.getElementById("title_uz").value;
        }

        if($scope.node.image1 !== undefined){
            console.log("image123:", $scope.node.image1);
            var fileType1 = $scope.node.image1.type.split("/")[1];
            var filename1 = Date.now().toString(36) + "." + fileType1;
            data.setImage($scope.node.image1, filename1, 1);
            delete $scope.node.image1;
            $scope.node.file1 = {};
            $scope.node.file1 = storagePath + filename1;
        }
        if($scope.node.image2 !== undefined){
            console.log("image123:", $scope.node.image2);
            var fileType2 = $scope.node.image2.type.split("/")[1];
            var filename2 = Date.now().toString(36) + "." + fileType2;
            data.setImage($scope.node.image2, filename2, 2);
            delete $scope.node.image2;
            $scope.node.file2 = {};
            $scope.node.file2 = storagePath + filename2;
        }

        console.log("node scope:", $scope.node);
        console.log("whole scope:", $scope);

        data.updateNode($scope.originalNode.name, $scope.node);
        //$timeout(data.emitRefresh(), 1000);
        data.emitRefresh();
        
        $scope.node = getNodeByName($scope.node.name, $scope.data);
        $scope.detail = true;
        $scope.edit = false;
    };

    $scope.deleteNode = function() {
        if (!$window.confirm('Вы уверены что хотите удалить эту ветку ?')) return;
        data.removeNode($scope.originalNode.name);
        data.emitRefresh();

        $scope.detail = false;
        $scope.edit = false;
    };

    $scope.moveNode = function() {
        var dest = $window.prompt('Пожалуйста, введите имя родительской ветки для переноса ветки');
        data.moveNode($scope.originalNode.name, dest);
        data.emitRefresh();

        $timeout(function() {
            bus.emit('select', $scope.originalNode.name);
        });
    };

    $scope.moveNodeByDrag = function(nodeName, destNodeName) {
        data.moveNode(nodeName, destNodeName);
        //$interval(data.emitRefresh(), 2000);
    };

    $scope.moveNodeByDragEnd = function() {
       // if (!$window.confirm('Вы перенсли ветку')) return;
        $timeout(data.emitRefresh(), 1000);
        //data.emitRefresh();
    };

    $scope.addNode = function() {
        data.addNode($scope.originalNode.name);
        data.emitRefresh();

        $timeout(function() {
            bus.emit('select', 'Новая ветка');
        });
    };

    $scope.addDependency = function() {
        if (typeof ($scope.node.dependsOn) === 'undefined') {
            $scope.node.dependsOn = [];
        }
        $scope.node.dependsOn.push('');
    };

    $scope.deleteDependency = function(index) {
        $scope.node.dependsOn.splice(index, 1);
    };

    $scope.addAction = function() {
        if (typeof ($scope.node.actions) === 'undefined') {
            $scope.node.actions = [];
            $scope.node.actions.push('');
        }
        if($scope.node.actions.length == 0){
            $scope.node.actions.push('');
        } 
    };

    $scope.addTitle = function() {
        if (typeof ($scope.node.titles) === 'undefined') {
            $scope.node.titles = [];
        }
        if($scope.langs.length > $scope.node.titles.length){
            $scope.node.titles.push('');
        }

    };

    $scope.deleteImage = function(index) {
        if(index == 1){
            $scope.node.file1 = {};
            console.log("file1:", $scope.node.file1);
        }
        else if(index == 2){
            $scope.node.file2 = {};
            console.log("file2:", $scope.node.file2);
        }
    };

    $scope.deleteTitle = function(index) {
        $scope.node.titles.splice(index, 1);
    };

    $scope.addDescription = function() {
        if (typeof ($scope.node.descriptions) === 'undefined') {
            $scope.node.descriptions = [];
        }
        if($scope.langs.length > $scope.node.descriptions.length){
            $scope.node.descriptions.push('');
        }
    };

    $scope.deleteAction = function(index) {
        $scope.node.actions.splice(index, 1);
    };

    $scope.deleteDescription = function(index) {
        $scope.node.descriptions.splice(index, 1);
    };

    $scope.addHost = function(key) {
        if (typeof ($scope.node.host[key]) === 'undefined') {
            $scope.node.host[key] = [];
        }
        $scope.node.host[key].push('');
    };

    $scope.deleteHost = function(key, index) {
        $scope.node.host[key].splice(index, 1);
    };

    $scope.addHostCategory = function() {
        if (typeof ($scope.node.host) === 'undefined') {
            $scope.node.host = {};
        }
        $scope.node.host[''] = [];
        $scope.hostKeys[''] = '';
    };

    $scope.deleteHostCategory = function(key) {
        delete $scope.hostKeys[key];
        delete $scope.node.host[key];
    };
});
