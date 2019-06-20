
import * as React from 'react';
import { App } from './App';

import { pxt, PXTClient } from "../lib/pxtextensions";

export interface AppState {
    target?: string;
    isSupported?: boolean;
    hosted?: boolean;
}

declare let window: any;

export class PXTExtension extends React.Component<{}, AppState> {

    private client: PXTClient;

    private static DEFAULT_TARGET = 'microbit';

    constructor(props: {}) {
        super(props);

        this.state = {
            target: this.getDefaultTarget(),
            isSupported: this.isSupported(),
        }

        this.client = new PXTClient();
        this.client.on('init', () => this.setState({ hosted: true }));
        pxt.extensions.setup(this.client);
        pxt.extensions.init();
    }

    private isSupported() {
        // Check for whether or not the extension is supported on this browser, return true if always supported
        return true;
    }

    private getDefaultTarget() {
        if (!pxt.extensions.inIframe()) {
            const url = new URL(window.location.href);
            let chosen = url.searchParams.get("target");
            if (chosen) return chosen.toLowerCase();
            return PXTExtension.DEFAULT_TARGET
        }
        return undefined;
    }

    componentDidMount() {
        this.client.on('loaded', (target: string) => {
            this.setState({ target });
            pxt.extensions.read(this.client);
        })

        this.client.on('shown', (target: string) => {
            this.setState({ target });
            pxt.extensions.read(this.client);
        })

        if (!pxt.extensions.inIframe()) {
            this.client.emit('loaded', this.getDefaultTarget());
            this.client.emit('shown', undefined);
        }
    }

    render() {
        const { target, isSupported, hosted } = this.state;

        return (
            <div className={`PXTExtension ${!target ? 'dimmable dimmed' : ''}`}>
                {!isSupported ? <div>
                    This extension is not supported in your browser
                </div> : <App client={this.client} target={target} hosted={hosted} />}
            </div>
        );
    }
}