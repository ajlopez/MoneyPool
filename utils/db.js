'use strict';

var ostore = require('ostore');
var mongorepo = require('mongorepo');
var each = require('./each');

var mstores = { };
var dbstores = { };

var db;

var usedb = false;

function DbStore(impl) {

    function normalize(item) {
        if (item == null)
            return item;
            
        if (Array.isArray(item))
            item.forEach(function (it) { normalize(it); });
        else if (item._id) {
            item.id = item._id;
            delete item._id;
        }
        
        return item;
    }

    this.get = function (id, cb) {
        if (!mongorepo.isId(id))
            return cb(null, null);
            
        try {
            impl.find(id, function (err, item) {
                cb(err, normalize(item));
            });
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    this.find = function (query, projection, cb) {
        try {
            if (!projection && !cb)
                impl.find(makeTransform(query));
            else if (!cb)
                impl.find(query, makeTransform(projection));
            else
                impl.find(query, projection, makeTransform(cb));
        }
        catch (err) {
            if (!projection && !cb)
                cb = query;
            else if (!cb)
                cb = projection;
                
            cb(err, null);
        }
    };

    this.add = function (data, cb) {
        try {
            impl.insert(data, cb);
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    this.put = function (id, data, cb) {
        try {
            impl.update(id, data, cb);
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    this.remove = function (query, cb) {
        try {
            impl.remove(query, cb);
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    this.update = function (query, data, cb) {
        try {
            impl.update(query, data, cb);
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    this.clear = function (cb) {
        try {
            impl.clear(cb);
        }
        catch (err) {
            cb(err, null);
        }
    };
    
    function makeTransform(cb) {
        return function (err, items) {
            cb(err, normalize(items));
        }
    }
}


function MemoryStore(impl) {
    this.get = function (id, cb) { 
        setImmediate(function () {
            cb(null, impl.get(id)); 
        });
    };
    
    this.find = function (query, projection, cb) {
        if (!cb) {
            if (projection) {
                cb = projection;
                projection = null;
            }
            else {
                cb = query;
                query = null;
                projection = null;
            }
        }
        
        setImmediate(function() {
            cb(null, impl.find(query, projection));
        });
    };

    this.add = function (data, cb) {
        setImmediate(function () {
            cb(null, impl.add(data));
        });
    };
    
    this.put = function (id, data, cb) {
        setImmediate(function () {
            cb(null, impl.put(id, data));
        });
    };
    
    this.remove = function (id, cb) {
        setImmediate(function () {
            cb(null, impl.remove(id)); 
        });
    };
    
    this.update = function (id, data, cb) {
        setImmediate(function () { 
            cb(null, impl.update(id, data, { multi: true })); 
        });
    };
    
    this.clear = function (cb) {
        setImmediate(function () {
            cb(null, impl.clear());
        });
    };
}

function getCreateMemoryStore(name) {
    if (mstores[name])
        return mstores[name];
        
    var store = new MemoryStore(ostore.createStore());
    mstores[name] = store;

    return mstores[name];
}

function getCreateDbStore(name) {
    if (dbstores[name])
        return dbstores[name];
        
    var store = new DbStore(mongorepo.createRepository(db, name));
    dbstores[name] = store;

    return dbstores[name];
}

function getCreateStore(name) {
    if (usedb)
        return getCreateDbStore(name);
        
    return getCreateMemoryStore(name);
}

function createMemoryStore(name) {
    var store = new MemoryStore(ostore.createStore());
    mstores[name] = store;
    return store;
}

function createDbStore(name) {
    var store = new DbStore(mongorepo.createRepository(db, name));
    dbstores[name] = store;
    return store;
}

function createStore(name) {
    if (usedb)
        return createDbStore(name);
        
    return createMemoryStore(name);
}

function clearStores(stores, cb) {
    var names = Object.keys(stores);

    each(names, function (name, next) {
        var store = stores[name];
        store.clear(next);
    }, cb);
}

function clear(cb) {
    if (usedb)
        clearStores(dbstores, cb);
    else
        clearStores(mstores, cb);
}

function useDb(name, config, cb) {
    config = config || { };
    usedb = true;
    dbstores = { };
    
    mongorepo.openDatabase(name, config, function (err, data) {
        if (err)
            return cb(err, null);
            
        db = data;
      
        getCreateStore('users');
        getCreateStore('loans');
        getCreateStore('notes');
        getCreateStore('movements');
        getCreateStore('payments');
        cb(null, db);
    });
}

function closeDb(cb) {
    db.close(cb);
}

function useMemory() {
    usedb = false;
    
    if (db)
        db.close();
}

function toId(id) {
    if (usedb)
        return mongorepo.toId(id);

    if (typeof id === 'string')
        return parseInt(id);
        
    return id;    
}

function isNativeId(id) {
    if (usedb)
        return typeof id === 'object' && mongorepo.isId(id);
        
    return typeof id === 'number';
}

var lastid = 1000;
var hexadigits = "0123456789abcdef";
var lhexa = hexadigits.length;

function generateId() {
    var id = "";
    
    for (var k = 0; k < 24; k++)
        id += hexadigits[Math.floor(Math.random() * lhexa)];
        
    return mongorepo.toId(id);
}

function newId() {
    if (usedb)
        return generateId();
        
    return ++lastid;
}

module.exports = {
    store: getCreateStore,

    createStore: createStore,
    clear: clear,
    
    useDb: useDb,
    closeDb: closeDb,
    
    useMemory: useMemory,
    
    toId: toId,
    isNativeId: isNativeId,
    newId: newId
};

