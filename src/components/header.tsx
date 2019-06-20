import * as React from "react";
import { Message } from "semantic-ui-react";

export interface HeaderProps {
}

export class Header extends React.Component<HeaderProps> {
    render(): JSX.Element {
        return <Message>
            <Message.Header>TODO: Extension title</Message.Header>
            <p>TODO: Explain what needs to happen</p>
        </Message>;
    }
}
