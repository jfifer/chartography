var app = angular.module('app', [
    'ngRoute',
    'appCtrl',
    'appDirectives',
    'appSrv',
    'ui.bootstrap',
    'chart.js'
]).config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/partials/home.html',
      controller: 'homeController'
    })
    .when('/charts', {
      templateUrl: 'assets/partials/charts.html',
      controller: "savedChartsController"
    })
    .otherwise({
      redirectTo: '/'
    });
}]);
