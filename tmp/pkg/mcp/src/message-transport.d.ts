/**
 * @typedef {import("@modelcontextprotocol/sdk/types.js").JSONRPCMessage} JSONRPCMessage
 */
/**
 * Minimal JSON-RPC transport over a {@link MessagePort}.
 *
 * This transport is suitable for use with `MessageChannel`, `Worker`, or any
 * other browser API that exposes a `MessagePort`. It sends and receives
 * structured-cloned JSON-RPC messages directly, without stringification or any
 * extra framing protocol.
 *
 * The caller is responsible for providing the connected port endpoint.
 *
 * @example
 * const channel = new MessageChannel();
 *
 * const clientTransport = new MessagePortTransport(channel.port1);
 * const serverTransport = new MessagePortTransport(channel.port2);
 *
 * await clientTransport.start();
 * await serverTransport.start();
 *
 * await clientTransport.send({
 *   jsonrpc: "2.0",
 *   id: 1,
 *   method: "ping",
 *   params: {}
 * });
 */
export class MessagePortTransport {
    /**
     * @param {MessagePort} port Connected message port used for transport I/O.
     */
    constructor(port: MessagePort);
    /** @private @type {MessagePort} */
    private port;
    /** @private @type {boolean} */
    private started;
    /** @private @type {boolean} */
    private closed;
    /**
     * Handles incoming `message` events from the port.
     *
     * Valid JSON-RPC messages are forwarded to {@link onmessage}. Invalid
     * payloads are reported via {@link onerror}.
     *
     * @private
     * @type {(event: MessageEvent<unknown>) => void}
     */
    private onPortMessage;
    /**
     * Handles structured-clone delivery failures reported by the port.
     *
     * @private
     * @type {(event: MessageEvent<unknown>) => void}
     */
    private onPortMessageError;
    /**
     * Begin listening for incoming messages on the port.
     *
     * This method is idempotent. Calling it more than once has no effect.
     *
     * In some browser environments, `MessagePort.start()` is required for
     * delivery when using `addEventListener`, so it is called when available.
     *
     * @returns {Promise<void>}
     */
    start(): Promise<void>;
    /**
     * Send a JSON-RPC message through the port.
     *
     * The message is sent using the structured clone algorithm.
     *
     * @param {JSONRPCMessage} message JSON-RPC message to send.
     * @param {object} [options] Optional transport send options. Currently unused.
     * @returns {Promise<void>}
     */
    send(message: JSONRPCMessage, options?: object): Promise<void>;
    /**
     * Stop listening and close the underlying port.
     *
     * This method is idempotent. Calling it more than once has no effect.
     *
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Called when the transport is closed.
     *
     * Set this to be notified after {@link close} completes.
     *
     * @type {(() => void) | undefined}
     */
    onclose: (() => void) | undefined;
    /**
     * Called when an incoming payload is invalid or the port reports a message error.
     *
     * @param {Error} error Error describing the failure.
     * @type {((error: Error) => void) | undefined}
     */
    onerror: ((error: Error) => void) | undefined;
    /**
     * Called when a valid JSON-RPC message is received.
     *
     * The {@link start} method must be called before messages will be delivered.
     *
     * @param {JSONRPCMessage} message Validated JSON-RPC message.
     * @type {((message: JSONRPCMessage) => void) | undefined}
     */
    onmessage: ((message: JSONRPCMessage) => void) | undefined;
    /**
     * Optional session identifier associated with this transport.
     *
     * This field may be assigned by higher-level MCP SDK code. It is not used by
     * the transport implementation itself.
     *
     * @type {string | undefined}
     */
    sessionId: string | undefined;
    /**
     * Callback used by the MCP SDK to communicate the negotiated protocol version.
     *
     * This transport stores the callback but does not invoke it directly.
     *
     * @type {((version: string) => void) | undefined}
     */
    setProtocolVersion: ((version: string) => void) | undefined;
}
export type JSONRPCMessage = import("@modelcontextprotocol/sdk/types.js").JSONRPCMessage;
