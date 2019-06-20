
import * as React from 'react';
import * as QRCode from 'qrcode';

import { Form, Container, Message, Segment, Input, InputOnChangeData } from "semantic-ui-react";

import { pxt, PXTClient } from '../lib/pxtextensions';

import * as util from "./lib/util";
import * as images from "./lib/images";
import { CodePreview } from './components/codepreview';

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        this.state = {
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp) {
            const code = resp.code;
            const json = resp.json !== undefined && JSON.parse(resp.json);
            const jres = resp.jres !== undefined && JSON.parse(resp.jres);
            const asm = resp.asm !== undefined && JSON.parse(resp.asm);
            console.debug('reading ', code, json, jres, asm);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project 
        // [extension_name].ts/json/jres/asm 
        const { target } = this.props;

        // TODO: check that target is supported

        const code = "TODO";
        const json: string = undefined;
        const jres: string = undefined;
        const asm: string = undefined;
        pxt.extensions.write(code, json, jres, asm);
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