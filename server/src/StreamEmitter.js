const EventEmitter = require('events');

// StreamEmitter class for handling streaming
class StreamEmitter extends EventEmitter {
    constructor() {
        super();
    }

    async emitJob(job) {
        this.emit('job', job);
    }
}

module.exports = StreamEmitter;