angular.module('example', ['direct'])
  .controller('test', function($scope, $timeout) {
    $scope.receive = [];
    $timeout(function() {
      $scope.$broadcast('pageTotal', 2)
    }, 500)

    $scope.$on('pageMsg', function($e, err, data) {
      if (err) alert(err)
      else {
        data = (typeof data) === 'string' ? JSON.parse(data) : data;
        $scope.receive = data;
      }
    })

  })