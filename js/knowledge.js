"use strict";

var Bard = Bard || Em.Application.create();

Bard.Knowledge = Em.Object.create({

  _classes: Em.Object.create({
    content: Em.ArrayProxy.create({content: []}),
  }),

  classes: function() {
    if (this.get('_classes.content.content').length === 0) {
      $.ajax({
        url: 'http://bard.knowledge.prismaticgreen.com:4567/classes/all',
        dataType: "json",

        success: function(data) {
          data.sort(function(a, b) {
            return a['display_name'].localeCompare(b['display_name']);
          });
          _.each(data, function(klass) {
            var cl = Bard.Knowledge.Class.create(klass);
            var sh = {
              'name': cl.get('name'),
              'display_name': cl.get('display_name')
            };
            Bard.Knowledge.get('_classes.content').pushObject(sh);
            Bard.Knowledge.set('_classes.%@1'.fmt(sh.name), cl);
          });
        },

        error: function() {
          console.log("Could not load classes from BK.");
        },
      });
    }

    return this.get('_classes');
  }.property('_classes'),
});

Bard.Knowledge.Class = Em.Object.extend({
  name: null,

  _loaded: false,
  _loading: false,

  unknownProperty: function(key) {
    if (!this.get('_loaded') && !this.get('_loading')) {
      this._fetch();
    }
    return undefined;
  },

  _fetch: function() {
    var self = this;
    this.set('_loading', true);
    $.ajax({
      url: 'http://bard.knowledge.prismaticgreen.com:4567/classes/%@1'
        .fmt(this.get('name')),
      dataType: 'json',

      success: function(data) {
        if (!data) { return; }
        _.each(data.stats, function(value, key) {
          var v = parseInt(key);
          self.set(key, value);
        });
        self.set('_loaded', true);
        self.set('_loading', false);
      },

      error: function(err) {
        console.log('Could not load ' + self.get('name') + ' data from BK.');
        self.set('_loaded', false);
        self.set('_loading', false);
      },
    });
  }
});
