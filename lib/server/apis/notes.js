var Dao = require('../../daos/notes');


module.exports = function (app) {

    app.post('/note', function (req, res, next) {
        new Dao().addNote(req.body, handleError(res, function (note) {
            res.send(note);
        }));
    });

    app.put('/note', function (req, res, next) {
        new Dao().updateNote(req.body, handleError(res, function (result) {
            res.send({success: true});
        }));
    });

    app.get('/notes', function (req, res, next) {
        new Dao().findAll(handleError(res, function (notes) {
            res.send(notes);
        }));
    });

    app.get('/note/:noteId', function (req, res, next) {
        new Dao().find(req.params.noteId, handleError(res, function (note) {
            res.send(note);
        }));
    });

    app.del('/note/:noteId', function (req, res, next) {
        new Dao().deleteNote(req.params.noteId, handleError(res,
            function (result) {
                res.send({success: true});
            }));
    });

    var handleError = function (res, callback) {
        return function (err, result) {
            if (err) {
                return res.send({error: err});
            }
            callback(result);
        };
    };
};