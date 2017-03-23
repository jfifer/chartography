var appCtrl = angular.module('appCtrl', []);

appCtrl.controller('homeController', function ($rootScope, $scope, Auth, Portal, Vm) {
  $scope.loggedIn = false;
  $scope.username = "";

  $scope.$on("logIn", function(event, args) {
    $scope.doAuth(args.res);
  });

  $scope.doAuth = function(res) {
    if(parseInt(res.uid) !== -1) {
      $scope.loggedIn = true;
      $scope.username = res.username;
    } else {
      $scope.loggedIn = false;
    }
  };

  $scope.logout = function() {
    Auth.post(function(res){
      $scope.doAuth(res);
    });
  };

  $scope.init = function() {
    Auth.get(function(res) {
      $scope.doAuth(res);
    });
  };

})
.controller("VmController", function($scope, $uibModal, Vm) {
  $ctrl = this;
  $scope.featureServers = [];
  $scope.selectedServers = [];

  $scope.contexts = [];
  $scope.selectedContexts = [];

  $scope.selectedChart = "";
  $scope.selectedYaxis = "";
  $scope.selectedXaxis = "";

  $scope.selectX = "";
  $scope.selectY = "";
  $scope.startDate = "";
  $scope.endDate = "";
  $scope.dateRange = "fixed";
  $scope.relDateFrame = "MONTH";

  $scope.xaxisItems = ["Date", "Day", "FeatureServers", "Contexts"];
  $scope.availableCharts = ["histogram", "bar", "pie", "calendar"];
  $scope.yaxisItems = ["Count", "Duration"];
  $scope.stackbyItems = ["context", "fs", "customerId", "mailbox"];

  $scope.set_selectedChart = function(val) { $scope.selected.chart = val; };
  $scope.set_selectedYaxis = function(val) {
    $scope.selected.yaxis = val; 
    switch(val) {
      case "Count" :
        $scope.selectY = "COUNT(*)";
        break;
      case "Duration" :
        $scope.selectY = "AVG(TIMESTAMPDIFF(SECOND, start, end))";
        break;
      default :
        break;
    } 
  };
  $scope.set_selectedXaxis = function(val) { 
    $scope.selected.xaxis = val;
    console.log(val); 
    switch(val) {
      case "Date" :
        $scope.selectX = "start";
        break;
      case "Day" :
        $scope.selectX = "date_format(start, '%Y-%m-%d')";
        break;
      case "FeatureServers" :
        $scope.selectX = "fs";
        break;
      case "Contexts" :
        $scope.selectX = "context";
        break;
      default :
        break;
    }
  };
  $scope.set_selectedStackby = function(val) { 
    idx = $scope.selected.stackby.indexOf(val);
    if(idx >= 0) {
      $scope.selected.stackby.splice(idx, 1);
    } else {
      $scope.selected.stackby.push(val);
    }
  };

  $scope.selected = {
    chart : "",
    xaxis : "",
    yaxis : "",
    stackby : "",
    servers : [],
    contexts : [],
    stackby : []
  }

  $scope.getContexts = function(fs) {
    Vm.query({server: "context", context: fs}, function(res) {
      $scope.contexts = res;
    });
  };

  $scope.getFeatureServers = function() {
    Vm.query(function(res) {
      $scope.featureServers = res;
    });
  };

  $scope.isSelected = function(obj, type) {
    return obj == $scope.selected[type];
  };

  $scope.inSelected = function(obj, type) {
    if($scope.selected[type].indexOf(obj) >= 0) {
      return true;
    }
    return false;
  }

  $scope.ctxSelectionChanged = function(ctx) {
    idx = $scope.selected.contexts.indexOf(ctx);
    if(idx >= 0) {
      $scope.selected.contexts.splice(idx, 1);
    } else {
      $scope.selected.contexts.push(ctx);
    }
  };

  $scope.fsSelectionChanged = function(fs) {
    idx = $scope.selected.servers.indexOf(fs);
    if(idx >= 0) {
      $scope.selected.servers.splice(idx, 1);
    } else {
      $scope.selected.servers.push(fs);
    }

    $scope.getContexts($scope.selected.servers);
  };

  $scope.open = function (size) {
    $scope.query = {
      'type' : $scope.selected.chart,
      'selectX': $scope.selectX,
      'selectY': $scope.selectY,
      'tbl': "vmfinal",
      'groupBy': $scope.selected.stackby,
      'fields': {
        'fs': {
          'type': 'string',
          'array': true,
          'value': $scope.selected.servers
        },
        'context': {
          'type': 'string',
          'array': true,
          'value': $scope.selected.contexts
        },
        'start': {
          'type': 'date',
          'rangeType': $scope.dateRange,
          'fixed' : {
            'start': $scope.startDate,
            'end': $scope.endDate
          },
          'relative': {
            'count': $scope.relDateNum,
            'frame': $scope.relDateFrame
          }
        }
      }
    };

    var modalInstance = $uibModal.open({
      animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'VmModalController',
      controllerAs: '$ctrl',
      size: size,
      resolve: {
        config: function () {
          return $scope.query;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      //something or other
    }, function () {
      //closed
    });
  };

  $scope.init = function() {
    $scope.getFeatureServers();
    $scope.getContexts();
  };
})
.controller('VmModalController', function($scope, $uibModalInstance, Query, config) {
  $ctrl = this;
  $scope.config = config;
  $scope.data = [];
  Query.query({model: "VmModel", chart: $scope.config.type}, $scope.config, function(res) {
    //google.charts.load("current", {packages:["corechart"]});
    switch($scope.config.type) {
      case "histogram" :
        angular.forEach(res, function(value, key) {
          $scope.data.push(['', value.y]);
        });
        google.charts.setOnLoadCallback($scope.drawHistogram);
        break;
      case "bar" :
        $scope.data.push(['', 'Count']);
        angular.forEach(res, function(value, key) {
          $scope.data.push([value.x, parseInt(value.y)]);
        });
        google.charts.setOnLoadCallback($scope.drawBar);
        break;
      case "pie" :
        angular.forEach(res, function(value, key) {
          $scope.data.push([value.x, parseInt(value.y)]);
        });
        google.charts.setOnLoadCallback($scope.drawPie);
        break;
      case "calendar" :
        google.charts.load("current", {packages: ["calendar"]});
        angular.forEach(res, function(value, key) {
          $scope.data.push([new Date(value.x), parseInt(value.y)]);
        });
        google.charts.setOnLoadCallback($scope.drawCalendar);
        break;
      default :
        break;
    }
  });

  $scope.drawCalendar = function() {
    var options = {
      title: "A Calendar",
      height: 800
    };
    dataTable = new google.visualization.DataTable();
    dataTable.addColumn({type:'date', id:'Date'});
    dataTable.addColumn({type:'number', id: 'Vms'});
    console.log($scope.data);
    dataTable.addRows($scope.data);
    var chart = new google.visualization.Calendar(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
  };

  $scope.drawPie = function() {
    var options = {
      height: 500,
      width: 850
    };
    var data = new google.visualization.DataTable()
    data.addColumn('string', "Server");
    data.addColumn('number', "Voicemails");
    data.addRows($scope.data);
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  };

  $scope.drawBar = function() {
    var options = {
      height: 550,
      legend: { position: 'top'},
    };
    var data = google.visualization.arrayToDataTable($scope.data);
    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

    chart.draw(data, options);
  };

  $scope.drawHistogram = function() {
    var data = google.visualization.arrayToDataTable($scope.data);
    var options = {
      title: '',
      legend: { position: 'none' },
      colors: ['#2368b3'],
      hAxis: {
        viewWindow: {
          max: 200
        }
      },
      curveType: 'function',
        chartArea: {width: 950},
        histogram: { 
          hideBucketItems: true,
          bucketSize: 5,
        maxNumBuckets: 100000,
      }
    };

    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));

    chart.draw(data, options);
  }

  $ctrl.ok = function () {
    $uibModalInstance.close();  //send data from here
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})
.controller('savedChartsController', function($scope) {

})
.controller('authController', function ($rootScope, $scope, Auth) {
  $scope.login = function(auth) {
    if(angular.element($('.login')).hasClass("ng-valid")) {
      auth.password = sha1(auth.password);
      Auth.post({}, auth, function(res) {
        $rootScope.$broadcast("logIn", { res });
      });
    }
  }
});
