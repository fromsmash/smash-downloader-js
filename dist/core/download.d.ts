import { CustomEventEmitter } from "../core/customEventEmitter";
export * from "../globals/constant";
import { DownloaderParameters } from "../SmashDownloader";
export declare class Download extends CustomEventEmitter {
    fileName?: string;
    size: number;
    downloadedSize: number;
    private config;
    constructor(config: DownloaderParameters & {
        url: string;
    });
    download(): Promise<void>;
    private createReadStream;
    private createTransformStream;
    private createWriteStream;
}
