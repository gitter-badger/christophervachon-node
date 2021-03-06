var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    urlencode = bodyParser.urlencoded({ extended: false }),
    jsonBodyParser = bodyParser.json(),
    User = require('../../models/user')
;


router.route('/')
    .get(function(request, response) {
        User.find(function (errors, users) {
          if (errors) {
              response.status(500).json(errors);
              return;
          }
          for (var i=0,x=users.length; i<x; i++) {
              users[i].password = undefined;
          }
          response.status(200).json(users);
        });
    }) // close get
    .post(jsonBodyParser, urlencode, function(request, response) {
        var newUser = request.body;

        if (!request.user.isAdmin) {
            response.status(401).json("Unauthorized");
            return;
        }

        var errors = {};
        if ( !newUser.firstName ) { errors.firstName = "No firstName found"; }
        if ( !newUser.lastName ) { errors.lastName = "No lastName found"; }
        if ( !newUser.emailAddress ) { errors.emailAddress = "No emailAddress found"; }
        if ( !newUser.password ) { errors.password = "No password found"; }

        if (Object.keys(errors).length > 0) {
            response.status(400).json({validationerrors: errors});
            return;
        }

        User.create(newUser, function (error, user) {
          if (error) {
              response.status(500).json(error);
              return;
          }
          user.password = undefined;
          response.status(201).json(user);
        });
    }) // close post
; // close route('/')


router.route('/:id')
    .get(function(request, response) {
        User.findById(request.params.id, function (error, user) {
          if (error) {
              response.status(500).json(error);
              return;
          }
          if (user == null) {
              response.status(404).json("Not found");
              return;
          }
          user.password = undefined;
          response.status(200).json(user);
        });
    }) // close get
    .put(jsonBodyParser, urlencode, function(request, response) {

        if (!request.user.isAdmin) {
            response.status(401).json("Unauthorized");
            return;
        }

        User.findById(request.params.id, function (error, orig_user) {
            if (error) {
                response.status(500).json(error);
                return;
            }
            if (orig_user == null) {
                response.status(404).json("Not found");
                return;
            }

            for (key in request.body) {
                orig_user[key] = request.body[key];
            }

            var errors = {};
            if ( !orig_user.firstName ) { errors.firstName = "No firstName found"; }
            if ( !orig_user.lastName ) { errors.lastName = "No lastName found"; }
            if ( !orig_user.emailAddress ) { errors.emailAddress = "No emailAddress found"; }
            if ( !orig_user.password ) { errors.password = "No password found"; }

            if (Object.keys(errors).length > 0) {
                response.status(400).json({validationerrors: errors});
                return;
            }

            User.findByIdAndUpdate(request.params.id, request.body, function (error, user) {
                if (error) {
                    response.status(400).json(error);
                    return;
                }
                user.password = undefined;
                response.status(202).json(user);
            });
        });

    }) // close put
    .delete(function(request, response) {

        if (!request.user.isAdmin) {
            response.status(401).json("Unauthorized");
            return;
        }

        User.findByIdAndRemove(request.params.id, function (error, post) {
            if (error) {
                response.status(400).json(error);
                return;
            }
            response.status(204).json("");
        });
    }) // close delete
; // close route('/:index')

module.exports = router;
