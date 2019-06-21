
/**
 * A React component 
 * to render MakeCode block snippets
 */
import * as React from "react";

// update url with target editor
export let makecodeUrl: string = "https://makecode.microbit.org/";
export let lang: string = "en";

interface RenderBlocksRequestMessage {
    type: "renderblocks",
    id: string;
    code: string;
    options?: {
        packageId?: string;
        package?: string;
        snippetMode?: boolean;
    }
}

interface RenderBlocksResponseMessage {
    source: "makecode",
    type: "renderblocks",
    id: string;
    uri?: string;
    css?: string;
    svg?: string;
    width?: number;
    height?: number;
}

interface RenderBlocksRequentResponse {
    req: RenderBlocksRequestMessage,
    cb: (resp: RenderBlocksResponseMessage) => void
}

let ready = false;
let nextRequest = 0;
const pendingRequests: {
    [index: string]: RenderBlocksRequentResponse
} = {};

function renderBlocks(req: RenderBlocksRequestMessage, cb: (resp: RenderBlocksResponseMessage) => void) {
    req.id = (nextRequest++) + "";
    pendingRequests[req.id] = { req, cb }
    if (ready)
        sendRequest(req);
}

function sendRequest(req: RenderBlocksRequestMessage) {
    const f = startRenderer();
    if (f)
        f.contentWindow.postMessage(req, makecodeUrl);
}

// listen for messages
function handleMessage(ev: MessageEvent) {
    let msg = ev.data;
    if (msg.source != "makecode") return;

    switch (msg.type) {
        case "renderready":
            ready = true;
            Object.keys(pendingRequests).forEach(k => sendRequest(pendingRequests[k].req));
            break;
        case "renderblocks":
            const id = msg.id; // this is the id you sent
            const r = pendingRequests[id];
            if (!r) return;

            delete pendingRequests[id];
            r.cb(msg as RenderBlocksResponseMessage);
            break;
    }
}

function startRenderer(): HTMLIFrameElement {
    if (!makecodeUrl) return undefined;

    let f = document.getElementById("makecoderenderer") as HTMLIFrameElement;
    if (f) return f;

    window.addEventListener("message", handleMessage, false);

    f = document.createElement("iframe");
    f.id = "makecoderenderer";
    f.style.position = "absolute";
    f.style.left = "0";
    f.style.bottom = "0";
    f.style.width = "1px";
    f.style.height = "1px";
    f.src = `${makecodeUrl}--docs?render=1&lang=${lang}`;
    document.body.appendChild(f);

    return f;
}

export interface SnippetProps {
    // the type of snippets, default is "blocks"
    type?: string;
    // MakeCode TypeScript code to render
    code?: string;
}

export interface SnippetState {
    rendering?: boolean;

    uri?: string;
    width?: number;
    height?: number;
}

export class Snippet extends React.Component<SnippetProps, SnippetState> {

    constructor(props: SnippetProps) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        startRenderer();
        this.renderProps(this.props);
    }

    componentWillReceiveProps(nextProps: SnippetProps) {
        if (this.props.type != nextProps.type ||
            this.props.code != nextProps.code) {
            this.renderProps(nextProps);
        }
    }

    private renderProps(nextProps: SnippetProps) {
        // clear state and render again
        this.setState({ uri: undefined, width: undefined, height: undefined, rendering: false });
        if (nextProps.code) {
            this.setState({ rendering: true })
            renderBlocks(
                {
                    type: "renderblocks",
                    id: "",
                    code: nextProps.code
                },
                (resp) => {
                    this.setState({
                        uri: resp.uri,
                        width: resp.width,
                        height: resp.height,
                        rendering: false
                    });
                }
            )
        }
    }

    render(): JSX.Element {
        const { code } = this.props;
        const { uri, width, height, rendering } = this.state;

        if (!ready)
            return <div>starting renderer...</div>
        else if (rendering)
            return <div>rendering...</div>;
        else if (!uri)
            return <div>unable to render code</div>;
        else
            return <img alt={code} src={uri} width={width} height={height} />
    }
}
