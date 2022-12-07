import { CustomEventEmitter } from "./core/customEventEmitter";
import { Download } from "./core/download";
import { Transfer as Transfer102019, GetTransferPreviewOutput } from '@smash-sdk/transfer/10-2019';
import { Link } from '@smash-sdk/link/10-2019';
import { Transfer as Transfer072022 } from '@smash-sdk/transfer/07-2022';
import { DownloaderEvent } from "./globals/constant";
import { getRegionFromId, Region } from "@smash-sdk/core";
import { DownloaderError } from "./errors/DownloaderError";
import { InvalidParameterError } from "./errors/InvalidParameterError";
import { fstat } from "fs";
import path from "path";

export interface DownloaderParameters {
    token: string;
    path?: string;
    url?: string;
    transferId?: string;
    fileId?: string;
    stream?: NodeJS.WritableStream;
    enableOverride?: boolean;
}

type TransferPropertiesOutput = GetTransferPreviewOutput['transfer'];

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
    availabilityEndDate: string;
    region: Region;
    availabilityDuration: number;
    filesNumber: number;
    created: string;
    availabilityStartDate: string;
    transferUrl: string,
}

interface DownloadMetatadata extends TransferPropertiesOutput {
    transferId: string,
    fileId?: string,
    extension?: string,
    downloadUrl: string,
    fileName?: string,
    name?: string,
};

export class SmashDownloader extends CustomEventEmitter {
    private config: DownloaderParameters;

    constructor(config: DownloaderParameters) {
        super();
        this.config = { ...defaultConfig, ...config };
        if (!this.config.path && !this.config.stream) {
            throw new InvalidParameterError("You must specify path or stream");
        }
        if (this.config.stream && this.config.enableOverride === true) {
            throw new InvalidParameterError("You cannot specify enableOverride as true when passing stream parameter, this make no sense");
        }
        if (config.url && config.transferId) {
            throw new InvalidParameterError("You must specify url or transferId");
        }
        if (config.url && config.fileId) {
            throw new InvalidParameterError("You cannot specify fileId with url, feature is not supported");
        }
    }

    public download(): Promise<DownloaderOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                const meta = await this.getDownloadMetadata(this.config);
                const downloadInstance = new Download({ downloadUrl: meta.downloadUrl, ...this.config });
                downloadInstance.on(DownloaderEvent.Progress, (event) => {
                    this.emit(DownloaderEvent.Progress, event);
                });
                await downloadInstance.download();
                const fileName = meta.fileName ? meta.fileName : downloadInstance.fileName;
                const extension = meta.extension ? meta.extension : path.extname(fileName as string);
                resolve({
                    transferId: meta.transferId,
                    name: meta.name,
                    fileId: meta.fileId,
                    availabilityEndDate: meta.availabilityEndDate,
                    region: meta.region as Region,
                    availabilityDuration: meta.availabilityDuration,
                    filesNumber: meta.filesNumber,
                    created: meta.created,
                    availabilityStartDate: meta.availabilityStartDate,
                    transferUrl: meta.transferUrl,
                    size: downloadInstance.size,
                    path: this.config.path,
                    fileName,
                    extension,
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    private getDownloadMetadata(config: DownloaderParameters): Promise<DownloadMetatadata> {
        return new Promise(async (resolve, reject) => {
            try {
                if (config.url) {
                    const linkSDK = new Link({ token: this.config.token });
                    const url = new URL(config.url);
                    const { target } = await linkSDK.getTarget({ targetId: url.host + url.pathname });
                    config.transferId = target.target;
                }
                const { transferId, fileId }: { transferId: string, fileId?: string } = config as { transferId: string, fileId?: string };
                const region = getRegionFromId(config.transferId as string);
                if (region) {
                    const transferSDK = new Transfer102019({ region, token: this.config.token });
                    const { transfer } = await transferSDK.getTransferPreview({ transferId });
                    if (fileId) {
                        const transferSDK = new Transfer072022({ region, token: this.config.token });
                        const { file } = await transferSDK.getTransferFilePreview({ transferId, fileId });
                        resolve({ ...transfer, downloadUrl: file.download, transferId, fileId, extension: file.ext, fileName: file.name });
                    } else {
                        resolve({ ...transfer, downloadUrl: transfer.download, transferId, fileId, name: transfer.title });
                    }
                } else {
                    throw new InvalidParameterError("Invalid transferId given: " + transferId);
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}