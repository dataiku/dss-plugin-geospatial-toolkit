var app = angular.module('geospatial.density', []);

app.controller('MyCustomFormController', ['$scope', function($scope) {
    console.log("Calling the controller");
    $scope.config.value = 75;
    $scope.config.min = 10;
    $scope.config.max = 90;
    $scope.config.color = {
        name: 'blue'
    };
    $scope.config.maptile = {
        name: 'mapbox/v11'
    };
}]);
