const Cache = function(){

    this.items = [];

};


Cache.prototype.put = function(key, value, timeout = null) {

    if (value !== undefined && value !== null) {
        const item = {
            key: key,
            value: value,
            expiredWhen: timeout ? Date.now() + timeout : null
        };
        this.items[key] = item;
    }

};

Cache.prototype.get = function(key) {

    const item = this.items[key];
    if (item) {
        if (item.expiredWhen === null || Date.now() <= item.expiredWhen) {
            return item.value;
        }
    }
    return null;
};


module.exports = new Cache();
