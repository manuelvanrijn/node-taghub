var fs = require('fs'),
    colors = require('colors'),
    program = require('commander'),
    prompt = require('prompt'),
    async = require('async'),
    Table = require('cli-table'),
    taghub = require('../lib/taghub');

var configFile = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + "/.taghub";
var taghubCli = {
  config: null,

  /**
  * Start of the CLI
  **/
  run: function(args) {
    this.load();

    program
      .version('0.0.1')
      .option('-l, --list', 'show a list of compare tasks')
      .option('-a, --add [name]', 'create a compare task with [name]')
      .option('-r, --remove [name]', 'remove the compare task [name]')
      .option('-t, --task [name]', 'only compare the tag versions of task [name]')
      .parse(args);

    if(program.list) {
      this.list();
    }
    else if(program.add) {
      this.add(program.add);
    }
    else if(program.remove) {
      this.remove(program.remove);
    }
    else if(program.task) {
      this.check(program.task);
    }
    else {
      this.check();
    }
  },

  /**
  * Shows a list of added tasks
  **/
  list: function() {
    var table = new Table({
      head: ['name', 'source', 'target']
    });

    this.config.tasks.forEach(function(task) {
      var yours = task.yours.full.yellow;
      var theirs = task.theirs.full.grey;
      table.push(['[' + task.name.green + ']', yours, theirs]);
    });

    console.log(table.toString());
  },

  /**
  * Asks additional information to add the task
  *
  * @param {String} name Name of the task to add
  **/
  add: function(name) {
    prompt.start();

    if(name !== true) {
      prompt.override = {name: name};
    }

    var ask = {
      properties: {
        name: {
          description: 'task name'
        },
        yours: {
          pattern: /^[a-zA-Z0-9-_]+(\/)+[a-zA-Z0-9-_]+$/,
          description: 'specify your repository ' + 'username/repo'.white,
          required: true
        },
        theirs: {
          pattern: /^[a-zA-Z0-9-_]+(\/)+[a-zA-Z0-9-_]+$/,
          description: 'specify their repository ' + 'username/repo'.white,
          required: true
        }
      }
    };

    var that = this;
    prompt.get(ask, function(err, result) {
      var task = taghub.createTask(result.name, result.yours, result.theirs);
      that.config.tasks.push(task);
      that.save();
    });
  },

  /**
  * Removes a task from the config
  *
  * @param {String} name Name of the task to remove
  * @return {Boolean} Returns true on success
  **/
  remove: function(name) {
    if(name === true) {
      console.log('Please specify the "task name" to remove'.red);
      return;
    }

    for(var i=0; i<this.config.tasks.length; i++) {
      var task = this.config.tasks[i];
      if(task.name === name) {
        this.config.tasks.splice(i, 1);
        console.log('Task: %s is removed'.green, name);
        this.save();
        return true;
      }
    }

    console.log('Unable to find task: %s'.red, name);
    return false;
  },

  /**
  * Check (all) task(s) or just the one matching the name
  *
  * @param {String} name Name of the task to check (optional)
  **/
  check: function(name) {
    var tasks = [];
    if(name === undefined) {
      // check all tasks
      tasks = this.config.tasks;
    }
    else {
      // find the task by name and check it
      var task = this.findTask(name);
      if(task === undefined) {
        console.log('Unable to find task: %s'.red, name);
        return;
      }
      tasks.push(task);
    }
    this.performCheckTasks(tasks);
  },

  /**
  * Find a task based by its name
  *
  * @param {String} name Name of the task to find
  * @return {Object} Returns the task on success
  **/
  findTask: function(name) {
    for(var i=0; i<this.config.tasks.length; i++) {
      var task = this.config.tasks[i];
      if(task.name === name) {
        return task;
      }
    }
  },

  /**
  * Checks the collection of tasks if tag version matches
  *
  * @param {Array} tasks The tasks to check
  **/
  performCheckTasks: function(tasks) {
    var table = new Table({
      head: ['name', 'description', 'target', 'source']
    });

    // default check all tasks
    async.each(tasks, function(task, callback) {
      taghub.checkTask(task, function(err, result) {
        var row = [];
        if(err) {
          row.push('[' + task.name.red + ']');
          row.push('[ERROR]'.red + ' - returned "' + err.message.grey + '"');
          row.push('???');
          row.push('???');
        }
        else {
          switch(result.compareState) {
          case 0:
            row.push('[' + task.name.green + ']');
            row.push('source and target versions are equal');
            row.push('v' + result.targetVersion.grey);
            row.push('v' + result.sourceVersion.grey);
            break;
          case 1:
            row.push('[' + task.name.red + ']');
            row.push('target is ahead of the source');
            row.push('v' + result.targetVersion.yellow);
            row.push('v' + result.sourceVersion.grey);
            break;
          case -1:
            row.push('[' + task.name.red + ']');
            row.push('source is ahead of the target?? ' + 'WuT!?!?!'.rainbow);
            row.push('v' + result.targetVersion.grey);
            row.push('v' + result.sourceVersion.yellow);
            break;
          }
        }
        table.push(row);
        callback();
      });
    }, function() {
      console.log(table.toString());
    });
  },

  /**
  * Loads the tasks from the config file
  **/
  load: function() {
    if(this.config !== null) {
      return;
    }

    try {
      var data = fs.readFileSync(configFile);
      this.config = JSON.parse(data);
    }
    catch (err) {
      console.log('No config file found, creating a new one at %s'.grey,
                  configFile);
      this.config = {tasks: []};
      this.save();
    }
  },

  /**
  * Save the tasks to the config file
  **/
  save: function() {
    var data = JSON.stringify(this.config);
    fs.writeFile(configFile, data, function (err) {
      if (err) {
        console.log('There has been an error saving this config file.'.red);
        console.log(err.message);
        return;
      }
    });
  }
};

module.exports = taghubCli;
