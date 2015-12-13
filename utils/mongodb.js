
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
            else
                collection.find().toArray(function (err, items) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, normalize(items));
                });
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
                collection.find(query).toArray(function (err, items) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, normalize(items));
                });
        });
    };
    
    this.insert = function (item, callback) {
        getCollection(function (err, collection) {
            if (err)
                callback(err);
            else
                collection.insert(item, callback);
        });
    };
    
    this.update = function (id, item, callback) {
        getCollection(function (err, collection) {
            if (err) {
                callback(err, null);
                return;
            }

            try {
                collection.update({ _id: ObjectID.createFromHexString(id) }, { $set: item }, callback);
            }
            catch (err) {
                callback(err, null);
                return;
            }
        });
    };
    
    this.remove = function (id, callback) {
        getCollection(function (err, collection) {
            if (err) {
                callback(err, null);
                return;
            }
            
            try {
                collection.remove({ _id: ObjectID.createFromHexString(id) }, callback);
            }
            catch (err) {
                callback(err, null);
                return;
            }
        });
    };
    
    this.findById = function (id, callback) {
        getCollection(function (err, collection) {
            if (err) {
                callback(err, null);
                return;
            }
            
            try {
                collection.findOne({ _id: ObjectID.createFromHexString(id) }, function (err, item) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, normalize(item));
                });
            }
            catch (err) {
                callback(err, null);
                return;
            }
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

function normalize(item) {
    if (Array.isArray(item))
        item.forEach(function (it) { normalize(it); });
    else if (item._id) {
        item.id = item._id;
        delete item._id;
    }
    
    return item;
}

module.exports = {
    createRepository: function (db, name) { return new Repository(db, name); },
    openDatabase: function (dbname, host, port, username, password, cb) {
        if (typeof username == 'function') {
            cb = username;
            username = null;
            password = null;
        }
        
        if (!cb)
            cb = function () { };

        var server = new mongodb.Server(host, port, {auto_reconnect: true}, {});
        var db = new mongodb.Db(dbname, server, { safe: true  });

        db.open(function (err, db) {
            if (err) {
                cb(err, null);
                return;
            }
            
            if (username) {
                db.authenticate(username, password, {authdb: "admin"}, function (err, res) {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, db);
                });
            }
            else
                cb(null, db);
        });
        return db;
    }
};

