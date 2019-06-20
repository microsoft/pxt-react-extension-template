import * as React from "react";

import { Segment, Button } from "semantic-ui-react";
export interface CodePreviewProps {
    text: string;
}

export class CodePreview extends React.Component<CodePreviewProps> {
    input: HTMLTextAreaElement;

    handleTextRef = (i: HTMLTextAreaElement) => this.input = i;

    handleCopy = () => {
        if (!this.input) return;

        this.input.focus();
        this.input.setSelectionRange(0, -1);

        try {
            const success = document.execCommand("copy");
        } catch (e) {
        }
    };

    render() {
        return <Segment className="code-preview">
            <textarea className="code-content" ref={this.handleTextRef} contentEditable={false} value={this.props.text || ""} readOnly={true}></textarea>
            <Button className="code-copy" onClick={this.handleCopy}>Copy</Button>
        </Segment>
    }
}