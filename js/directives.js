var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('calendar', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      element.datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function (date) {
          model = attrs.ngModel;
          scope[model] = date;
          scope.$apply();
        }
     });
   }
 };
}).directive('histogram', function() {
  return {
    
  } 
})
