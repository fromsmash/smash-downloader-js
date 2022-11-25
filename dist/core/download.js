"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Download = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const stream_2 = require("stream");
const customEventEmitter_1 = require("../core/customEventEmitter");
const constant_1 = require("../globals/constant");
__exportStar(require("../globals/constant"), exports);
const _10_2019_1 = require("@smash-sdk/transfer/10-2019");
const path_1 = __importDefault(require("path"));
class Download extends customEventEmitter_1.CustomEventEmitter {
    constructor(config) {
        super();
        this.size = 0;
        this.downloadedSize = 0;
        this.config = config;
    }
    download() {
        return new Promise(async (resolve, reject) => {
            try {
                const streams = await Promise.all([this.createReadStream(), this.createTransformStream(), this.createWriteStream()]);
                await (0, stream_2.pipeline)(...streams, error => {
                    if (error) {
                        throw error;
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    createReadStream() {
        return new Promise(async (resolve, reject) => {
            try {
                const transferSdk = new _10_2019_1.Transfer({});
                const { stream, size, fileName } = await transferSdk.download({ url: this.config.url });
                this.size = size;
                this.fileName = fileName;
                resolve(stream);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    createTransformStream() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = new stream_1.Transform({
                    transform: (chunk, encoding, callback) => {
                        this.downloadedSize += chunk.byteLength;
                        this.emit(constant_1.DownloaderEvent.Progress, {
                            name: constant_1.DownloaderEvent.Progress,
                            data: {
                                size: this.size,
                                downloadedSize: this.downloadedSize,
                            },
                        });
                        callback(null, chunk);
                    }
                });
                resolve(stream);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    createWriteStream() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.config.stream) {
                    resolve(this.config.stream);
                }
                else {
                    fs_extra_1.default.ensureDirSync(path_1.default.dirname(this.config.path));
                    const stream = fs_extra_1.default.createWriteStream(this.config.path, { flags: this.config.enableOverride ? 'w' : 'wx' });
                    resolve(stream);
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.Download = Download;
//# sourceMappingURL=download.js.map