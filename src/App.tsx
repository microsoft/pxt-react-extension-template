/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';
import * as QRCode from 'qrcode';

import { Form, Container, Message, Segment, Input, InputOnChangeData } from "semantic-ui-react";

import { pxt, PXTClient } from '../lib/pxtextensions';
import { EmitterFactory } from "./exporter/factory";

import * as util from "./lib/util";
import * as images from "./lib/images";
import { CodePreview } from './components/codepreview';

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    target: string;
}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        this.state = {
            target: props.target
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp && resp.json && resp.json.length > 0) {
            const code = resp.code;
            const json = JSON.parse(resp.json);
            console.log('reading code and json', code, json);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project [extension_name].ts 
        // and [extension_name].json
        const { target } = this.state;
        const emitter = EmitterFactory.getEmitter(target);
        if (!emitter) return;

        const code = emitter.output(undefined);
        const json = {};
        pxt.extensions.write(code, JSON.stringify(json));
    }

    render() {
        return (
            <div className="App">
                <Container>
                    <Form>
                        <Message>
                            <Message.Header>Extension title</Message.Header>
                            <p>Explain what needs to happen</p>
                        </Message>
                    </Form>
                </Container>
            </div>
        );
    }
}