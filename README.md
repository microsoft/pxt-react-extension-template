# A MakeCode Extension

This template contains the boiler plate code to create
a MakeCode Extension that exposes a custom page in the editor.

## Creating the extension

Follow these steps carefully to setup your extension for MakeCode.

### Updating info in the sources

* search and replace all instance of "pxt-extension-name" with the repo name
* search and replace all instance of "githubid" with the GitHub organization of the repo

### Build

First, install Node.

To build the repo, run:

```
npm install
```

### Launch the Development Server

After this you can run
```
npm run start
```
to start the dev server.

This will be running on http://localhost:3000

You can edit your React app under ``src`` and the dev server will hot reload it in the browser. Unless you change styles, you generally don't have to reload it to see your changes during development.

When running locally in a web browser, and not in an iframe, read and write operations are stored in localStorage to make debugging easier.

Webpack will generate the bundled app js when running ``npm run start`` or ``npm run deploy``

This repo uses [semantic-ui-react](https://github.com/Semantic-Org/Semantic-UI-React) as the UI framework, but you can substitue it with any

### Deploy

To deploy your extension to Github pages, run:

```
npm run deploy
```

### Try it out

Once built, the extension will be hosted on GitHub pages.

https://githubid.github.io/pxt-extension-name


## Supported targets

Update the list of targets supported by this extension.

* for PXT/microbit
* for PXT/adafruit
* for PXT/maker
* for PXT/arcade
* for PXT/codal

(The metadata above is needed for package search, update it with the targets you support)

## License

MIT
