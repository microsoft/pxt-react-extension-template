
import * as EventEmitter from 'eventemitter3';

export namespace pxt.extensions {

    export interface ReadResponse {
        asm?: string;
        code?: string;
        json?: string;
        jres?: string;
    }

    export function inIframe() {
        try {
            return window && window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    export function setup(client: PXTClient) {
        window.addEventListener("message", (ev: any) => {
            let resp = ev.data;
            if (!resp) return;

            if (resp.type === "pxtpkgext")
                handleMessage(client, resp);
        }, false);
    }

    function handleMessage(client: PXTClient, msg: any) {
        if (!msg.id) {
            const target = msg.target;
            switch (msg.event) {
                case "extinit":
                    // Loaded, set the target
                    client.emit('init', msg.target);
                    break;
                case "extloaded":
                    // Loaded, set the target
                    client.emit('loaded', target);
                    break;
                case "extshown":
                    client.emit('shown', target);
                    break;
                case "exthidden":
                    client.emit('hidden', target);
                    break;
                case "extdatastream":
                    client.emit('datastream', true);
                    break;
                default:
                    console.debug("Unhandled event", msg);
            }
            console.debug("received event: ", msg);
            return;
        }
        const action = idToType[msg.id];
        console.debug("received action: " + action, msg);

        switch (action) {
            case "extinit":
                // Loaded, set the target
                client.emit('init', msg.resp);
                break;
            case "extusercode":
                // Loaded, set the target
                client.emit('readuser', msg.resp);
                break;
            case "extreadcode":
                // Loaded, set the target
                client.emit('read', msg.resp);
                break;
            case "extwritecode":
                // Loaded, set the target
                client.emit('written', msg.resp);
                break;
        }
    }

    export function init() {
        console.debug("initializing");
        if (!inIframe()) return;

        const msg = mkRequest('extinit');
        window.parent.postMessage(msg, "*");
    }

    export function read(client?: PXTClient) {
        console.debug('requesting read code');
        if (!inIframe()) {
            // Read from local storage instead
            const resp = {
                code: (window as any).localStorage['code'],
                json: (window as any).localStorage['json'],
                jres: (window as any).localStorage['jres'],
                asm: (window as any).localStorage['asm'],
            }
            if (client) client.emit('read', resp);
            return;
        }

        const msg = mkRequest('extreadcode');
        window.parent.postMessage(msg, "*");
    }

    export function readUser() {
        console.debug('requesting read user code');
        if (!inIframe()) return;

        const msg = mkRequest('extusercode');
        window.parent.postMessage(msg, "*");
    }

    export function write(code: string, json?: string, jres?: string, asm?: string) {
        console.debug('writing code:', code, json, jres, asm);
        if (!inIframe()) {
            // Write to local storage instead
            writeStorage('code', code);
            writeStorage('json', json);
            writeStorage('jres', jres);
            writeStorage('asm', asm);
            return;
        }

        const msg: any = mkRequest('extwritecode');
        msg.body = {
            code,
            json,
            jres,
            asm
        }
        window.parent.postMessage(msg, "*");

        function writeStorage(key: string, value: string) {
            if (value === undefined)
                delete (window as any).localStorage[key];
            else
                (window as any).localStorage[key] = value;
        }
    }

    export function queryPermission() {
        if (!inIframe()) return;

        const msg: any = mkRequest('extquerypermission');
        window.parent.postMessage(msg, "*");
    }

    export function requestPermission(console: boolean) {
        if (!inIframe()) return;

        const msg: any = mkRequest('extrequestpermission');
        msg.body = {
            console
        }
        window.parent.postMessage(msg, "*");
    }

    export function dataStream(console: boolean) {
        if (!inIframe()) return;

        const msg: any = mkRequest('extdatastream');
        msg.body = {
            console
        }
        window.parent.postMessage(msg, "*");
    }

    let idToType: { [key: string]: string } = {};
    function mkRequest(action: string) {
        let id = Math.random().toString();
        idToType[id] = action;
        return {
            type: "pxtpkgext",
            action: action,
            extId: getExtensionId(),
            response: true,
            id: id
        }
    }

    export function getExtensionId() {
        return inIframe() ? window.location.hash.substr(1) : undefined;
    }
}


export namespace pxt.extensions.ui {

    export function isTouchEnabled(): boolean {
        return typeof window !== "undefined" &&
            ('ontouchstart' in window                              // works on most browsers
                || (navigator && navigator.maxTouchPoints > 0));       // works on IE10/11 and Surface);
    }

    export function hasPointerEvents(): boolean {
        return typeof window != "undefined" && !!(window as any).PointerEvent;
    }

    export interface IPointerEvents {
        up: string,
        down: string[],
        move: string,
        enter: string,
        leave: string
    }

    export const pointerEvents: IPointerEvents = hasPointerEvents() ? {
        up: "pointerup",
        down: ["pointerdown"],
        move: "pointermove",
        enter: "pointerenter",
        leave: "pointerleave"
    } : isTouchEnabled() ?
            {
                up: "mouseup",
                down: ["mousedown", "touchstart"],
                move: "touchmove",
                enter: "touchenter",
                leave: "touchend"
            } :
            {
                up: "mouseup",
                down: ["mousedown"],
                move: "mousemove",
                enter: "mouseenter",
                leave: "mouseleave"
            };

    export function getClientXYFromEvent(ev: MouseEvent | PointerEvent | TouchEvent) {
        let clientX;
        let clientY;
        if ((ev as TouchEvent).changedTouches && (ev as TouchEvent).changedTouches.length == 1) {
            // Handle touch events
            clientX = (ev as TouchEvent).changedTouches[0].clientX;
            clientY = (ev as TouchEvent).changedTouches[0].clientY;
        } else {
            // All other events (pointer + mouse)
            clientX = (ev as MouseEvent).clientX;
            clientY = (ev as MouseEvent).clientY;
        }
        return {
            clientX,
            clientY
        }
    }

    export function useTouchEvents() {
        return !hasPointerEvents() && isTouchEnabled();
    }

    export function usePointerEvents() {
        return hasPointerEvents();
    }

    export function useMouseEvents() {
        return !hasPointerEvents() && !isTouchEnabled();
    }
}


export class PXTClient {

    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    on(eventName: string, listener: EventEmitter.ListenerFn) {
        this.eventEmitter.on(eventName, listener);
    }

    removeEventListener(eventName: string, listener: EventEmitter.ListenerFn) {
        this.eventEmitter.removeListener(eventName, listener);
    }

    emit(eventName: string, payload: Object, error = false) {
        this.eventEmitter.emit(eventName, payload, error);
    }

    getEventEmitter() {
        return this.eventEmitter;
    }
}