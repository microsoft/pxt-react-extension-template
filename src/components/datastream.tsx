import * as React from "react";
import { Form, Segment, Button, FormField, Message } from "semantic-ui-react";
import { pxt, PXTClient } from "../../lib/pxtextensions";

export interface DataStreamProps {
    client: PXTClient;
    hosted: boolean;
}

export interface DataStreamState {
    streaming?: boolean;
}

export class DataStream extends React.Component<DataStreamProps, DataStreamState> {

    constructor(props: DataStreamProps) {
        super(props);

        this.state = {

        };
        this.handleStart = this.handleStart.bind(this);
        this.props.client.on("datastream", streaming => this.setState({ streaming }));
    }

    private handleStart() {
        pxt.extensions.dataStream(true);
    }

    render(): JSX.Element {
        const { hosted } = this.props;
        const { streaming } = this.state;
        return <Form>
            <FormField>
                Console data
            </FormField>
            <Segment>
                <Button disabled={!hosted} onClick={this.handleStart}>
                    {streaming ? "Stop" : "Start"}
                </Button>
                {!hosted ? <Message info>
                    <Message.Header>Data streaming not available.</Message.Header>
                    This page needs to be opened from the MakeCode editor in order to get data streaming.
                </Message> : undefined}
            </Segment>
        </Form>;
    }
}
