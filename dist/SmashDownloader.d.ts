/// <reference types="node" />
import { CustomEventEmitter } from "./core/customEventEmitter";
export interface DownloaderParameters {
    token: string;
    path?: string;
    transferId: string;
    fileId?: string;
    stream?: NodeJS.WritableStream;
    enableOverride?: boolean;
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
export declare class SmashDownloader extends CustomEventEmitter {
    private config;
    constructor(config: DownloaderParameters);
    download(): Promise<DownloaderOutput>;
    private getDownloadMetadata;
}
