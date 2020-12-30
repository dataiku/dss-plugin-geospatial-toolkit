var app = angular.module('geospatial.density', []);

app.controller('MyCustomFormController', ['$scope', function($scope) {
    console.log("Calling the controller");
    $scope.config.intensity = 50;
    $scope.config.radius = 50;
    $scope.config.color = {
        name: 'blue'
    };
    $scope.config.maptile = {
        name: 'mapbox/v11'
    };
}]);
