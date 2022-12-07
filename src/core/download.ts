import fs from "fs-extra";
import { Transform } from 'stream';
import { pipeline } from 'stream';
import { CustomEventEmitter } from "../core/customEventEmitter";
import { DownloaderEvent } from "../globals/constant";
export * from "../globals/constant";
import { Transfer } from '@smash-sdk/transfer/10-2019';
import { DownloaderParameters } from "../SmashDownloader";
import path from "path";

export class Download extends CustomEventEmitter {
    public fileName?: string;
    public size = 0;
    public downloadedSize = 0;
    private config: DownloaderParameters & { downloadUrl: string };

    constructor(config: DownloaderParameters & { downloadUrl: string }) {
        super();
        this.config = config;
    }

    public download(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const streams = await Promise.all([this.createReadStream(), this.createTransformStream(), this.createWriteStream()]);
                await pipeline(...streams, error => {
                    if (error) {
                        throw error;
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    private createReadStream(): Promise<NodeJS.ReadableStream> {
        return new Promise(async (resolve, reject) => {
            try {
                const transferSdk = new Transfer({});
                const { stream, size, fileName } = await transferSdk.download({ url: this.config.downloadUrl });
                this.size = size;
                this.fileName = fileName;
                resolve(stream);
            } catch (error) {
                reject(error);
            }
        });
    }

    private createTransformStream(): Promise<Transform> {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = new Transform({
                    transform: (chunk, encoding, callback) => {
                        this.downloadedSize += chunk.byteLength;
                        this.emit(DownloaderEvent.Progress, {
                            name: DownloaderEvent.Progress,
                            data: {
                                size: this.size,
                                downloadedSize: this.downloadedSize,
                            },
                        });
                        callback(null, chunk);
                    }
                });
                resolve(stream);
            } catch (error) {
                reject(error);
            }
        });
    }

    private createWriteStream(): Promise<NodeJS.WritableStream> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.config.stream) {
                    resolve(this.config.stream);
                } else {
                    fs.ensureDirSync(path.dirname(this.config.path as string));
                    const stream = fs.createWriteStream(this.config.path as string, { flags: this.config.enableOverride ? 'w' : 'wx' });
                    resolve(stream);
                }
            } catch (error) {
                reject(error);
            }
        })

    }
}
