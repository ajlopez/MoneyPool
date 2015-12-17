
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;

function Repository(db, name) {
    function getCollection(callback) {
        db.collection(name, function (err, collection) {
            if (err)
                callback(err);
            else
                callback(null, collection);
        });
    }
    
    this.findAll = function (callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else {
                collection.find().toArray(function (err, collection) {
                    if (err)
                        callback(err);
                    else
                        callback(null, collection);
                });
            }
        });
    };
    
    this.find = function (query, projection, callback) {
        if (!callback) {
            callback = projection;
            projection = null;
        }

        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.find(query).toArray(callback);
        });
    };

    this.insert = function (item, callback) {
        try {
            getCollection(function (err, collection) {
                if (err)
                    callback(err);
                else
                    collection.insert(item, {}, callback);
            });            
        }
        catch (err) {
            callback(err, null);
        }
    };
    
    this.update = function (id, item, callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.update({ _id: ObjectID.createFromHexString(id) },  { $set: item }, callback);
        });
    };
    
    this.remove = function (id, callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.remove({ _id: ObjectID.createFromHexString(id) }, callback);
        });
    };
    
    this.findById = function (id, callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.findOne({ _id: ObjectID.createFromHexString(id) }, callback);
        });
    };

    this.clear = function (callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.remove(callback);
        });
    };
};

module.exports = {
    createRepository: function (db, name) { return new Repository(db, name); },
    openDatabase: function (dbname, host, port, cb) {
        if (!cb)
            cb = function () { };
        var db = new mongodb.Db(dbname, new mongodb.Server(host, port, {auto_reconnect: true}, {}), { safe: true  });
        db.open(cb);
        return db;
    }
};

