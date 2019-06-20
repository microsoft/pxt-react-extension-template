import * as React from "react";
import { Form, FormField, Label, TextArea, TextAreaProps } from "semantic-ui-react";
import { PXTComponentProps } from "../PXTExtension";
import { App } from "../App";

export interface BodyProps extends PXTComponentProps {
    parent: App;
}

export class Body extends React.Component<BodyProps> {

    constructor(props: BodyProps) {
        super(props);

        this.handleCodeChange = this.handleCodeChange.bind(this);
    }

    handleCodeChange(e: any, data: TextAreaProps) {
        const value = data.value.toString();
        this.props.parent.setState({ code: value })
    }

    render(): JSX.Element {
        const { code, json, jres, asm } = this.props;
        // TODO update display
        return <Form>
            <FormField>
                <Label>code</Label>
                <TextArea value={code} onChange={this.handleCodeChange} />
            </FormField>
            <FormField>
                <Label>json</Label>
                <TextArea value={json} />
            </FormField>
            <FormField>
                <Label>jres</Label>
                <TextArea value={jres} />
            </FormField>
            <FormField>
                <Label>asm</Label>
                <TextArea value={asm} />
            </FormField>
        </Form>
    }
}
