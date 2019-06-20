/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';
import * as QRCode from 'qrcode';

import { Form, Container, Message, Segment, Input, InputOnChangeData } from "semantic-ui-react";

import { pxt, PXTClient } from '../lib/pxtextensions';
import { EmitterFactory } from "./exporter/factory";

import * as util from "./lib/util";
import * as images from "./lib/images";
import * as emit from "./lib/emit";
import { CodePreview } from './components/codepreview';

const CANVAS_WIDTH = 112;

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    target: string;
    text: string;
    code: string;
}

export class App extends React.Component<AppProps, AppState> {
    private canvasRef: HTMLCanvasElement;

    constructor(props: AppProps) {
        super(props);

        this.state = {
            target: props.target,
            text: "",
            code: ""
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);

        this.downloadProject = this.downloadProject.bind(this);
        this.handleCanvasRef = this.handleCanvasRef.bind(this);
        this.handleTextChanged = this.handleTextChanged.bind(this);
    }

    private handleCanvasRef(ref: HTMLCanvasElement) {
        this.canvasRef = ref;
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp && resp.json && resp.json.length > 0) {
            const code = resp.code;
            const json = JSON.parse(resp.json);
            console.log('reading code and json', code, json);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project [extension_name].ts and [extension_name].json
        console.log("write code and json");

        const { target } = this.state;
        const emitter = EmitterFactory.getEmitter(target);
        if (!emitter) return;

        const code = emitter.output(undefined);
        const json = {};
        pxt.extensions.write(code, JSON.stringify(json));
    }

    private downloadProject() {
        const assets: EncodedImage[] = [];
        let ts = emit.emitImages("projectImages", assets);
        util.browserDownloadText(ts, "assets.ts");
    }

    private handleTextChanged(event: any, data: InputOnChangeData) {
        this.setState({ text: data.value, code: "" });
        const w = CANVAS_WIDTH;
        QRCode.toCanvas(this.canvasRef, data.value, {
            width: w
        }, (err) => {
            const data = this.canvasRef.getContext("2d")
                .getImageData(0, 0, w, w);
            const code =
                `const qrcode = sprites.create(${images.imgEncodeImg(
                    data.width,
                    data.height,
                    (x: number, y: number) => data.data[(y * data.width + x) * 4] ? 1 : 0
                )});
`;
            this.setState({ code: code });
        })
    }

    render() {
        const { code } = this.state;
        return (
            <div className="App">
                <Container>
                    <Form>
                        <Message>
                            <Message.Header>QR Code generator for MakeCode</Message.Header>
                            <p style={{ textAlign: "left" }}>
                                Enter the URL to be encoded as a QR code
                    </p>
                        </Message>
                        <Segment>
                            <Input className="fluid" type="text" onChange={this.handleTextChanged} />
                        </Segment>
                        <Segment>
                            <canvas ref={this.handleCanvasRef} width={CANVAS_WIDTH} height={CANVAS_WIDTH}></canvas>
                        </Segment>
                        <CodePreview text={code} />
                    </Form>
                </Container>
            </div>
        );
    }
}