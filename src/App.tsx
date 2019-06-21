
import * as React from 'react';
import { Container, Segment, Button } from "semantic-ui-react";
import { pxt, PXTClient } from '../lib/pxtextensions';
import { Footer } from './components/footer';
import { Body } from './components/body';
import { Header } from './components/header';
import * as util from "./lib/util";
import * as images from "./lib/images";
import { PXTComponentProps } from './PXTExtension';
import { DataStream } from './components/datastream';
import { Snippet } from './components/snippet';

export interface IApp {
    setUserFiles(props: PXTComponentProps): void;
}

export interface AppProps {
    client: PXTClient;
    target: string;
    hosted: boolean;
}

export interface AppState {
    dirty?: boolean;
    shown?: boolean;

    code?: string;
    json?: string;
    jres?: string;
    asm?: string;
}

export class App extends React.Component<AppProps, AppState> implements IApp {

    constructor(props: AppProps) {
        super(props);

        this.state = {
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);
        this.handleExport = this.handleExport.bind(this);

        this.props.client.on('read', this.deserialize);
        this.props.client.on('hidden', () => {
            this.serialize();
            this.setState({ shown: false });
        });
        this.props.client.on('shown', () => this.setState({ shown: true }));
        this.props.client.on('written', () => this.setState({ dirty: false }));
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (!resp) return;
        const code = resp.code || " ";
        const json = resp.json !== undefined && util.JSONtryParse(resp.json);
        const jres = resp.jres !== undefined && util.JSONtryParse(resp.jres);
        const asm = resp.asm;
        console.debug('reading ', code, json, jres, asm);
        this.setState({ code, json, jres, asm, dirty: false });
    }

    private serialize() {
        // PXT allows us to write to files in the project 
        // [extension_name].ts/json/jres/asm 
        const { code, json, jres, asm, dirty } = this.state;
        if (!dirty) return;

        pxt.extensions.write(this.props.client, code, json, jres, asm);
        // 'written' event unset the dirty flag
    }

    private handleExport() {
        // TODO file save
    }

    setUserFiles(props: PXTComponentProps) {
        // check if state is different
        const { code, json, jres, asm } = props;
        if ((code !== undefined && code != this.state.code)
            || (json !== undefined && json != this.state.json)
            || (jres !== undefined && jres != this.state.jres)
            || (asm !== undefined && asm != this.state.asm)) {
            this.setState({ code, json, jres, asm, dirty: true });
            util.debounce(this.serialize, 2000);
        }
    }

    render() {
        const { hosted } = this.props;

        return (
            <div className="App">
                <Container>
                    <Header {...this.state} />
                    <Segment basic>
                        <Body parent={this} {...this.state} />
                    </Segment>
                    <Segment basic>
                        <DataStream {...this.props} />
                    </Segment>
                    <Segment basic>
                        <Snippet {...this.state} />
                    </Segment>
                    {!hosted ? <Segment basic>
                        <Button onClick={this.handleExport}>Export</Button>
                    </Segment> : undefined}
                    <Footer {...this.state} />
                </Container>
            </div>
        );
    }
}