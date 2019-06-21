
/**
 * A React component 
 * to render MakeCode block snippets
 */
import * as React from "react";

// update url with target editor
export let makecodeUrl: string = "https://makecode.microbit.org/";
// force language if needed
export let lang: string = undefined;

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
    error?: string;
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
    f.src = `${makecodeUrl}--docs?render=1${lang ? `&lang=${lang}` : ''}`;
    document.body.appendChild(f);

    return f;
}

export interface SnippetProps {
    // MakeCode TypeScript code to render
    code?: string;
    packageId?: string;
    package?: string;
    snippetMode?: boolean;
}

export interface SnippetState {
    rendering?: boolean;

    uri?: string;
    width?: number;
    height?: number;
    error?: string;
}

export class Snippet extends React.Component<SnippetProps, SnippetState> {
    private debouncedRenderProps: (...args: any[]) => any;

    constructor(props: SnippetProps) {
        super(props);
        this.state = {

        };
        this.renderProps = this.renderProps.bind(this);
        this.debouncedRenderProps = Snippet.debounce(this.renderProps, 500);
    }

    private static debounce(func: (...args: any[]) => any, wait: number): (...args: any[]) => any {
        let timeout: any;
        return function (this: any) {
            let context = this
            let args = arguments;
            let later = function () {
                timeout = null;
            };
            let callNow = !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    componentDidMount() {
        startRenderer();
        this.debouncedRenderProps();
    }

    componentWillReceiveProps(nextProps: SnippetProps) {
        if (this.props.code != nextProps.code ||
            this.props.packageId != this.props.packageId ||
            this.props.package != this.props.package ||
            this.props.snippetMode != this.props.snippetMode) {
            this.debouncedRenderProps();
        }
    }

    private renderProps() {
        // clear state and render again
        const { code, packageId, package: _package, snippetMode } = this.props;
        this.setState({ uri: undefined, width: undefined, height: undefined, error: undefined, rendering: false });
        if (code) {
            this.setState({ rendering: true })
            renderBlocks(
                {
                    type: "renderblocks",
                    id: "",
                    code,
                    options: {
                        packageId,
                        package: _package,
                        snippetMode
                    }
                },
                (resp) => {
                    this.setState({
                        uri: resp.uri,
                        width: resp.width,
                        height: resp.height,
                        error: resp.error,
                        rendering: false
                    });
                }
            )
        }
    }

    render(): JSX.Element {
        const { code } = this.props;
        const { uri, width, height, rendering, error } = this.state;

        if (!ready)
            return <div>starting renderer...</div>
        else if (rendering)
            return <div>rendering...</div>;
        else if (!uri)
            return <div>unable to render code ({error})</div>;
        else
            return <img alt={code} src={uri} width={width} height={height} />
    }
}
