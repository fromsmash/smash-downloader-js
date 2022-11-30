import { CustomEventEmitter } from "./core/customEventEmitter";
import { Download } from "./core/download";
import { Transfer as Transfer102019 } from '@smash-sdk/transfer/10-2019';
import { Transfer as Transfer072022 } from '@smash-sdk/transfer/07-2022';
import { DownloaderEvent } from "./globals/constant";
import { getRegionFromId } from "@smash-sdk/core";
import { DownloaderError } from "./errors/DownloaderError";

export interface DownloaderParameters {
    token: string;
    path?: string;
    transferId: string;
    fileId?: string;
    stream?: NodeJS.WritableStream;
    enableOverride?: boolean;
}

const defaultConfig = {
    enableOverride: false,
}
export interface DownloaderOutput {
    transferId: string;
    name?: string;
    fileId?: string;
    fileName?: string;
    extension?: string;
    path?: string;
    size: number;
}

interface DownloadMetatadata {
    transferId: string,
    fileId?: string,
    extension?: string,
    url: string,
    fileName?: string,
    name?: string,
}

export class SmashDownloader extends CustomEventEmitter {
    private config: DownloaderParameters;

    constructor(config: DownloaderParameters) {
        super();
        this.config = { ...defaultConfig, ...config };
        if (!this.config.path && !this.config.stream) {
            throw new Error("You must specify path or stream ");
        }
        if (this.config.stream && this.config.enableOverride === true) {
            throw new Error("You cannot specify enableOverride as true when passing stream parameter, this make no sense");
        }
    }

    public download(): Promise<DownloaderOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                const { url, transferId, fileId, extension, fileName, name } = await this.getDownloadMetadata(this.config.transferId, this.config.fileId);
                const downloadInstance = new Download({ url, ...this.config });
                downloadInstance.on(DownloaderEvent.Progress, (event) => {
                    this.emit(DownloaderEvent.Progress, event);
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
            } catch (error) {
                reject(error);
            }
        })
    }

    private getDownloadMetadata(transferId: string, fileId?: string): Promise<DownloadMetatadata> {
        return new Promise(async (resolve, reject) => {
            try {
                const region = getRegionFromId(transferId);
                if (region) {
                    if (fileId) {
                        const transferSDK = new Transfer072022({ region, token: this.config.token });
                        const { file } = await transferSDK.getTransferFilePreview({ transferId, fileId });
                        resolve({ url: file.download, transferId, fileId, extension: file.ext, fileName: file.name });
                    } else {
                        const transferSDK = new Transfer102019({ region, token: this.config.token });
                        const { transfer } = await transferSDK.getTransferPreview({ transferId });
                        resolve({ url: transfer.download, transferId, fileId, extension: ".zip", name: transfer.title });
                    }
                } else {
                    throw new DownloaderError("Invalid transferId given: " + transferId);
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}