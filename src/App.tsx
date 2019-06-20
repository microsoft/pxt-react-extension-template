
import * as React from 'react';
import { Container, Segment, Button } from "semantic-ui-react";
import { pxt, PXTClient } from '../lib/pxtextensions';
import { Footer } from './components/footer';
import { Body } from './components/body';
import { Header } from './components/header';
import * as util from "./lib/util";
import * as images from "./lib/images";

export interface AppProps {
    client: PXTClient;
    target: string;
    hosted: boolean;
}

export interface AppState {
    shown?: boolean;

    code?: string;
    json?: string;
    jres?: string;
    asm?: string;
}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        this.state = {
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.props.client.on('read', this.deserialize);
        this.props.client.on('hidden', () => {
            this.serialize();
            this.setState({ shown: false });
        });
        this.props.client.on('shown', () => this.setState({ shown: true }));
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (!resp) return;
        const code = resp.code || " ";
        const json = resp.json !== undefined && util.JSONtryParse(resp.json);
        const jres = resp.jres !== undefined && util.JSONtryParse(resp.jres);
        const asm = resp.asm;
        console.debug('reading ', code, json, jres, asm);
        this.setState({ code, json, jres, asm });
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
        this.setState({ code, json, jres, asm });
    }

    private handleSave() {
        this.serialize();
    }

    render() {
        const { hosted } = this.props;

        return (
            <div className="App">
                <Container>
                    <Header />
                    <Body {...this.state} />
                    {hosted ? <Segment>
                        <Button onClick={this.handleSave}>Save</Button>
                    </Segment> : undefined}
                    <Footer />
                </Container>
            </div>
        );
    }
}