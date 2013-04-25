/*global before,after*/

var Dao = require('../../lib/daos/notes');

var assert = require('assert');
var async = require('async');
var sugar = require('sugar');

var util = require('util');

describe('Notes Dao', function () {

    before(function (done) {
        console.log('Cleaning up test content before testing');
        new Dao().cleanTests(done);
    });

    it('Should insert a new note into the database', function (done) {
        var dao = new Dao().addNote(
            {content: 'This is the content of the note', isTest: true},
            assertIfErrorElse(function (result) {
                assert.ok(result._id,
                    'Id was not created');
                assert.ok(result.creationDate,
                    'Creation date was not set');
                assert.ok(result.lastUpdatedDate,
                    'Last updated date was not set');
                done();
            }));
    });

    it('Should find a note', function (done) {
        var dao = new Dao();
        var id;
        async.waterfall([
            function (callback) {
                dao.addNote(
                    {content: 'This is the content of the note', isTest: true},
                    callback
                );
            },
            function (result, callback) {
                id = result._id.toString();
                dao.find(id, callback);
            },
            function (result, callback) {
                assert.equal(result._id, id);
                callback();
            }

        ],
            function (err, result) {
                assert.ifError(err, err);
                done();
            }
        );
    });

    it('Should find all notes', function (done) {
        var dao = new Dao();

        var findById = function (id) {
            return function (note) {
                return note._id.toString() === id.toString();
            };
        };

        async.map(
            [
                {content: 'This is the content of the note 1', isTest: true},
                {content: 'This is the content of the note 2', isTest: true},
                {content: 'This is the content of the note 3', isTest: true}
            ],
            dao.addNote,
            assertIfErrorElse(function (addedNotes) {
                assert.ok(addedNotes.length === 3,
                    '3 Notes should have been added');

                dao.findAll(assertIfErrorElse(function (results) {
                    assert.ok(results.find(findById(addedNotes[0]._id),
                        'Cannot find first note'));
                    assert.ok(results.find(findById(addedNotes[1]._id),
                        'Cannot find second note'));
                    assert.ok(results.find(findById(addedNotes[2]._id),
                        'Cannot find third note'));

                    done();
                }));
            }));
    });

    it('Should update an existing record', function (done) {
        var dao = new Dao();
        var id;
        var newContent = 'This is the new content of the note';
        dao.addNote(
            {content: 'This is the content of the note', isTest: true},
            assertIfErrorElse(function (result) {
                id = result._id.toString();
                result.content = newContent;
                dao.updateNote(result, updateCompleteHandler);
            })
        );
        var updateCompleteHandler = function (err) {
            dao.find(id, assertIfErrorElse(function (result) {
                assert.equal(result.content, newContent);
                done();
            }));
        };
    });

    it('Should delete an existing record', function (done) {
        var dao = new Dao();
        var id;

        async.waterfall([
            function (callback) {
                dao.addNote(
                    {content: 'This is the content of the note', isTest: true},
                    callback
                );
            },
            function (result, callback) {
                id = result._id.toString();
                dao.find(id, callback);
            },
            function (result, callback) {
                assert.ok(result);
                assert.equal(result._id, id);
                dao.deleteNote(id, callback);
            },
            function (result, callback) {
                dao.find(id, callback);
            },
            function (result, callback) {
                assert.deepEqual(result, undefined);
                callback();
            }
        ],
            function (err, result) {
                assert.ifError(err);
                done();
            }
        );
    });

    after(function (done) {
        console.log('Cleaning up test content after testing');
        new Dao().cleanTests(done);
    });

    var assertIfErrorElse = function (callback) {
        return function (err, result) {
            assert.ifError(err);
            callback(result);
        };
    };
});