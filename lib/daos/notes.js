var mongo = require('mongodb');
var async = require('async');

var util = require('util');

module.exports = function () {
    var Server = mongo.Server,
        Db = mongo.Db,
        BSON = mongo.BSONPure,
        ObjectId = mongo.ObjectID;

    // TODO externalize this configuration
    var server = new Server('localhost', 27017, {auto_reconnect: true});

    var db = new Db('notes', server, {w: 1});
    var connection;
    var connecting = false;
    var connectionCallbacks = [];

    var collection = function (callback) {
        connect(function (err, db) {
            if (!err) {
                return db.collection('notes', callback);
            } else {
                return callback(err, null);
            }
        });
    };
    var connect = function (callback) {
        if (connection) {
            return callback(null, connection);
        }
        if (!connecting) {
            connecting = true;
            db.open(function (err, db_) {
                if (!err) {
                    connection = db_;
                } else {
                    console.log(err);
                }
                connecting = false;
                alertConnectionListeners(err, db_);
                return callback(err, db_);
            });
        } else {
            connectionCallbacks.push(callback);
        }
    };

    var alertConnectionListeners = function (err, db) {
        async.each(connectionCallbacks,
            function (item) {
                if (item) {
                    item(err, db);
                }
            },
            function (err) {
                connectionCallbacks.length = 0;
            });
    };

    this.findAll = function (callback) {
        collection(function (err, collection) {
            if (!err) {
                collection.find().toArray(function (err, items) {
                    callback(err, items);
                });
            } else {
                callback(err, null);
            }
        });
    };

    this.find = function (noteId, callback) {
        try {
            var objectId = ObjectId.createFromHexString(noteId);
        } catch (err) {
            return callback(err, null);
        }

        collection(function (err, collection) {
            if (!err) {
                collection.find({_id: objectId}).toArray(
                    function (err, items) {
                        callback(err, items[0]);
                    });
            } else {
                callback(err, null);
            }
        });
    };

    this.addNote = function (note, callback) {
        note.creationDate = new Date();
        note.lastUpdatedDate = new Date();
        collection(function (err, collection) {
            if (!err) {
                collection.insert(note, {safe: true}, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(err, null);
            }
        });
    };

    this.deleteNote = function (noteId, callback) {
        try {
            var objectId = ObjectId.createFromHexString(noteId);
        } catch (err) {
            return callback(err, null);
        }

        collection(function (err, collection) {
            if (!err) {
                collection.remove({_id: objectId},
                    callback);
            } else {
                callback(err, null);
            }
        });
    };

    this.updateNote = function (note, callback) {
        note.lastUpdatedDate = new Date();
        if (typeof note._id !== ObjectId) {
            note._id = ObjectId.createFromHexString(note._id.toString());
        }
        collection(function (err, collection) {
            if (!err) {
                collection.update({_id: note._id},
                    note,
                    {safe: true},
                    callback);
            } else {
                callback(err, null);
            }
        });
    };

    /**
     * Testing purposes only.  Will clean up any items in the notes collection
     * with isTest=true
     * @param callback
     */
    this.cleanTests = function (callback) {
        collection(function (err, collection) {
            collection.remove({isTest: true}, function (err, result) {
                callback(err, result);
            });
        });
    };
};

