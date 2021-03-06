import _ from 'underscore'
import socket from './socket'
import Pull from 'Pull'

var listeners = [];

var pullIndex = {};
var pulls = [];
var repoSpecs = [];

var throttledUpdate = _.throttle(update, 500);

socket.on('initialize', function(data) {
   if (!App.airplane) {
      removeAll();
      repoSpecs = data.repos;
      data.pulls.forEach(updatePull);

      update();
   }
});

socket.on('pullChange', function(pull) {
   if (!App.airplane) {
      updatePull(pull);

      throttledUpdate();
   }
});

function update() {
   _.each(listeners, function(listener) {
      listener(pulls);
   });
}

function removeAll() {
   pulls.forEach(function(pull) {
      pull.remove();
   });
   pulls = [];
   pullIndex = {};
}

function updatePull(pullData) {
   var pull = getPull(pullData);
   pullData.repoSpec = repoSpecs.find(repo => repo.name == pullData.repo)
   pull.update(pullData);
}

function getPull(pullData) {
   return pullIndex[pullData.repo + "#" + pullData.number] || createPull(pullData);
}

function createPull(pullData) {
   var pull = new Pull(pullData);
   pulls.push(pull);
   pullIndex[pull.repo + "#" + pull.number] = pull;
   return pull;
}

const pullManager = {
   onUpdate: function(listener) {
      listeners.push(listener);
   },

   getPulls: function() {
      return pulls;
   },

   trigger: function() {
      update();
   }
};

export default pullManager;
