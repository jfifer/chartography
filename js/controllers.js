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
  
  $scope.xLabel = "";
  $scope.yLabel = "";

  $scope.selectX = "";
  $scope.selectY = "";
  $scope.startDate = "";
  $scope.endDate = "";
  $scope.dateRange = "fixed";
  $scope.relDateFrame = "MONTH";

  $scope.yaxisItems = [
    { "label": "--none--", "sql": null },
    { "label": "Hour", "sql": "date_format(start, '%Y-%m-%d %H')" },
    { "label": "Day", "sql": "date_format(start, '%Y-%m-%d')" },
    { "label": "Month", "sql": "date_format(start, '%Y-%m')" },
    { "label": "Year", "sql": "date_format(start, '%Y')" },
    { "label": "Count", "sql": "COUNT(*)" },
    { "label": "Duration", "sql": "AVG(TIMESTAMPDIFF(SECOND, start, end))" },
    { "label": "Feature Servers", "sql": "distinct(fs)" },
    { "label": "Context", "sql": "distinct(context)" },
    { "label": "Customer", "sql": "distinct(customerId)" }
  ];
  $scope.availableCharts = [
    { "label": "Histogram", "name": "histogram" },
    { "label": "Bar Chart", "name": "bar" },
    { "label": "Pie Chart", "name": "pie" }   
  ];
  $scope.xaxisItems = [
    { "label": "--none--", "sql": null },
    { "label": "Count", "sql": "COUNT(*)" },
    { "label": "Duration", "sql": "AVG(TIMESTAMPDIFF(SECOND, start, end))" },
    { "label": "Day", "sql": "date_format(start, '%Y-%m-%d')" },
    { "label": "Month", "sql": "date_format(start, '%Y-%m')" },
  ];
  $scope.stackbyItems = [
    { "label": "Feature Server", "name": "fs" },
    { "label": "Context", "name": "context" },
    { "label": "Date", "name": "start" },
    { "label": "Customer", "name": "customerId" },
    { "label": "Mailbox", "name": "mailbox" }
  ];


  $scope.selected = {
    chart : "",
    xaxis : "",
    yaxis : "",
    stackby : [],
    servers : [],
    contexts : [],
    stackby : []
  }

  $scope.getContexts = function() {
    Vm.query({server: "context", context: $scope.selected.servers}, function(res) {
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
      'title': $scope.chartTitle,
      'type' : $scope.selected.chart.name,
      'selectX': $scope.selected.xaxis.sql,
      'selectY': $scope.selected.yaxis.sql,
      'yLabel': $scope.yLabel,
      'xLabel': $scope.xLabel,
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
    switch($scope.config.type) {
      case "histogram" :
        google.charts.load("current", {packages:["corechart"]});
        $scope.data.push(['', $scope.config.xLabel]);
        angular.forEach(res, function(value, key) {
          $scope.data.push(['', value.x]);
        });
        google.charts.setOnLoadCallback($scope.drawHistogram);
        break;
      case "bar" :
        google.charts.load("current", {packages:["corechart"]});
        $scope.data.push(['', $scope.config.yLabel]);
        angular.forEach(res, function(value, key) {
          $scope.data.push([value.y, parseInt(value.x)]);
        });
        google.charts.setOnLoadCallback($scope.drawBar);
        break;
      case "pie" :
        google.charts.load("current", {packages:["corechart"]});
        angular.forEach(res, function(value, key) {
          $scope.data.push([value.y, parseInt(value.x)]);
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
      title: $scope.config.title,
      height: 500,
      width: 850,
      legend: { position: 'top' }
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
      title: $scope.config.title,
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
      title: $scope.config.title,
      legend: { position: 'top' },
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
.controller('portalController', function($scope, Portal) {

})
.controller('extensionsController', function($scope, Portal) {
  $scope.extension = {
    'types' : [
      { "id": "sip", "name": "SIP" },
      { "id": "cloud", "name": "Cloud" },
      { "id": "std", "name": "Standard" }
    ]
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
