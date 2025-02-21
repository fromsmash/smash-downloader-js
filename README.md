<p align="center">
  <a href="https://fromsmash.com/"><img src="https://developer.fromsmash.com/LOGO_SMASH_API.png" align="center" width="135" alt="Send big files"/></a>
  <h1 align="center">SmashDownloaderJS - Download library <br>powered by the Smash API & SDK</h1> 
</p>
<p align="center">
  <strong>Official JavaScript library to download files uploaded using the Smash API & SDK 🚀</strong>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/@smash-sdk/downloader"><img src="https://img.shields.io/npm/v/@smash-sdk/downloader.svg" /></a>
  <br/>
</p>
<hr/>

SmashDownloaderJS is a <b>simple and easy-to-use</b> JavaScript library for downloading files uploaded via the [Smash API & SDK](https://api.fromsmash.com/). With SmashDownloaderJS, you can integrate Smash’s file <b>download functionality directly into your workflows</b>.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Importing the library](#importing-the-library)
  - [Creating an instance](#creating-an-instance)
  - [Simple usage example](#simple-usage-example)
  - [Stream usage example](#stream-usage-example)
- [Events](#events)
  - [`progress` event](#progress-event)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

You can install SmashDownloaderJS using npm:

```
npm install @smash-sdk/downloader
```

## Usage
### Importing the library

```
// Using ES6 module
import { SmashDownloader } from '@smash-sdk/downloader';

// Or using CommonJS module
const { SmashDownloader } = require('@smash-sdk/downloader');
```
### Creating an instance

```
const downloader = new SmashDownloader({
    token: "Your Smash API key here",
    url: 'https://fromsmash.com/transfer-id-example',
    path: "./my_directory/dummy.zip",
});
```

The available parameters are:

- `token` (required): The access token used to authenticate with the Smash API.
- `path` (optional): The output directory for the downloaded file. Defaults to the current working directory.
- `url` (optional): The URL of the Smash file you want to download. Should be in the format `https://fromsmash.com/{transferId}`.
- `transferId` (optional): The ID of the Smash transfer containing the file you want to download.
- `fileId` (optional): The ID of the Smash file you want to download.
- `stream` (optional): A writable stream to pipe the file to instead of saving it to disk.
- `enableOverride` (optional): A boolean indicating whether to overwrite an existing file with the same name. Defaults to `false`.
- `password` (optional): The password for the Smash transfer, if it is password-protected.


### Simple usage example

```
import { SmashDownloader } from '@smash-sdk/downloader';
import fs from 'fs';

const downloader = new SmashDownloader({
  token: 'my-access-token',
  url: 'https://fromsmash.com/transfer-id-example',
  // or transferId: 'transfer-id-example' (if you don't want to use the URL)
});

downloader.download().then((output) => {
  fs.writeFileSync(output.path, output.buffer);
  console.log(`Downloaded ${output.size} bytes to ${output.path}`);
});
```

### Stream usage example

```
import { SmashDownloader } from '@smash-sdk/downloader';
import fs from 'fs';

const downloader = new SmashDownloader({
  token: 'my-access-token',
  url: 'https://fromsmash.com/transfer-id-example',
});

const writeStream = fs.createWriteStream('downloaded-file.txt');

downloader.download().then((output) => {
  const readStream = fs.createReadStream(output.path);
  readStream.pipe(writeStream);
  console.log(`Downloaded ${output.size} bytes to stream`);
});
```

`download(): Promise<DownloaderOutput>`

Downloads the file from the Smash transfer and returns a Promise that resolves to an object with the following properties:

- `transferId`: The ID of the Smash transfer containing the downloaded file.
- `name` (optional): The name of the downloaded file.
- `fileId` (optional): The ID of the downloaded file.
- `fileName` (optional): The name of the downloaded file, including its extension.
- `extension` (optional): The extension of the downloaded file.
- `path` (optional): The absolute path of the downloaded file.
- `size`: The size of the downloaded file, in bytes.
- `availabilityEndDate`: The date when the Smash transfer will expire.
- `region`: The region where the Smash transfer was created.
- `availabilityDuration`: The duration of the Smash transfer, in seconds.
- `filesNumber`: The number of files contained in the Smash transfer.
- `created`: The date when the Smash transfer was created.
- `availabilityStartDate`: The date when the Smash transfer became available.
- `transferUrl`: The URL of the Smash transfer.

## Events

### `progress` event

```
import { SmashDownloader } from '@smash-sdk/downloader';

const downloader = new SmashDownloader({
  token: 'my-access-token',
  url: 'https://fromsmash.com/example',
});

downloader.on('progress', (event) => {
  console.log(`Downloaded ${event.data.downloadedSize} of ${event.data.size} bytes`);
});

downloader.download().then((output) => {
  console.log(`Downloaded ${output.size} bytes to ${output.path}`);
}).catch((err) => {
  console.error(`Error downloading file: ${err.message}`);
});
```

The `progress` event is emitted while the file is being downloaded, and provides information about the progress of the download. The event object has the following properties:

- `name`: The name of the event (`progress`).
- `data`: An object containing information about the download progress. The available properties are:
  - `size`: The total size of the file being downloaded, in bytes.
  - `downloadedSize`: The number of bytes that have been downloaded so far.

## API Reference

Please refer to the [API documentation](https://api.fromsmash.com/docs/integrations/node-js) for more information on the available methods and options.

## Examples

You can find example usage and integration of SmashDownloaderJS in the [examples](https://github.com/fromsmash/example-js) folder.

## Contributing

Contibutions are welcome! If you'd like to help improving the SmashDownloaderJS, please fork the repository, make your changes, and submit a pull request.

## License

SmashDownloaderJS is released under the MIT License.