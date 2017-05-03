/* global X2JS,vkbeautify */
(function () {
  'use strict';
  angular.module('app.detail')
  .controller('DetailCtrl', DetailCtrl);

  DetailCtrl.$inject = ['doc', '$stateParams','MLRest', 'ngToast','$state', '$q'];
  function DetailCtrl(doc, $stateParams, MLRest, toast, $state, $q) {
    var ctrl = this;

    ctrl.myOptions = {
      edges: {
        color: 'red'
      }, nodes: {
        color: {
          background: 'orange'
        }
      }
    };

    ctrl.myEvents = {
      hold: function(params) {
        console.log('you are holding something: ', params);
      }
    };

    function cannedSearch(uris) {
      return $q.when({
        nodes: [
          {
            id: '1',
            label: 'The Number 1!',
            group: 'number', // optional
            linkCount: 8 // we look for this to add an small orb to the icon
          },
          {
            id: '2',
            label: 'The Only Even Prime!',
            group: 'number', // optional
            linkCount: 16 // we look for this to add an small orb to the icon
          }
        ],
        links: [
          {
            id: 'more-2-1',
            label: 'moreThan',
            from: '2',
            to: '1'
          }
        ]
      });
    }

    var uri = $stateParams.uri;

    var contentType = doc.headers('content-type');

    var x2js = new X2JS();
    /* jscs: disable */
    if (contentType.lastIndexOf('application/json', 0) === 0) {
      /*jshint camelcase: false */
      ctrl.xml = vkbeautify.xml(x2js.json2xml_str(
          { xml: doc.data }
      ));
      ctrl.json = doc.data;
      ctrl.type = 'json';
    } else if (contentType.lastIndexOf('application/xml', 0) === 0) {
      ctrl.xml = vkbeautify.xml(doc.data);
      /*jshint camelcase: false */
      ctrl.json = x2js.xml_str2json(doc.data).xml;
      ctrl.type = 'xml';
      /* jscs: enable */
    } else if (contentType.lastIndexOf('text/plain', 0) === 0) {
      ctrl.xml = doc.data;
      ctrl.json = {'Document' : doc.data};
      ctrl.type = 'text';
    } else if (contentType.lastIndexOf('application', 0) === 0 ) {
      ctrl.xml = 'Binary object';
      ctrl.json = {'Document type' : 'Binary object'};
      ctrl.type = 'binary';
    } else {
      ctrl.xml = 'Error occured determining document type.';
      ctrl.json = {'Error' : 'Error occured determining document type.'};
    }

    angular.extend(ctrl, {
      doc : doc.data,
      uri : uri,
      cannedSearch: cannedSearch,
      delete: deleteFunc
    });

    function deleteFunc() {
      MLRest.deleteDocument (uri).then(function(response) {
        // create a toast with settings:
        toast.create({
          className: 'warning',
          content: 'Deleted ' + uri,
          dismissOnTimeout: true,
          timeout: 2000,
          onDismiss: function () {
            //redirect to search page
            $state.go('root.search');
          }
        });
      });
    }

  }
}());
