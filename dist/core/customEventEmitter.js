"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEventEmitter = void 0;
const isFunction_1 = require("../helpers/isFunction");
class CustomEventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, callback) {
        if ((0, isFunction_1.isFunction)(callback) === false) {
            throw new Error('Second argument of on() should be a function');
        }
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return this;
    }
    off(event) {
        if (event) {
            this.listeners[event] = [];
        }
        else {
            this.listeners = {};
        }
        return this;
    }
    emit(event, data) {
        if (Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event].forEach(listener => {
                listener.call(this, data);
            });
        }
        return this;
    }
    dispatch(event) {
        return this.emit(event.name, event);
    }
}
exports.CustomEventEmitter = CustomEventEmitter;
//# sourceMappingURL=customEventEmitter.js.map