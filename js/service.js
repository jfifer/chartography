var appSrv = angular.module('appSrv', ['ngResource']);

appSrv.factory('Auth', ['$resource',
  function ($resource) {
    return $resource('api/auth', { }, {
      post: { method: 'POST', isArray: false },
      get: { method: 'GET', isArray: false }
    });
  }])
.factory('Portal', ['$resource',
  function ($resource) {
    return $resource('api/portal/:method/:id', { method: "@method", id: "@id" }, {
      query: { method: 'GET', isArray: true },
      get: { method: 'GET', isArray: false }
    });
  }])
.factory('Vm', ['$resource',
  function ($resource) {
    return $resource('api/vm/:server/:context/:date', { server: "@server", context: "@context", date: "@date" }, {
      query: { method: 'GET', isArray: true },
      get: { method: 'GET', isArray: false }
    });
  }])
.factory('Query', ['$resource',
  function ($resource) {
    return $resource('api/query/:model/:chart', { model: "@model", chart: "@chart" }, {
      query: { method: 'POST', isArray: true }
    });
  }]);
