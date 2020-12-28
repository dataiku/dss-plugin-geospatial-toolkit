var app = angular.module('osm.enrichment', []);

app.controller('MyCustomFormController', function ($scope, $timeout) {
    console.log("angular value", $scope.config.value);
    $scope.$apply();
});
