// TryMongo
//
// Copyright (c) 2009 Kyle Banker
// Licensed under the MIT Licence.
// http://www.opensource.org/licenses/mit-license.php

/* globals socket, ajaxify */
var AppBaseURL = ""

var Connection = function() {
  this.initialize();
};

Connection.prototype = {
  
  initialize: function() {
  },

  insert: function(uid, collectionName, doc) {
    var username, insertResult;
    delete doc['_id'];
    doc = tojson(doc);

    $.ajax({url: "api/terminal/insert?uid=" + uid + "&collectionName=" + collectionName + "&doc=" + doc, type: 'GET', async: false, success: function(result){
      insertResult = result.result;
    }});
    
    return insertResult;
  },

  update: function(uid, collectionName, query, doc, upsert, multi) {
    var updateResult;
    doc = tojson(doc);
    query = tojson(query);

    $.ajax({url: "api/terminal/update?uid=" + uid + "&collectionName=" + collectionName + "&doc=" + doc + "&query=" + query, type: 'GET', async: false, success: function(result){
      updateResult = result.result;
    }});

    return updateResult;
  },

  remove: function(uid, collectionName, doc) {
    delete doc['_id'];
    doc = tojson(doc);
    var username, removeResult;

    $.ajax({url: "api/terminal/remove?uid=" + uid + "&collectionName=" + collectionName + "&doc=" + doc, type: 'GET', async: false, success: function(result){
      removeResult = result.result;
    }});

    return removeResult; 
  },

  // Should return the first set of results for a cursor docect.
  find: function(uid, collectionName, query, fields, limit, skip) {
    query      = tojson(query)  || {}
    fields     = fields || {}
    $.ajax({url: "api/terminal/find?uid=" + uid + "&collectionName=" + collectionName + "&query=" + query, type: 'GET', async: false, success: function(result){
      findResult = result;
    }});
    return findResult;
  },

  runCommand: function() {
  }
};

var $emptyCursor = function() {
};

$emptyCursor.prototype = {
  iterate: function() {
    return "Cursor is empty or no longer available.";
  }
};

var $resetCursor = function() {
  $lastCursor = new $emptyCursor();
};

// Store the last created cursor for easy iteration.
$lastCursor = new $emptyCursor();

var DBCursor = function(collectionName, query, fields, limit, skip) {
  this.collectionName = collectionName;
  this.query          = tojson(query)  || {};
  this.fields         = fields ? tojson(fields) : tojson({});
  this.limit          = limit  || 0;
  this.skip           = skip   || 0;
  this.position       = 0;
  this.count          = 100;
  this.cache          = [];

  this.initialize();
};

DBCursor.prototype = {

  initialize: function() {
    $lastCursor = this;
    return this;
  },

  _sendQuery: function(name, query, fields, limit, skip) {
    console.log('_sendQuery');
    // var ctx = this;
    return 'results';
    // $.ajax({url: AppBaseURL + 'find', type: 'POST', async: false, dataType: "json",
    //     data: {name: this.collectionName, query: this.query,
    //            fields: this.fields, limit: this.limit,
    //            skip: skip},
    //     complete: function() { },
    //     success: function(results) {ctx.cache = results;}});
  },

  refreshCache: function() {
    var skip = this.skip + this.position;
    this._sendQuery(this.collectionName, this.query, this.fields, this.limit, skip);
    return this.cache.empty() ? false : true;
  },

  iterate: function() {
    // if(this.cache.empty() && !this.refreshCache()) {
      // $resetCursor();
      $.get( "api/me", function( data ) {
        console.log('iterate');
        socket.emit('mongodb.find', data.username, function (err, data) {
          console.log(data)
          return 'data';
        });
      });
      return 'data';
    // }
    // else {
    //   var ctr = 0;
    //   var results = [];
    //   while(this.cache.length > 0 && ctr < 10) {
    //     results.push(this.cache.shift());
    //     ctr += 1;
    //     this.position += 1;
    //   }
    //   return results;
    // }
  },

  next: function() {
    if(this.cache.empty() && !this.refreshCache()) {
      return [];
    }
    else {
      var item = this.cache.shift();
      this.position += 1;
      return item;
    }
  },

  hasNext: function() {
    if(this.cache.empty() && !this.refreshCache())
      return false;
    else
      return true;
  },

  toString: function() {
    return 'DBCursor';
  }
}
