import * as React from "react";
import { Form, FormField, Label, TextArea, TextAreaProps } from "semantic-ui-react";
import { PXTComponentProps } from "../PXTExtension";
import { IApp } from "../App";

export interface BodyProps extends PXTComponentProps {
    parent: IApp;
}

export class Body extends React.Component<BodyProps> {

    constructor(props: BodyProps) {
        super(props);

        this.handleCodeChange = this.handleCodeChange.bind(this);
    }

    handleCodeChange(e: any, data: TextAreaProps) {
        const value = data.value.toString();
        this.props.parent.setUserFiles({ code: value })
    }

    render(): JSX.Element {
        const { code, json, jres, asm } = this.props;
        // TODO update display
        return <Form>
            <FormField>
                <Label>code</Label>
                <TextArea value={code} onChange={this.handleCodeChange} />
            </FormField>
        </Form>
    }
}
