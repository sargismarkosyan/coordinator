'use strict';

describe('coordinatorApp.home module', function () {

  beforeEach(module('coordinatorApp.home'));

  describe('HomeController controller', function () {
    var HomeController, $HomeControllerScope;
    beforeEach(inject(function ($controller) {
      $HomeControllerScope = {};
      HomeController = $controller('HomeController', {'$scope': $HomeControllerScope});
    }));

    it('should be defined', inject(function () {
      expect(HomeController).toBeDefined();
    }));

    it('should have image', inject(function ($http) {
      expect($HomeControllerScope.image).toBeDefined();
      expect($HomeControllerScope.image.read).toBeDefined();
      $HomeControllerScope.image.read(image).then(function (image) {
        console.log(arguments);
        expect(image).toBeDefined();
      });
    }));
  });
});
