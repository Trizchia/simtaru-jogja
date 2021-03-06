/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/skrks              ->  index
 * POST    /api/skrks              ->  create
 * GET     /api/skrks/:id          ->  show
 * PUT     /api/skrks/:id          ->  upsert
 * PATCH   /api/skrks/:id          ->  patch
 * DELETE  /api/skrks/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Skrk from './skrk.model';





function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Skrks
export function index(req, res) {
  return Skrk.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


//find SKRK by MongoDB Query
export function findQuery(req, res) {
  var queryString = "{Kegiatan:'"+ req.query.kegiatan + "'}";
 // console.log('sampai sini', queryString);
  return Skrk.find({Kegiatan:req.query.kegiatan}).select('skrk.'+req.query.skrk).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//find SKRK by MongoDB Query
export function findDistinct(req, res) {
  //console.log('sampai sini', req.query);
  var queryString = "{skrk."+ req.query + " ";
  return Skrk.find().distinct('Kegiatan').exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Skrk from the DB
export function show(req, res) {
  return Skrk.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Skrk in the DB
export function create(req, res) {
  return Skrk.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Skrk in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Skrk.findOneAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Skrk in the DB
export function patch(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Skrk.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Skrk from the DB
export function destroy(req, res) {
  return Skrk.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
