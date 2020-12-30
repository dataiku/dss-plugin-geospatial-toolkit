var app = angular.module('osm.enrichment', []);

app.controller('MyCustomFormController', ['$scope', function($scope) {
    console.log("Calling the controller");
    $scope.config.value = 75;
    $scope.config.min = 10;
    $scope.config.max = 90;
}]);
