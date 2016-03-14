'use strict';

angular.module('coordinatorApp.home', ['ui.router'])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/controllers/home/home.html',
        controller: 'HomeController'
      });
  }])
  .controller('HomeController', ['$scope', '$q', '$window', function ($scope, $q, $window) {
    $scope.looked = false;
    $scope.mashtab = {
      startX: 0,
      startValueX: 0,
      heightX: 100,
      valueX: 0,
      startY: 0,
      startValueY: 0,
      heightY: 100,
      valueY: 0
    };

    $scope.cordinates = {
      x: 0,
      y: 0
    };

    var canvas = new fabric.Canvas('graphCanvas');
    var image;
    var strokeWidth = 6;
    var x0 = 75;
    var y0 = canvas.height - 75;
    var xRealStart = x0 - strokeWidth / 2;
    var yRealStart = y0 - strokeWidth / 2;
    canvas.on('mouse:down', function (event) {
      if (!$scope.looked) return;
      var coefficient = getCoefficient();
      var pointer = canvas.getPointer(event.e);
      var cords = {
        top: pointer.y - strokeWidth / 2,
        left: pointer.x - strokeWidth / 2
      };
      point.set(cords);
      canvas.renderAll();

      $scope.cordinates.y = (yRealStart - pointer.y) * coefficient.y;
      $scope.cordinates.x = (pointer.x - xRealStart) * coefficient.x;
      $scope.$apply();
    });

    $scope.$watch('cordinates', updatePoint, true);

    var lineStyle = {
      fill: 'red',
      stroke: 'red',
      strokeWidth: 2,
      selectable: false
    };
    var mashtabStyle = {
      fill: 'blue',
      stroke: 'blue',
      strokeWidth: 2,
      selectable: false
    };

    var point = new fabric.Circle({
      top: canvas.height - 75 - strokeWidth / 2,
      left: 75 - strokeWidth / 2,
      radius: 4,
      opacity: 0.7,
      fill: '#00ff00',
      selectable: false
    });
    var lineY = new fabric.Line([75, -1000, 75, 1000], lineStyle);
    var lineX = new fabric.Line([-1000, canvas.height - 75, 1000, canvas.height - 75], lineStyle);
    var mashtabY = new fabric.Line([75, canvas.height - 175, 75, canvas.height - 75], mashtabStyle);
    var mashtabX = new fabric.Line([75, canvas.height - 75, 175, canvas.height - 75], mashtabStyle);
    canvas.add(lineX, lineY, mashtabX, mashtabY, point);

    $scope.$watchCollection('[mashtab.startY, mashtab.startValueY, mashtab.heightY, mashtab.valueY]', function () {
      var coefficient = getCoefficient();
      yRealStart = coefficient.y ? (y0 - $scope.mashtab.startY) + ($scope.mashtab.startValueY / coefficient.y) : y0 - strokeWidth / 2;
      mashtabY.set({
        y1: y0 - $scope.mashtab.startY - $scope.mashtab.heightY,
        y2: y0 - $scope.mashtab.startY
      });
      canvas.renderAll();
      updatePoint();
    });

    $scope.$watchCollection('[mashtab.startX, mashtab.startValueX, mashtab.heightX, mashtab.valueX]', function () {
      var coefficient = getCoefficient();
      xRealStart = coefficient.x ? (x0 + $scope.mashtab.startX) - ($scope.mashtab.startValueX / coefficient.x) : x0 - strokeWidth / 2;
      mashtabX.set({
        x1: x0 + $scope.mashtab.startX,
        x2: x0 + $scope.mashtab.startX + $scope.mashtab.heightX
      });
      canvas.renderAll();
      updatePoint();
    });

    $scope.$watch('looked', function (value) {
      if (!image) return;
      image.set({selectable: !value});
      canvas.renderAll();
    });

    $($window).keydown(function (event) {
      if (!image || $scope.looked) return;
      var cords = {
        top: image.top,
        left: image.left
      };

      switch (event.which) {
        case 37://Left
          cords.left--;
          break;
        case 38://Up
          cords.top--;
          break;
        case 39://Right
          cords.left++;
          break;
        case 40://Down
          cords.top++;
          break;
      }

      image.set(cords);
      canvas.setActiveObject(image);
    });

    $('#imageUploader').get(0).onchange = function handleImage(e) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
          if (image) image.remove();
          image = new fabric.Image(imgObj);
          image.set({
            left: 0,
            top: 0,
            padding: 10,
            cornersize: 10
          });
          canvas.add(image);
          image.moveTo(0);
        };
      };

      reader.readAsDataURL(e.target.files[0]);
    };

    function getCoefficient() {
      return {
        x: ($scope.mashtab.valueX - $scope.mashtab.startValueX) / ($scope.mashtab.heightX),
        y: ($scope.mashtab.valueY - $scope.mashtab.startValueY) / ($scope.mashtab.heightY)
      };
    }

    function updatePoint() {
      var coefficient = getCoefficient();
      point.set({
        top: coefficient.y ? (yRealStart - ($scope.cordinates.y / coefficient.y)) - strokeWidth / 2 : yRealStart,
        left: coefficient.x ? (xRealStart + ($scope.cordinates.x / coefficient.x)) - strokeWidth / 2 : xRealStart
      });
      canvas.renderAll();
    }
  }]);
