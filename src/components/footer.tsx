import * as React from "react";
import {  } from "semantic-ui-react";

export interface FooterProps {
}

export class Footer extends React.Component<FooterProps> {
    render() {
        // TODO update footer for page when non-hosted in the MakeCode editor
        return <div className="ui center basic segment footer">
            <hr/>
            TODO: Update copyright / privacy notice.
        </div>
    }
}
