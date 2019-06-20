import * as React from "react";
import { Message } from "semantic-ui-react";

export interface HeaderProps {
    dirty?: boolean;
}

export class Header extends React.Component<HeaderProps> {
    render(): JSX.Element {
        const { dirty } = this.props;
        return <Message>
            <Message.Header>
                TODO: Extension title
                {dirty ? <span>*</span> : undefined}
            </Message.Header>
            <p>TODO: Explain what needs to happen</p>
        </Message>;
    }
}
