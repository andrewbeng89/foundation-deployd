RESTUrl = 'http://ec2-54-179-38-224.ap-southeast-1.compute.amazonaws.com';
socket = io.connect(RESTUrl, {
    port: 80
});
var todoApp = angular.module('todoApp', []).config(function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
});

todoApp.controller('LoginController', ["$scope", "$http",
    function($scope, $http) {
        $scope.user;
        $scope.username = '';
        $scope.password = '';
        $scope.loggedIn = function() {
            $http.get(RESTUrl + '/users/me')
                .success(function(user) {
                    $scope.user = user;
                }).error(function(err) {
                    alert(err);
                });
        }
        $scope.loggedIn();

        $scope.login = function() {
            $http.post(RESTUrl + '/users/login', {
                username: $scope.username,
                password: $scope.password
            }).success(function(user) {
                $scope.loggedIn();
                $('#myModal').foundation('reveal', 'close');
            }).error(function(err) {
                // Alert if there's an error
                return alert(err.message || "an error occurred");
            });
        }

        $scope.logout = function() {
            $http.post(RESTUrl + '/users/logout').success(function() {
                $scope.user = undefined;
            }).error(function(err) {
                // Alert if there's an error
                return alert(err.message || "an error occurred");
            });
        }
    }
]).controller('TodoController', ["$scope", "$http",
    function($scope, $http) {

        $scope.todos = [];

        // Get all todos
        $scope.getTodos = function() {
            $http.get(RESTUrl + '/todos')
                .success(function(todos) {
                    $scope.loaded = true;
                    $scope.todos = todos;
                }).error(function(err) {
                    alert(err);
                });
        };
        $scope.getTodos();

        $scope.addTodo = function(title) {
            $http.post(RESTUrl + '/todos', {
                title: title,
                completed: false
            }).success(function(todo) {
                $scope.newTodoTitle = '';
                $scope.todos.push(todo);
            }).error(function(err) {
                // Alert if there's an error
                return alert(err.message || "an error occurred");
            });
        };

        $scope.changeCompleted = function(todo) {
            // Update the todo
            $http.put(RESTUrl + '/todos/' + todo.id, {
                completed: todo.completed
            }).error(function(err) {
                return alert(err.message || (err.errors && err.errors.completed) || "an error occurred");
            });
        };

        $scope.removeCompletedItems = function() {
            $http.get(RESTUrl + '/todos', {
                params: {
                    completed: true
                }
            }).success(function(todos) {
                todos.forEach(function(t) {
                    deleteTodo(t);
                });
            });
        };

        function deleteTodo(todo) {
            $http.delete(RESTUrl + '/todos/' + todo.id, {
                params: {
                    completed: true
                }
            }).success(function() {
                // Find the index of an object with a matching id
                var index = $scope.todos.indexOf(
                    $scope.todos.filter(function(t) {
                        return t.id === todo.id;
                    })[0]);

                if (index !== -1) {
                    $scope.todos.splice(index, 1);
                }
            }).error(function(err) {
                alert(err.message || "an error occurred");
            });
        }

        socket.on('todo:created', function() {
            $scope.getTodos();
        });

    }
]);