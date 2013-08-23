var semver = require('semver'),
    GitHubApi = require('github');

var github = new GitHubApi({
  version: '3.0.0'
});

/**
* Create a task and add it to the tasks collection
*
* @param {String} name Name of the task
* @param {String} yoursStr Your repository of the task
* @param {String} theirsStr Their repository of the task
* @return {Object} The Task
**/
module.exports.createTask = function(name, yoursStr, theirsStr) {
  yours = yoursStr.split('/');
  theirs = theirsStr.split('/');

  return {
    name: name,
    yours: {
      user: yours[0],
      repo: yours[1],
      full: yoursStr
    },
    theirs: {
      user: theirs[0],
      repo: theirs[1],
      full: theirsStr
    }
  };
};

/**
* Compare the tag versions of a task
*
* @param {Object} task The task
* @param {Function} callback A callback returning the compare {Object}
**/
module.exports.checkTask = function(task, callback) {
  github.repos.getTags(task.theirs, function(err, res) {
    if(err) {
      return callback(JSON.parse(err), []);
    }

    var targetVersion = res[0].name;
    if(targetVersion.split('.').length === 2) {
      targetVersion += '.0';
    }
    github.repos.getTags(task.yours, function(err, res) {
      var sourceVersion = res[0].name;
      var compareState = semver.compare(targetVersion, sourceVersion);
      callback(false, {
        sourceVersion: semver.clean(sourceVersion),
        targetVersion: semver.clean(targetVersion),
        compareState: compareState
      });
    });
  });
};
