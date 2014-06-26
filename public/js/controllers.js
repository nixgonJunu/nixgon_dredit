'use strict';
// The Client ID obtained from the Google Developers Console.
var clientId = '65343229776-qn0rfdfbcll04v4lrhgokjli0d69ecc8.apps.googleusercontent.com';

// Scope to use to access user's photos.
var scope = ['https://www.googleapis.com/auth/drive.readonly'];

var oauthToken;

var pickerApiLoaded = false;

  // Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad() {
  gapi.load('auth', {'callback': onAuthApiLoad});
  gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
  window.gapi.auth.authorize(
      {
        'client_id': clientId,
        'scope': scope,
        'immediate': false
      },
      handleAuthResult);
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
  }
}
  
function UserCtrl($scope, backend) {
    $scope.user = null;
    $scope.login = function () {
        backend.user().then(function (response) {
            $scope.user = response.data;
        });
    }
    $scope.login();
}

function EditorCtrl($scope, $location, $routeParams, $timeout, editor, doc, autosaver) {
    console.log($routeParams.id);
    $scope.editor = editor;
    $scope.doc = doc;
    $scope.$on('saved',
        function (event) {
            $location.path('/edit/' + doc.resource_id);
        });
    if ($routeParams.id) {
        editor.load($routeParams.id);
    } else {
        // New doc, but defer to next event cycle to ensure init
        $timeout(function () {
                editor.create();
            },
            1);
    }
}

function ShareCtrl($scope, appId, doc) {
    /*
     var client = gapi.drive.share.ShareClient(appId);
     $scope.enabled = function() {
     return doc.resource_id != null;
     };
     $scope.share = function() {
     client.setItemIds([doc.resource_id]);
     client.showSharingSettings();
     }
     */
}

function MenuCtrl($scope, $location, appId) {
    var onFilePicked = function (data) {
        $scope.$apply(function () {
            if (data.action == 'picked') {
                var id = data.docs[0].id;
                $location.path('/edit/' + id);
            }
        });
    };
    $scope.open = function () {
	  if (oauthToken) {
	    var view = new google.picker.View(google.picker.ViewId.DOCS);
	    view.setMimeTypes('text/plain,text/html');
	    var picker = new google.picker.PickerBuilder()
		  .setAppId(appId)
		  .setOAuthToken(oauthToken)
		  .addView(view)
		  .setCallback(angular.bind(this, onFilePicked))
		  .build();
	    picker.setVisible(true);
	  }
    };
    $scope.create = function () {
        this.editor.create();
    };
    $scope.save = function () {
        this.editor.save(true);
    }
}

function RenameCtrl($scope, doc) {
    $('#rename-dialog').on('show',
        function () {
            $scope.$apply(function () {
                $scope.newFileName = doc.info.title;
            });
        });
    $scope.save = function () {
        doc.info.title = $scope.newFileName;
        $('#rename-dialog').modal('hide');
    };
}

function AboutCtrl($scope, backend) {
    $('#about-dialog').on('show',
        function () {
            backend.about().then(function (result) {
                $scope.info = result.data;
            });
        });
}