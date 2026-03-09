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
  constructor(port) {
    /** @private @type {MessagePort} */
    this.port = port;

    /** @private @type {boolean} */
    this.started = false;

    /** @private @type {boolean} */
    this.closed = false;

    /**
     * Handles incoming `message` events from the port.
     *
     * Valid JSON-RPC messages are forwarded to {@link onmessage}. Invalid
     * payloads are reported via {@link onerror}.
     *
     * @private
     * @type {(event: MessageEvent<unknown>) => void}
     */
    this.onPortMessage = (event) => {
      const parsed = JSONRPCMessageSchema.safeParse(event.data);

      if (!parsed.success) {
        this.onerror?.(
          new Error(
            "Invalid JSON-RPC message received: " + parsed.error.message
          )
        );
        return;
      }

      this.onmessage?.(parsed.data);
    };

    /**
     * Handles structured-clone delivery failures reported by the port.
     *
     * @private
     * @type {(event: MessageEvent<unknown>) => void}
     */
    this.onPortMessageError = (_event) => {
      this.onerror?.(new Error("MessagePort messageerror"));
    };
  }

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
  async start() {
    if (this.started) return;
    if (this.closed) {
      throw new Error("Transport is closed");
    }

    this.started = true;
    this.port.addEventListener("message", this.onPortMessage);
    this.port.addEventListener("messageerror", this.onPortMessageError);
    this.port.start?.();
  }

  /**
   * Send a JSON-RPC message through the port.
   *
   * The message is sent using the structured clone algorithm.
   *
   * @param {JSONRPCMessage} message JSON-RPC message to send.
   * @param {object} [options] Optional transport send options. Currently unused.
   * @returns {Promise<void>}
   */
  async send(message, options) {
    void options;

    if (this.closed) {
      throw new Error("Transport is closed");
    }

    this.port.postMessage(message);
  }

  /**
   * Stop listening and close the underlying port.
   *
   * This method is idempotent. Calling it more than once has no effect.
   *
   * @returns {Promise<void>}
   */
  async close() {
    if (this.closed) return;
    this.closed = true;

    this.port.removeEventListener("message", this.onPortMessage);
    this.port.removeEventListener("messageerror", this.onPortMessageError);
    this.port.close();

    this.onclose?.();
  }

  /**
   * Called when the transport is closed.
   *
   * Set this to be notified after {@link close} completes.
   *
   * @type {(() => void) | undefined}
   */
  onclose;

  /**
   * Called when an incoming payload is invalid or the port reports a message error.
   *
   * @param {Error} error Error describing the failure.
   * @type {((error: Error) => void) | undefined}
   */
  onerror;

  /**
   * Called when a valid JSON-RPC message is received.
   *
   * The {@link start} method must be called before messages will be delivered.
   *
   * @param {JSONRPCMessage} message Validated JSON-RPC message.
   * @type {((message: JSONRPCMessage) => void) | undefined}
   */
  onmessage;

  /**
   * Optional session identifier associated with this transport.
   *
   * This field may be assigned by higher-level MCP SDK code. It is not used by
   * the transport implementation itself.
   *
   * @type {string | undefined}
   */
  sessionId;

  /**
   * Callback used by the MCP SDK to communicate the negotiated protocol version.
   *
   * This transport stores the callback but does not invoke it directly.
   *
   * @type {((version: string) => void) | undefined}
   */
  setProtocolVersion;
}