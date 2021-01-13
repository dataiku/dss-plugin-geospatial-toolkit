var app = angular.module('geospatial.density', []);

const DEFAULT_INTENSITY = 50;
const DEFAULT_RADIUS = 50;
const DEFAULT_COLOR_SCALE = null;
const DEFAULT_COLOR = {name: "blue"}
const DEFAULT_MAPTILE = {name: "mapbox/v11"}

app.controller('MyCustomFormController', ['$scope', function($scope) {
    console.log("Calling the controller");
    // TODO: Check reusability of the components
    $scope.config.hack = 14;
    $scope.config.hack2 = 15;
    // Variables initialisation
    $scope.config.intensity = DEFAULT_INTENSITY;
    $scope.config.radius = DEFAULT_RADIUS;
    $scope.config.color = DEFAULT_COLOR;
    $scope.config.maptile = DEFAULT_MAPTILE;
}]);
