import * as React from "react";
import { Form } from "semantic-ui-react";
import { PXTComponentProps } from "../PXTExtension";

export interface BodyProps extends PXTComponentProps {
}

export class Body extends React.Component<BodyProps> {
    render(): JSX.Element {
        const { code, json, jres, asm } = this.props;
        // TODO update display
        return <div>
            <div>code</div>
            <pre>{code}</pre>
            <div>json</div>
            <pre>{json}</pre>
            <div>jres</div>
            <pre>{jres}</pre>
            <div>asm</div>
            <pre>{asm}</pre>
        </div>;
    }
}
