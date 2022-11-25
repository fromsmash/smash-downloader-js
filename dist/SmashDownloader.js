"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmashDownloader = void 0;
const customEventEmitter_1 = require("./core/customEventEmitter");
const download_1 = require("./core/download");
const _10_2019_1 = require("@smash-sdk/transfer/10-2019");
const _07_2022_1 = require("@smash-sdk/transfer/07-2022");
const constant_1 = require("./globals/constant");
const core_1 = require("@smash-sdk/core");
const defaultConfig = {
    enableOverride: false,
};
class SmashDownloader extends customEventEmitter_1.CustomEventEmitter {
    constructor(config) {
        super();
        this.config = { ...defaultConfig, ...config };
        if (!this.config.path && !this.config.stream) {
            throw new Error("You must specify path or stream ");
        }
        if (this.config.stream && this.config.enableOverride === true) {
            throw new Error("You cannot specify enableOverride as true when passing stream parameter, this make no sense");
        }
    }
    download() {
        return new Promise(async (resolve, reject) => {
            try {
                const { url, transferId, fileId, extension, fileName, name } = await this.getDownloadMetadata(this.config.transferId, this.config.fileId);
                const downloadInstance = new download_1.Download({ url, ...this.config });
                downloadInstance.on(constant_1.DownloaderEvent.Progress, (event) => {
                    this.emit(constant_1.DownloaderEvent.Progress, event);
                });
                await downloadInstance.download();
                resolve({
                    transferId,
                    fileId,
                    extension,
                    size: downloadInstance.size,
                    path: this.config.path,
                    fileName: fileName ? fileName : downloadInstance.fileName,
                    name,
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    getDownloadMetadata(transferId, fileId) {
        return new Promise(async (resolve, reject) => {
            try {
                const region = (0, core_1.getRegionFromId)(transferId);
                if (fileId) {
                    const transferSDK = new _07_2022_1.Transfer({ region, token: this.config.token });
                    const { file } = await transferSDK.getTransferFilePreview({ transferId, fileId });
                    resolve({ url: file.download, transferId, fileId, extension: file.ext, fileName: file.name });
                }
                else {
                    const transferSDK = new _10_2019_1.Transfer({ region, token: this.config.token });
                    const { transfer } = await transferSDK.getTransferPreview({ transferId });
                    resolve({ url: transfer.download, transferId, fileId, extension: ".zip", name: transfer.title });
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.SmashDownloader = SmashDownloader;
//# sourceMappingURL=SmashDownloader.js.map