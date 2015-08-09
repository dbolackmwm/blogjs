
appControllers.controller('PostListCtrl', ['$scope', '$sce', '$window', 'PostService',
    function PostListCtrl($scope, $sce, $window, PostService) {

        $scope.posts = [];
		var userTags = $window.sessionStorage.tags.toUpperCase().split(',');
		var filtered = [];
        PostService.findAllPublished().success(function(data) {
            for (var postKey in data) {
           		var Found=false
            	for ( var userTagsLoop=0; userTagsLoop < userTags.length; userTagsLoop++ )
            	{
            		var compareKeys = []
            		for( var tagKey in data[postKey].tags )
            			compareKeys[tagKey] = data[postKey].tags[tagKey].toUpperCase();
            		if ( compareKeys.indexOf(userTags[userTagsLoop]) > -1 )
            		{
	            		Found = true;
            		}
            	}
        		if ( Found )
        		{
        			filtered.push( data[postKey] );
        			filtered[ filtered.length -1 ].content = $sce.trustAsHtml( filtered[ filtered.length -1 ].content ); 
	            }
            }

            $scope.posts = filtered;            
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
]);

appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService', 'LikeService',
    function PostViewCtrl($scope, $routeParams, $location, $sce, PostService, LikeService) {

        $scope.post = {};
        var id = $routeParams.id;

        $scope.isAlreadyLiked = LikeService.isAlreadyLiked(id);

        PostService.read(id).success(function(data) {
            data.content = $sce.trustAsHtml(data.content);
            $scope.post = data;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });

        //Like a post
        $scope.likePost = function likePost() {
            if (!LikeService.isAlreadyLiked(id)) {
                PostService.like(id).success(function(data) {
                    $scope.post.likes++;
                    LikeService.like(id);
                    $scope.isAlreadyLiked = true;
                }).error(function(data, status) {
                    console.log(status);
                    console.log(data);
                });
            }
        };

        //Unlike a post
        $scope.unlikePost = function unlikePost() {
            if (LikeService.isAlreadyLiked(id)) {
                PostService.unlike(id).success(function(data) {
                    $scope.post.likes--;
                    LikeService.unlike(id);
                    $scope.isAlreadyLiked = false;
                }).error(function(data, status) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

    }
]);


appControllers.controller('AdminPostListCtrl', ['$scope', 'PostService', 
    function AdminPostListCtrl($scope, PostService) {
        $scope.posts = [];

        PostService.findAll().success(function(data) {
            $scope.posts = data;
        });

        $scope.updatePublishState = function updatePublishState(post, shouldPublish) {
            if (post != undefined && shouldPublish != undefined) {

                PostService.changePublishState(post._id, shouldPublish).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == post._id) {
                            $scope.posts[postKey].is_published = shouldPublish;
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == id) {
                            $scope.posts.splice(postKey, 1);
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$location', 'PostService',
    function AdminPostCreateCtrl($scope, $location, PostService) {
        $('#textareaContent').wysihtml5({"font-styles": false});

        $scope.save = function save(post, shouldPublish) {
            if (post != undefined 
                && post.title != undefined
                && post.tags != undefined) {

                var content = $('#textareaContent').val();
                if (content != undefined) {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    PostService.create(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
    function AdminPostEditCtrl($scope, $routeParams, $location, $sce, PostService) {
        $scope.post = {};
        var id = $routeParams.id;

        PostService.read(id).success(function(data) {
            $scope.post = data;
            $('#textareaContent').wysihtml5({"font-styles": false});
            $('#textareaContent').val($sce.trustAsHtml(data.content));
        }).error(function(status, data) {
            $location.path("/admin");
        });

        $scope.save = function save(post, shouldPublish) {
            if (post !== undefined 
                && post.title !== undefined && post.title != "") {

                var content = $('#textareaContent').val();
                if (content !== undefined && content != "") {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    // string comma separated to array
                    if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
                        post.tags = post.tags.split(',');
                    }
                    
                    PostService.update(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {

        //Admin User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            if (username != null && password != null) {

                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/admin");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().success(function(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/admin/login");
            }
        }

        $scope.register = function register(username, password, passwordConfirm, tags ) {
            if (AuthenticationService.isAuthenticated) {
                UserService.register(username, password, passwordConfirm, tags ).success(function(data) {
                    $location.path("/admin");
                    //$location.path("/admin/login");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);

appControllers.controller('UserUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function UserUserCtrl($scope, $location, $window, UserService, AuthenticationService) {

        //User User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            if (username != null && password != null) {
                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.tags = data.tags;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().success(function(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/login");
            }
        }

        $scope.register = function register(username, password, passwordConfirm, tags ) {
            if (AuthenticationService.isAuthenticated) {
                UserService.register(username, password, passwordConfirm, tags ).success(function(data) {
                    $location.path("/login");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/admin");
            }
        }
    }
]);



appControllers.controller('PostListTagCtrl', ['$scope', '$routeParams', '$window', '$sce', 'PostService',
    function PostListTagCtrl($scope, $routeParams, $window, $sce, PostService) {

        $scope.posts = [];
        var tagName = ""
        if ( $routeParams.tagName )
        {
        	tagName = $routeParams.tagName
        }
        else if( $window.sessionStorage.tags )
        {
        	tagName = $window.sessionStorage.tags;
        }
        if ( tagName.length !=1 )
        {
        	tagName = "anotherTag";
        }

        PostService.findByTag(tagName).success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }
            $scope.posts = data;
        }).error(function(status, data) {
            console.log(status);
            console.log(data);
        });

    }
]);
