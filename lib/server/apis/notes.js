var Dao = require('../../daos/notes');


module.exports = function (app) {

    var dao = new Dao();

    app.post('/note', function (req, res, next) {
        dao.addNote(req.body, handleError(res, function (note) {
            res.send(201, note);
        }));
    });

    app.put('/note', function (req, res, next) {
        dao.updateNote(req.body, handleError(res, function (result) {
            res.send({success: true});
        }));
    });

    app.get('/notes', function (req, res, next) {
        dao.findAll(handleError(res, function (notes) {
            res.send(notes);
        }));
    });

    app.get('/note/:noteId', function (req, res, next) {
        dao.find(req.params.noteId, handleError(res, function (note) {
            res.send(note);
        }));
    });

    app.del('/note/:noteId', function (req, res, next) {
        dao.deleteNote(req.params.noteId, handleError(res,
            function (result) {
                res.send({success: true});
            }));
    });

    var handleError = function (res, callback) {
        return function (err, result) {
            if (err) {
                return res.send(err);
            }
            callback(result);
        };
    };
};