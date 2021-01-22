var app = angular.module('geospatial.density', []);

const DEFAULT_INTENSITY = 50;
const DEFAULT_RADIUS = 50;
const DEFAULT_COLOR_SCALE = null;

app.controller('MyCustomFormController', ['$scope', function($scope) {
    console.log("Calling the controller");
    // Variables initialisation
    $scope.config.intensity = DEFAULT_INTENSITY;
    $scope.config.radius = DEFAULT_RADIUS;
    $scope.config.color = DEFAULT_COLOR;
}]);
