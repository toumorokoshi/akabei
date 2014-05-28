function PhantomPuppet(config) {

    // a dictionary holding all phantomjs instances
    // the key is the port, with the value being a phantom object
    this.phantomInstances = {};
}

// spawn a phantomjs instance
PhantomPuppet.prototype.spawnPhantom = function () {
};

module.exports = PhantomPuppet;
