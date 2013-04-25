/*global before,after*/

var Dao = require('../../../lib/daos/notes');

var restify = require('restify');
var async = require('async');

var util = require('util');
var assert = require('assert');

var client = restify.createJsonClient({
    versions: '*',
    url: 'http://localhost:1234'
});

describe('API tests', function () {
    before(function (done) {
        require('../../../index');
        new Dao().cleanTests(done);
    });

    it('Should create a new note', function (done) {
        client.post('/note',
            {
                content: 'This is the notes content',
                isTest: true
            },
            function (err, req, res, obj) {
                assert.ifError(err);
                assert.ok(res.statusCode === 200, 'Incorrect status returned');
                assert.ok(obj._id, 'Id was set on note response');
                done();
            }
        );
    });

    it('Should retrieve an existing note', function (done) {
        var id;
        async.waterfall([
            function (callback) {
                createNote(callback);
            },
            function (req, res, obj, callback) {
                id = obj._id;
                client.get(util.format('/note/%s', id.toString()), callback);
            },
            function (req, res, obj, callback) {
                assert.equal(res.statusCode, 200,
                    'Invalid status code returned');
                assert.equal(obj._id, id,
                    'Incorrect object id returned');
                callback();
            }
        ],
            function (err, result) {
                assert.ifError(err, err);
                done();
            }
        );
    });

    it('Should update an existing note', function (done) {
        var id;
        var updatedContent = 'Changed content';
        async.waterfall([
            function (callback) {
                createNote(callback);
            },
            function (req, res, obj, callback) {
                id = obj._id;
                obj.content = updatedContent;
                client.put('/note',
                    obj,
                    callback
                );
            },
            function (req, res, obj, callback) {
                client.get(util.format('/note/%s', id),
                    callback
                );
            },
            function (req, res, obj, callback) {
                assert.equal(res.statusCode, 200,
                    'Invalid status code returned');
                assert.equal(obj.content, updatedContent,
                    'Content was not updated correctly');
                callback();
            }
        ],
            function (err, result) {
                assert.ifError(err, err);
                done();
            }
        );
    });

    it('Should retrieve all notes', function (done) {
        client.get('/notes', function (err, req, res, obj) {
            assert.ifError(err, err);
            assert.equal(res.statusCode, 200, 'Incorrect status code returned');
            assert.ok(obj.length > 0, 'Some results were returned');
            done();
        });
    });

    it('Should delete an note', function (done) {
        var id;
        async.waterfall([
            function (callback) {
                createNote(callback);
            },
            function (req, res, obj, callback) {
                id = obj._id;
                client.get(util.format('/note/%s', id.toString()), callback);
            },
            function (req, res, obj, callback) {
                assert.equal(id, obj._id, 'Did not get the expected note back');
                client.del(util.format('/note/%s', id.toString()), callback);
            },
            function (req, res, obj, callback) {
                assert.equal(res.statusCode, 200,
                    'Correct status code returned');
                assert.ok(obj.success, 'Response object not success');
                client.get(util.format('/note/%s', id.toString()), callback);
            },
            function (req, res, obj, callback) {
                assert.equal(res.statusCode, 200,
                    'Correct status code returned');
                assert.equal(obj._id, undefined,
                    'An object came back when it should have been deleted');
                callback();
            }

        ],
            function (err, result) {
                assert.ifError(err, err);
                done();
            }
        );
    });

    after(function (done) {
        new Dao().cleanTests(done);
    });

    var createNote = function (callback) {
        client.post('/note',
            {
                content: 'This is the notes content',
                isTest: true
            },
            callback
        );
    };
});