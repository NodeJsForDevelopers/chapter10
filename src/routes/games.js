'use strict';

const express = require('express');
const router = express.Router();
const service = require('../services/games');

router.post('/', function(req, res, next) {
    const word = req.body.word;
    if (word && /^[A-Za-z]{3,}$/.test(word)) {
        service.create(req.user.id, word, (err, game) => {
            if (err) {
                next(err);
            } else {
                res.redirect(`/games/${game.id}/created`);
            }
        });
    } else {
        res.status(400).send('Word must be at least three characters long and contain only letters');
    }
});

const checkGameExists = function(id, res, onSuccess, onError) {
    service.get(id, function(err, game) {
        if (err) {
            onError(err);
        } else {
            if (game) {
                onSuccess(game);
            } else {
                res.status(404).send('Non-existent game ID');
            }
        }
    });
};

router.get('/:id', function(req, res, next) {
    checkGameExists(
        req.params.id,
        res,
        game => res.render('game', {
            length: game.word.length,
            id: game.id
        }),
        next);
});

router.post('/:id/guesses', function(req, res, next) {
    checkGameExists(
        req.params.id,
        res,
        game => {
            res.send({
                positions: game.positionsOf(req.body.letter)
            });
        },
        next
    );
});

router.delete('/:id', function(req, res, next) {
    checkGameExists(
        req.params.id,
        res,
        game => {
            if (game.setBy === req.user.id) {
                game.remove((err) => {
                    if (err) {
                        next(err);
                    } else {
                        res.send();
                    }
                });
            } else {
                res.status(403).send(
                    'You do not have permission to delete this game'
                );
            }
        },
        next
    );
});

router.get('/:id/created', function(req, res, next) {
    checkGameExists(
        req.params.id,
        res,
        game => res.render('createdGame', game));
});

module.exports = router;