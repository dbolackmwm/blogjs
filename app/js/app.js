'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3001";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/signin', {
            templateUrl: 'partials/user.signin.html',
            controller: 'UserUserCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/signout', {
            templateUrl: 'partials/user.logout.html',
            controller: 'UserUserCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/post/:id', {
            templateUrl: 'partials/post.view.html',
            controller: 'PostViewCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/tag/:tagName', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListTagCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin', {
            templateUrl: 'partials/admin.post.list.html',
            controller: 'AdminPostListCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        when('/admin/post/create', {
            templateUrl: 'partials/admin.post.create.html',
            controller: 'AdminPostCreateCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        when('/admin/post/edit/:id', {
            templateUrl: 'partials/admin.post.edit.html',
            controller: 'AdminPostEditCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        when('/admin/user/', {
            templateUrl: 'partials/admin.user.list.html',
            controller: 'AdminUserCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        when('/admin/usercreate/', {
            templateUrl: 'partials/admin.usercreate.html',
            controller: 'UserUserCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        when('/admin/login', {
            templateUrl: 'partials/admin.signin.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/logout', {
            templateUrl: 'partials/admin.logout.html',
            controller: 'AdminUserCtrl',
            access: { requiredAdminAuthentication: true }
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/signin");
        }
        else if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAdminAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});