// node_modules/@modelcontextprotocol/ext-apps/src/app.ts
import {
  Protocol
} from "./mcp-sdk-shared.js";
import {
  CallToolRequestSchema,
  CallToolResultSchema as CallToolResultSchema2,
  EmptyResultSchema,
  ListResourcesResultSchema,
  ListToolsRequestSchema,
  PingRequestSchema,
  ReadResourceResultSchema
} from "./mcp-sdk-types.js";

// node_modules/@modelcontextprotocol/ext-apps/src/message-transport.ts
import {
  JSONRPCMessageSchema
} from "./mcp-sdk-types.js";
var PostMessageTransport = class {
  /**
   * Create a new PostMessageTransport.
   *
   * @param eventTarget - Target window to send messages to (default: `window.parent`)
   * @param eventSource - Source window for message validation. For views, pass
   *   `window.parent`. For hosts, pass `iframe.contentWindow`.
   *
   * @example View connecting to parent
   * ```ts source="./message-transport.examples.ts#PostMessageTransport_constructor_view"
   * const transport = new PostMessageTransport(window.parent, window.parent);
   * ```
   *
   * @example Host connecting to iframe
   * ```ts source="./message-transport.examples.ts#PostMessageTransport_constructor_host"
   * const iframe = document.getElementById("app-iframe") as HTMLIFrameElement;
   * const transport = new PostMessageTransport(
   *   iframe.contentWindow!,
   *   iframe.contentWindow!,
   * );
   * ```
   */
  constructor(eventTarget = window.parent, eventSource) {
    this.eventTarget = eventTarget;
    this.eventSource = eventSource;
    this.messageListener = (event) => {
      if (eventSource && event.source !== this.eventSource) {
        console.debug("Ignoring message from unknown source", event);
        return;
      }
      const parsed = JSONRPCMessageSchema.safeParse(event.data);
      if (parsed.success) {
        console.debug("Parsed message", parsed.data);
        this.onmessage?.(parsed.data);
      } else if (event.data?.jsonrpc !== "2.0") {
        console.debug(
          "Ignoring non-JSON-RPC message",
          parsed.error.message,
          event
        );
      } else {
        console.error("Failed to parse message", parsed.error.message, event);
        this.onerror?.(
          new Error(
            "Invalid JSON-RPC message received: " + parsed.error.message
          )
        );
      }
    };
  }
  messageListener;
  /**
   * Begin listening for messages from the event source.
   *
   * Registers a message event listener on the window. Must be called before
   * messages can be received.
   */
  async start() {
    window.addEventListener("message", this.messageListener);
  }
  /**
   * Send a JSON-RPC message to the target window.
   *
   * Messages are sent using `postMessage` with `"*"` origin, meaning they are visible
   * to all frames. The receiver should validate the message source for security.
   *
   * @param message - JSON-RPC message to send
   * @param options - Optional send options (currently unused)
   */
  async send(message, options) {
    console.debug("Sending message", message);
    this.eventTarget.postMessage(message, "*");
  }
  /**
   * Stop listening for messages and cleanup.
   *
   * Removes the message event listener and calls the {@link onclose `onclose`} callback if set.
   */
  async close() {
    window.removeEventListener("message", this.messageListener);
    this.onclose?.();
  }
  /**
   * Called when the transport is closed.
   *
   * Set this handler to be notified when {@link close `close`} is called.
   */
  onclose;
  /**
   * Called when a message parsing error occurs.
   *
   * This handler is invoked when a received message fails JSON-RPC schema
   * validation. The error parameter contains details about the validation failure.
   *
   * @param error - Error describing the validation failure
   */
  onerror;
  /**
   * Called when a valid JSON-RPC message is received.
   *
   * This handler is invoked after message validation succeeds. The {@link start `start`}
   * method must be called before messages will be received.
   *
   * @param message - The validated JSON-RPC message
   * @param extra - Optional metadata about the message (unused in this transport)
   */
  onmessage;
  /**
   * Optional session identifier for this transport connection.
   *
   * Set by the MCP SDK to track the connection session. Not required for
   * `PostMessageTransport` functionality.
   */
  sessionId;
  /**
   * Callback to set the negotiated protocol version.
   *
   * The MCP SDK calls this during initialization to communicate the protocol
   * version negotiated with the peer.
   *
   * @param version - The negotiated protocol version string
   */
  setProtocolVersion;
};

// node_modules/@modelcontextprotocol/ext-apps/src/spec.types.ts
var LATEST_PROTOCOL_VERSION = "2026-01-26";
var OPEN_LINK_METHOD = "ui/open-link";
var DOWNLOAD_FILE_METHOD = "ui/download-file";
var MESSAGE_METHOD = "ui/message";
var SANDBOX_PROXY_READY_METHOD = "ui/notifications/sandbox-proxy-ready";
var SANDBOX_RESOURCE_READY_METHOD = "ui/notifications/sandbox-resource-ready";
var SIZE_CHANGED_METHOD = "ui/notifications/size-changed";
var TOOL_INPUT_METHOD = "ui/notifications/tool-input";
var TOOL_INPUT_PARTIAL_METHOD = "ui/notifications/tool-input-partial";
var TOOL_RESULT_METHOD = "ui/notifications/tool-result";
var TOOL_CANCELLED_METHOD = "ui/notifications/tool-cancelled";
var HOST_CONTEXT_CHANGED_METHOD = "ui/notifications/host-context-changed";
var RESOURCE_TEARDOWN_METHOD = "ui/resource-teardown";
var INITIALIZE_METHOD = "ui/initialize";
var INITIALIZED_METHOD = "ui/notifications/initialized";
var REQUEST_DISPLAY_MODE_METHOD = "ui/request-display-mode";

// node_modules/@modelcontextprotocol/ext-apps/src/generated/schema.ts
import { z } from "./mcp-zod-compat.js";
import {
  ContentBlockSchema,
  CallToolResultSchema,
  EmbeddedResourceSchema,
  ImplementationSchema,
  RequestIdSchema,
  ResourceLinkSchema,
  ToolSchema
} from "./mcp-sdk-types.js";
var McpUiThemeSchema = z.union([z.literal("light"), z.literal("dark")]).describe("Color theme preference for the host environment.");
var McpUiDisplayModeSchema = z.union([z.literal("inline"), z.literal("fullscreen"), z.literal("pip")]).describe("Display mode for UI presentation.");
var McpUiStyleVariableKeySchema = z.union([
  z.literal("--color-background-primary"),
  z.literal("--color-background-secondary"),
  z.literal("--color-background-tertiary"),
  z.literal("--color-background-inverse"),
  z.literal("--color-background-ghost"),
  z.literal("--color-background-info"),
  z.literal("--color-background-danger"),
  z.literal("--color-background-success"),
  z.literal("--color-background-warning"),
  z.literal("--color-background-disabled"),
  z.literal("--color-text-primary"),
  z.literal("--color-text-secondary"),
  z.literal("--color-text-tertiary"),
  z.literal("--color-text-inverse"),
  z.literal("--color-text-ghost"),
  z.literal("--color-text-info"),
  z.literal("--color-text-danger"),
  z.literal("--color-text-success"),
  z.literal("--color-text-warning"),
  z.literal("--color-text-disabled"),
  z.literal("--color-border-primary"),
  z.literal("--color-border-secondary"),
  z.literal("--color-border-tertiary"),
  z.literal("--color-border-inverse"),
  z.literal("--color-border-ghost"),
  z.literal("--color-border-info"),
  z.literal("--color-border-danger"),
  z.literal("--color-border-success"),
  z.literal("--color-border-warning"),
  z.literal("--color-border-disabled"),
  z.literal("--color-ring-primary"),
  z.literal("--color-ring-secondary"),
  z.literal("--color-ring-inverse"),
  z.literal("--color-ring-info"),
  z.literal("--color-ring-danger"),
  z.literal("--color-ring-success"),
  z.literal("--color-ring-warning"),
  z.literal("--font-sans"),
  z.literal("--font-mono"),
  z.literal("--font-weight-normal"),
  z.literal("--font-weight-medium"),
  z.literal("--font-weight-semibold"),
  z.literal("--font-weight-bold"),
  z.literal("--font-text-xs-size"),
  z.literal("--font-text-sm-size"),
  z.literal("--font-text-md-size"),
  z.literal("--font-text-lg-size"),
  z.literal("--font-heading-xs-size"),
  z.literal("--font-heading-sm-size"),
  z.literal("--font-heading-md-size"),
  z.literal("--font-heading-lg-size"),
  z.literal("--font-heading-xl-size"),
  z.literal("--font-heading-2xl-size"),
  z.literal("--font-heading-3xl-size"),
  z.literal("--font-text-xs-line-height"),
  z.literal("--font-text-sm-line-height"),
  z.literal("--font-text-md-line-height"),
  z.literal("--font-text-lg-line-height"),
  z.literal("--font-heading-xs-line-height"),
  z.literal("--font-heading-sm-line-height"),
  z.literal("--font-heading-md-line-height"),
  z.literal("--font-heading-lg-line-height"),
  z.literal("--font-heading-xl-line-height"),
  z.literal("--font-heading-2xl-line-height"),
  z.literal("--font-heading-3xl-line-height"),
  z.literal("--border-radius-xs"),
  z.literal("--border-radius-sm"),
  z.literal("--border-radius-md"),
  z.literal("--border-radius-lg"),
  z.literal("--border-radius-xl"),
  z.literal("--border-radius-full"),
  z.literal("--border-width-regular"),
  z.literal("--shadow-hairline"),
  z.literal("--shadow-sm"),
  z.literal("--shadow-md"),
  z.literal("--shadow-lg")
]).describe("CSS variable keys available to MCP apps for theming.");
var McpUiStylesSchema = z.record(
  McpUiStyleVariableKeySchema.describe(
    "Style variables for theming MCP apps.\n\nIndividual style keys are optional - hosts may provide any subset of these values.\nValues are strings containing CSS values (colors, sizes, font stacks, etc.).\n\nNote: This type uses `Record<K, string | undefined>` rather than `Partial<Record<K, string>>`\nfor compatibility with Zod schema generation. Both are functionally equivalent for validation."
  ),
  z.union([z.string(), z.undefined()]).describe(
    "Style variables for theming MCP apps.\n\nIndividual style keys are optional - hosts may provide any subset of these values.\nValues are strings containing CSS values (colors, sizes, font stacks, etc.).\n\nNote: This type uses `Record<K, string | undefined>` rather than `Partial<Record<K, string>>`\nfor compatibility with Zod schema generation. Both are functionally equivalent for validation."
  )
).describe(
  "Style variables for theming MCP apps.\n\nIndividual style keys are optional - hosts may provide any subset of these values.\nValues are strings containing CSS values (colors, sizes, font stacks, etc.).\n\nNote: This type uses `Record<K, string | undefined>` rather than `Partial<Record<K, string>>`\nfor compatibility with Zod schema generation. Both are functionally equivalent for validation."
);
var McpUiOpenLinkRequestSchema = z.object({
  method: z.literal("ui/open-link"),
  params: z.object({
    /** @description URL to open in the host's browser */
    url: z.string().describe("URL to open in the host's browser")
  })
});
var McpUiOpenLinkResultSchema = z.object({
  /** @description True if the host failed to open the URL (e.g., due to security policy). */
  isError: z.boolean().optional().describe(
    "True if the host failed to open the URL (e.g., due to security policy)."
  )
}).passthrough();
var McpUiDownloadFileResultSchema = z.object({
  /** @description True if the download failed (e.g., user cancelled or host denied). */
  isError: z.boolean().optional().describe(
    "True if the download failed (e.g., user cancelled or host denied)."
  )
}).passthrough();
var McpUiMessageResultSchema = z.object({
  /** @description True if the host rejected or failed to deliver the message. */
  isError: z.boolean().optional().describe("True if the host rejected or failed to deliver the message.")
}).passthrough();
var McpUiSandboxProxyReadyNotificationSchema = z.object({
  method: z.literal("ui/notifications/sandbox-proxy-ready"),
  params: z.object({})
});
var McpUiResourceCspSchema = z.object({
  /**
   * @description Origins for network requests (fetch/XHR/WebSocket).
   *
   * - Maps to CSP `connect-src` directive
   * - Empty or omitted → no network connections (secure default)
   *
   * @example
   * ```ts
   * ["https://api.weather.com", "wss://realtime.service.com"]
   * ```
   */
  connectDomains: z.array(z.string()).optional().describe(
    "Origins for network requests (fetch/XHR/WebSocket).\n\n- Maps to CSP `connect-src` directive\n- Empty or omitted \u2192 no network connections (secure default)"
  ),
  /**
   * @description Origins for static resources (images, scripts, stylesheets, fonts, media).
   *
   * - Maps to CSP `img-src`, `script-src`, `style-src`, `font-src`, `media-src` directives
   * - Wildcard subdomains supported: `https://*.example.com`
   * - Empty or omitted → no network resources (secure default)
   *
   * @example
   * ```ts
   * ["https://cdn.jsdelivr.net", "https://*.cloudflare.com"]
   * ```
   */
  resourceDomains: z.array(z.string()).optional().describe(
    "Origins for static resources (images, scripts, stylesheets, fonts, media).\n\n- Maps to CSP `img-src`, `script-src`, `style-src`, `font-src`, `media-src` directives\n- Wildcard subdomains supported: `https://*.example.com`\n- Empty or omitted \u2192 no network resources (secure default)"
  ),
  /**
   * @description Origins for nested iframes.
   *
   * - Maps to CSP `frame-src` directive
   * - Empty or omitted → no nested iframes allowed (`frame-src 'none'`)
   *
   * @example
   * ```ts
   * ["https://www.youtube.com", "https://player.vimeo.com"]
   * ```
   */
  frameDomains: z.array(z.string()).optional().describe(
    "Origins for nested iframes.\n\n- Maps to CSP `frame-src` directive\n- Empty or omitted \u2192 no nested iframes allowed (`frame-src 'none'`)"
  ),
  /**
   * @description Allowed base URIs for the document.
   *
   * - Maps to CSP `base-uri` directive
   * - Empty or omitted → only same origin allowed (`base-uri 'self'`)
   *
   * @example
   * ```ts
   * ["https://cdn.example.com"]
   * ```
   */
  baseUriDomains: z.array(z.string()).optional().describe(
    "Allowed base URIs for the document.\n\n- Maps to CSP `base-uri` directive\n- Empty or omitted \u2192 only same origin allowed (`base-uri 'self'`)"
  )
});
var McpUiResourcePermissionsSchema = z.object({
  /**
   * @description Request camera access.
   *
   * Maps to Permission Policy `camera` feature.
   */
  camera: z.object({}).optional().describe(
    "Request camera access.\n\nMaps to Permission Policy `camera` feature."
  ),
  /**
   * @description Request microphone access.
   *
   * Maps to Permission Policy `microphone` feature.
   */
  microphone: z.object({}).optional().describe(
    "Request microphone access.\n\nMaps to Permission Policy `microphone` feature."
  ),
  /**
   * @description Request geolocation access.
   *
   * Maps to Permission Policy `geolocation` feature.
   */
  geolocation: z.object({}).optional().describe(
    "Request geolocation access.\n\nMaps to Permission Policy `geolocation` feature."
  ),
  /**
   * @description Request clipboard write access.
   *
   * Maps to Permission Policy `clipboard-write` feature.
   */
  clipboardWrite: z.object({}).optional().describe(
    "Request clipboard write access.\n\nMaps to Permission Policy `clipboard-write` feature."
  )
});
var McpUiSizeChangedNotificationSchema = z.object({
  method: z.literal("ui/notifications/size-changed"),
  params: z.object({
    /** @description New width in pixels. */
    width: z.number().optional().describe("New width in pixels."),
    /** @description New height in pixels. */
    height: z.number().optional().describe("New height in pixels.")
  })
});
var McpUiToolInputNotificationSchema = z.object({
  method: z.literal("ui/notifications/tool-input"),
  params: z.object({
    /** @description Complete tool call arguments as key-value pairs. */
    arguments: z.record(
      z.string(),
      z.unknown().describe("Complete tool call arguments as key-value pairs.")
    ).optional().describe("Complete tool call arguments as key-value pairs.")
  })
});
var McpUiToolInputPartialNotificationSchema = z.object({
  method: z.literal("ui/notifications/tool-input-partial"),
  params: z.object({
    /** @description Partial tool call arguments (incomplete, may change). */
    arguments: z.record(
      z.string(),
      z.unknown().describe("Partial tool call arguments (incomplete, may change).")
    ).optional().describe("Partial tool call arguments (incomplete, may change).")
  })
});
var McpUiToolCancelledNotificationSchema = z.object({
  method: z.literal("ui/notifications/tool-cancelled"),
  params: z.object({
    /** @description Optional reason for the cancellation (e.g., "user action", "timeout"). */
    reason: z.string().optional().describe(
      'Optional reason for the cancellation (e.g., "user action", "timeout").'
    )
  })
});
var McpUiHostCssSchema = z.object({
  /** @description CSS for font loading (`@font-face` rules or `@import` statements). Apps must apply using {@link applyHostFonts `applyHostFonts`}. */
  fonts: z.string().optional()
});
var McpUiHostStylesSchema = z.object({
  /** @description CSS variables for theming the app. */
  variables: McpUiStylesSchema.optional().describe(
    "CSS variables for theming the app."
  ),
  /** @description CSS blocks that apps can inject. */
  css: McpUiHostCssSchema.optional().describe(
    "CSS blocks that apps can inject."
  )
});
var McpUiResourceTeardownRequestSchema = z.object({
  method: z.literal("ui/resource-teardown"),
  params: z.object({})
});
var McpUiResourceTeardownResultSchema = z.record(
  z.string(),
  z.unknown()
);
var McpUiSupportedContentBlockModalitiesSchema = z.object({
  /** @description Host supports text content blocks. */
  text: z.object({}).optional().describe("Host supports text content blocks."),
  /** @description Host supports image content blocks. */
  image: z.object({}).optional().describe("Host supports image content blocks."),
  /** @description Host supports audio content blocks. */
  audio: z.object({}).optional().describe("Host supports audio content blocks."),
  /** @description Host supports resource content blocks. */
  resource: z.object({}).optional().describe("Host supports resource content blocks."),
  /** @description Host supports resource link content blocks. */
  resourceLink: z.object({}).optional().describe("Host supports resource link content blocks."),
  /** @description Host supports structured content. */
  structuredContent: z.object({}).optional().describe("Host supports structured content.")
});
var McpUiHostCapabilitiesSchema = z.object({
  /** @description Experimental features (structure TBD). */
  experimental: z.object({}).optional().describe("Experimental features (structure TBD)."),
  /** @description Host supports opening external URLs. */
  openLinks: z.object({}).optional().describe("Host supports opening external URLs."),
  /** @description Host supports file downloads via ui/download-file. */
  downloadFile: z.object({}).optional().describe("Host supports file downloads via ui/download-file."),
  /** @description Host can proxy tool calls to the MCP server. */
  serverTools: z.object({
    /** @description Host supports tools/list_changed notifications. */
    listChanged: z.boolean().optional().describe("Host supports tools/list_changed notifications.")
  }).optional().describe("Host can proxy tool calls to the MCP server."),
  /** @description Host can proxy resource reads to the MCP server. */
  serverResources: z.object({
    /** @description Host supports resources/list_changed notifications. */
    listChanged: z.boolean().optional().describe("Host supports resources/list_changed notifications.")
  }).optional().describe("Host can proxy resource reads to the MCP server."),
  /** @description Host accepts log messages. */
  logging: z.object({}).optional().describe("Host accepts log messages."),
  /** @description Sandbox configuration applied by the host. */
  sandbox: z.object({
    /** @description Permissions granted by the host (camera, microphone, geolocation). */
    permissions: McpUiResourcePermissionsSchema.optional().describe(
      "Permissions granted by the host (camera, microphone, geolocation)."
    ),
    /** @description CSP domains approved by the host. */
    csp: McpUiResourceCspSchema.optional().describe(
      "CSP domains approved by the host."
    )
  }).optional().describe("Sandbox configuration applied by the host."),
  /** @description Host accepts context updates (ui/update-model-context) to be included in the model's context for future turns. */
  updateModelContext: McpUiSupportedContentBlockModalitiesSchema.optional().describe(
    "Host accepts context updates (ui/update-model-context) to be included in the model's context for future turns."
  ),
  /** @description Host supports receiving content messages (ui/message) from the view. */
  message: McpUiSupportedContentBlockModalitiesSchema.optional().describe(
    "Host supports receiving content messages (ui/message) from the view."
  )
});
var McpUiAppCapabilitiesSchema = z.object({
  /** @description Experimental features (structure TBD). */
  experimental: z.object({}).optional().describe("Experimental features (structure TBD)."),
  /** @description App exposes MCP-style tools that the host can call. */
  tools: z.object({
    /** @description App supports tools/list_changed notifications. */
    listChanged: z.boolean().optional().describe("App supports tools/list_changed notifications.")
  }).optional().describe("App exposes MCP-style tools that the host can call."),
  /** @description Display modes the app supports. */
  availableDisplayModes: z.array(McpUiDisplayModeSchema).optional().describe("Display modes the app supports.")
});
var McpUiInitializedNotificationSchema = z.object({
  method: z.literal("ui/notifications/initialized"),
  params: z.object({}).optional()
});
var McpUiResourceMetaSchema = z.object({
  /** @description Content Security Policy configuration for UI resources. */
  csp: McpUiResourceCspSchema.optional().describe(
    "Content Security Policy configuration for UI resources."
  ),
  /** @description Sandbox permissions requested by the UI resource. */
  permissions: McpUiResourcePermissionsSchema.optional().describe(
    "Sandbox permissions requested by the UI resource."
  ),
  /**
   * @description Dedicated origin for view sandbox.
   *
   * Useful when views need stable, dedicated origins for OAuth callbacks, CORS policies, or API key allowlists.
   *
   * **Host-dependent:** The format and validation rules for this field are determined by each host. Servers MUST consult host-specific documentation for the expected domain format. Common patterns include:
   * - Hash-based subdomains (e.g., `{hash}.claudemcpcontent.com`)
   * - URL-derived subdomains (e.g., `www-example-com.oaiusercontent.com`)
   *
   * If omitted, host uses default sandbox origin (typically per-conversation).
   *
   * @example
   * ```ts
   * "a904794854a047f6.claudemcpcontent.com"
   * ```
   *
   * @example
   * ```ts
   * "www-example-com.oaiusercontent.com"
   * ```
   */
  domain: z.string().optional().describe(
    "Dedicated origin for view sandbox.\n\nUseful when views need stable, dedicated origins for OAuth callbacks, CORS policies, or API key allowlists.\n\n**Host-dependent:** The format and validation rules for this field are determined by each host. Servers MUST consult host-specific documentation for the expected domain format. Common patterns include:\n- Hash-based subdomains (e.g., `{hash}.claudemcpcontent.com`)\n- URL-derived subdomains (e.g., `www-example-com.oaiusercontent.com`)\n\nIf omitted, host uses default sandbox origin (typically per-conversation)."
  ),
  /**
   * @description Visual boundary preference - true if view prefers a visible border.
   *
   * Boolean requesting whether a visible border and background is provided by the host. Specifying an explicit value for this is recommended because hosts' defaults may vary.
   *
   * - `true`: request visible border + background
   * - `false`: request no visible border + background
   * - omitted: host decides border
   */
  prefersBorder: z.boolean().optional().describe(
    "Visual boundary preference - true if view prefers a visible border.\n\nBoolean requesting whether a visible border and background is provided by the host. Specifying an explicit value for this is recommended because hosts' defaults may vary.\n\n- `true`: request visible border + background\n- `false`: request no visible border + background\n- omitted: host decides border"
  )
});
var McpUiRequestDisplayModeRequestSchema = z.object({
  method: z.literal("ui/request-display-mode"),
  params: z.object({
    /** @description The display mode being requested. */
    mode: McpUiDisplayModeSchema.describe("The display mode being requested.")
  })
});
var McpUiRequestDisplayModeResultSchema = z.object({
  /** @description The display mode that was actually set. May differ from requested if not supported. */
  mode: McpUiDisplayModeSchema.describe(
    "The display mode that was actually set. May differ from requested if not supported."
  )
}).passthrough();
var McpUiToolVisibilitySchema = z.union([z.literal("model"), z.literal("app")]).describe("Tool visibility scope - who can access the tool.");
var McpUiToolMetaSchema = z.object({
  /**
   * URI of the UI resource to display for this tool, if any.
   * This is converted to `_meta["ui/resourceUri"]`.
   *
   * @example
   * ```ts
   * "ui://weather/view.html"
   * ```
   */
  resourceUri: z.string().optional(),
  /**
   * @description Who can access this tool. Default: ["model", "app"]
   * - "model": Tool visible to and callable by the agent
   * - "app": Tool callable by the app from this server only
   */
  visibility: z.array(McpUiToolVisibilitySchema).optional().describe(
    'Who can access this tool. Default: ["model", "app"]\n- "model": Tool visible to and callable by the agent\n- "app": Tool callable by the app from this server only'
  )
});
var McpUiClientCapabilitiesSchema = z.object({
  /**
   * @description Array of supported MIME types for UI resources.
   * Must include `"text/html;profile=mcp-app"` for MCP Apps support.
   */
  mimeTypes: z.array(z.string()).optional().describe(
    'Array of supported MIME types for UI resources.\nMust include `"text/html;profile=mcp-app"` for MCP Apps support.'
  )
});
var McpUiDownloadFileRequestSchema = z.object({
  method: z.literal("ui/download-file"),
  params: z.object({
    /** @description Resource contents to download — embedded (inline data) or linked (host fetches). Uses standard MCP resource types. */
    contents: z.array(z.union([EmbeddedResourceSchema, ResourceLinkSchema])).describe(
      "Resource contents to download \u2014 embedded (inline data) or linked (host fetches). Uses standard MCP resource types."
    )
  })
});
var McpUiMessageRequestSchema = z.object({
  method: z.literal("ui/message"),
  params: z.object({
    /** @description Message role, currently only "user" is supported. */
    role: z.literal("user").describe('Message role, currently only "user" is supported.'),
    /** @description Message content blocks (text, image, etc.). */
    content: z.array(ContentBlockSchema).describe("Message content blocks (text, image, etc.).")
  })
});
var McpUiSandboxResourceReadyNotificationSchema = z.object({
  method: z.literal("ui/notifications/sandbox-resource-ready"),
  params: z.object({
    /** @description HTML content to load into the inner iframe. */
    html: z.string().describe("HTML content to load into the inner iframe."),
    /** @description Optional override for the inner iframe's sandbox attribute. */
    sandbox: z.string().optional().describe("Optional override for the inner iframe's sandbox attribute."),
    /** @description CSP configuration from resource metadata. */
    csp: McpUiResourceCspSchema.optional().describe(
      "CSP configuration from resource metadata."
    ),
    /** @description Sandbox permissions from resource metadata. */
    permissions: McpUiResourcePermissionsSchema.optional().describe(
      "Sandbox permissions from resource metadata."
    )
  })
});
var McpUiToolResultNotificationSchema = z.object({
  method: z.literal("ui/notifications/tool-result"),
  /** @description Standard MCP tool execution result. */
  params: CallToolResultSchema.describe("Standard MCP tool execution result.")
});
var McpUiHostContextSchema = z.object({
  /** @description Metadata of the tool call that instantiated this App. */
  toolInfo: z.object({
    /** @description JSON-RPC id of the tools/call request. */
    id: RequestIdSchema.optional().describe(
      "JSON-RPC id of the tools/call request."
    ),
    /** @description Tool definition including name, inputSchema, etc. */
    tool: ToolSchema.describe(
      "Tool definition including name, inputSchema, etc."
    )
  }).optional().describe("Metadata of the tool call that instantiated this App."),
  /** @description Current color theme preference. */
  theme: McpUiThemeSchema.optional().describe(
    "Current color theme preference."
  ),
  /** @description Style configuration for theming the app. */
  styles: McpUiHostStylesSchema.optional().describe(
    "Style configuration for theming the app."
  ),
  /** @description How the UI is currently displayed. */
  displayMode: McpUiDisplayModeSchema.optional().describe(
    "How the UI is currently displayed."
  ),
  /** @description Display modes the host supports. */
  availableDisplayModes: z.array(McpUiDisplayModeSchema).optional().describe("Display modes the host supports."),
  /**
   * @description Container dimensions. Represents the dimensions of the iframe or other
   * container holding the app. Specify either width or maxWidth, and either height or maxHeight.
   */
  containerDimensions: z.union([
    z.object({
      /** @description Fixed container height in pixels. */
      height: z.number().describe("Fixed container height in pixels.")
    }),
    z.object({
      /** @description Maximum container height in pixels. */
      maxHeight: z.union([z.number(), z.undefined()]).optional().describe("Maximum container height in pixels.")
    })
  ]).and(
    z.union([
      z.object({
        /** @description Fixed container width in pixels. */
        width: z.number().describe("Fixed container width in pixels.")
      }),
      z.object({
        /** @description Maximum container width in pixels. */
        maxWidth: z.union([z.number(), z.undefined()]).optional().describe("Maximum container width in pixels.")
      })
    ])
  ).optional().describe(
    "Container dimensions. Represents the dimensions of the iframe or other\ncontainer holding the app. Specify either width or maxWidth, and either height or maxHeight."
  ),
  /** @description User's language and region preference in BCP 47 format. */
  locale: z.string().optional().describe("User's language and region preference in BCP 47 format."),
  /** @description User's timezone in IANA format. */
  timeZone: z.string().optional().describe("User's timezone in IANA format."),
  /** @description Host application identifier. */
  userAgent: z.string().optional().describe("Host application identifier."),
  /** @description Platform type for responsive design decisions. */
  platform: z.union([z.literal("web"), z.literal("desktop"), z.literal("mobile")]).optional().describe("Platform type for responsive design decisions."),
  /** @description Device input capabilities. */
  deviceCapabilities: z.object({
    /** @description Whether the device supports touch input. */
    touch: z.boolean().optional().describe("Whether the device supports touch input."),
    /** @description Whether the device supports hover interactions. */
    hover: z.boolean().optional().describe("Whether the device supports hover interactions.")
  }).optional().describe("Device input capabilities."),
  /** @description Mobile safe area boundaries in pixels. */
  safeAreaInsets: z.object({
    /** @description Top safe area inset in pixels. */
    top: z.number().describe("Top safe area inset in pixels."),
    /** @description Right safe area inset in pixels. */
    right: z.number().describe("Right safe area inset in pixels."),
    /** @description Bottom safe area inset in pixels. */
    bottom: z.number().describe("Bottom safe area inset in pixels."),
    /** @description Left safe area inset in pixels. */
    left: z.number().describe("Left safe area inset in pixels.")
  }).optional().describe("Mobile safe area boundaries in pixels.")
}).passthrough();
var McpUiHostContextChangedNotificationSchema = z.object({
  method: z.literal("ui/notifications/host-context-changed"),
  /** @description Partial context update containing only changed fields. */
  params: McpUiHostContextSchema.describe(
    "Partial context update containing only changed fields."
  )
});
var McpUiUpdateModelContextRequestSchema = z.object({
  method: z.literal("ui/update-model-context"),
  params: z.object({
    /** @description Context content blocks (text, image, etc.). */
    content: z.array(ContentBlockSchema).optional().describe("Context content blocks (text, image, etc.)."),
    /** @description Structured content for machine-readable context data. */
    structuredContent: z.record(
      z.string(),
      z.unknown().describe("Structured content for machine-readable context data.")
    ).optional().describe("Structured content for machine-readable context data.")
  })
});
var McpUiInitializeRequestSchema = z.object({
  method: z.literal("ui/initialize"),
  params: z.object({
    /** @description App identification (name and version). */
    appInfo: ImplementationSchema.describe(
      "App identification (name and version)."
    ),
    /** @description Features and capabilities this app provides. */
    appCapabilities: McpUiAppCapabilitiesSchema.describe(
      "Features and capabilities this app provides."
    ),
    /** @description Protocol version this app supports. */
    protocolVersion: z.string().describe("Protocol version this app supports.")
  })
});
var McpUiInitializeResultSchema = z.object({
  /** @description Negotiated protocol version string (e.g., "2025-11-21"). */
  protocolVersion: z.string().describe('Negotiated protocol version string (e.g., "2025-11-21").'),
  /** @description Host application identification and version. */
  hostInfo: ImplementationSchema.describe(
    "Host application identification and version."
  ),
  /** @description Features and capabilities provided by the host. */
  hostCapabilities: McpUiHostCapabilitiesSchema.describe(
    "Features and capabilities provided by the host."
  ),
  /** @description Rich context about the host environment. */
  hostContext: McpUiHostContextSchema.describe(
    "Rich context about the host environment."
  )
}).passthrough();

// node_modules/@modelcontextprotocol/ext-apps/src/styles.ts
function getDocumentTheme() {
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "dark" || theme === "light") {
    return theme;
  }
  const darkMode = document.documentElement.classList.contains("dark");
  return darkMode ? "dark" : "light";
}
function applyDocumentTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}
function applyHostStyleVariables(styles, root = document.documentElement) {
  for (const [key, value] of Object.entries(styles)) {
    if (value !== void 0) {
      root.style.setProperty(key, value);
    }
  }
}
function applyHostFonts(fontCss) {
  const styleId = "__mcp-host-fonts";
  if (document.getElementById(styleId)) {
    return;
  }
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = fontCss;
  document.head.appendChild(style);
}

// node_modules/@modelcontextprotocol/ext-apps/src/app.ts
var RESOURCE_URI_META_KEY = "ui/resourceUri";
var RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
var App = class extends Protocol {
  /**
   * Create a new MCP App instance.
   *
   * @param _appInfo - App identification (name and version)
   * @param _capabilities - Features and capabilities this app provides
   * @param options - Configuration options including `autoResize` behavior
   *
   * @example
   * ```ts source="./app.examples.ts#App_constructor_basic"
   * const app = new App(
   *   { name: "MyApp", version: "1.0.0" },
   *   { tools: { listChanged: true } }, // capabilities
   *   { autoResize: true }, // options
   * );
   * ```
   */
  constructor(_appInfo, _capabilities = {}, options = { autoResize: true }) {
    super(options);
    this._appInfo = _appInfo;
    this._capabilities = _capabilities;
    this.options = options;
    this.setRequestHandler(PingRequestSchema, (request) => {
      console.log("Received ping:", request.params);
      return {};
    });
    this.onhostcontextchanged = () => {
    };
  }
  _hostCapabilities;
  _hostInfo;
  _hostContext;
  /**
   * Get the host's capabilities discovered during initialization.
   *
   * Returns the capabilities that the host advertised during the
   * {@link connect `connect`} handshake. Returns `undefined` if called before
   * connection is established.
   *
   * @returns Host capabilities, or `undefined` if not yet connected
   *
   * @example Check host capabilities after connection
   * ```ts source="./app.examples.ts#App_getHostCapabilities_checkAfterConnection"
   * await app.connect();
   * if (app.getHostCapabilities()?.serverTools) {
   *   console.log("Host supports server tool calls");
   * }
   * ```
   *
   * @see {@link connect `connect`} for the initialization handshake
   * @see {@link McpUiHostCapabilities `McpUiHostCapabilities`} for the capabilities structure
   */
  getHostCapabilities() {
    return this._hostCapabilities;
  }
  /**
   * Get the host's implementation info discovered during initialization.
   *
   * Returns the host's name and version as advertised during the
   * {@link connect `connect`} handshake. Returns `undefined` if called before
   * connection is established.
   *
   * @returns Host implementation info, or `undefined` if not yet connected
   *
   * @example Log host information after connection
   * ```ts source="./app.examples.ts#App_getHostVersion_logAfterConnection"
   * await app.connect(transport);
   * const { name, version } = app.getHostVersion() ?? {};
   * console.log(`Connected to ${name} v${version}`);
   * ```
   *
   * @see {@link connect `connect`} for the initialization handshake
   */
  getHostVersion() {
    return this._hostInfo;
  }
  /**
   * Get the host context discovered during initialization.
   *
   * Returns the host context that was provided in the initialization response,
   * including tool info, theme, locale, and other environment details.
   * This context is automatically updated when the host sends
   * `ui/notifications/host-context-changed` notifications.
   *
   * Returns `undefined` if called before connection is established.
   *
   * @returns Host context, or `undefined` if not yet connected
   *
   * @example Access host context after connection
   * ```ts source="./app.examples.ts#App_getHostContext_accessAfterConnection"
   * await app.connect(transport);
   * const context = app.getHostContext();
   * if (context?.theme === "dark") {
   *   document.body.classList.add("dark-theme");
   * }
   * if (context?.toolInfo) {
   *   console.log("Tool:", context.toolInfo.tool.name);
   * }
   * ```
   *
   * @see {@link connect `connect`} for the initialization handshake
   * @see {@link onhostcontextchanged `onhostcontextchanged`} for context change notifications
   * @see {@link McpUiHostContext `McpUiHostContext`} for the context structure
   */
  getHostContext() {
    return this._hostContext;
  }
  /**
   * Convenience handler for receiving complete tool input from the host.
   *
   * Set this property to register a handler that will be called when the host
   * sends a tool's complete arguments. This is sent after a tool call begins
   * and before the tool result is available.
   *
   * This setter is a convenience wrapper around `setNotificationHandler()` that
   * automatically handles the notification schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing notifications.
   *
   * @param callback - Function called with the tool input params ({@link McpUiToolInputNotification.params `McpUiToolInputNotification.params`})
   *
   * @example
   * ```ts source="./app.examples.ts#App_ontoolinput_setter"
   * // Register before connecting to ensure no notifications are missed
   * app.ontoolinput = (params) => {
   *   console.log("Tool:", params.arguments);
   *   // Update your UI with the tool arguments
   * };
   * await app.connect();
   * ```
   *
   * @see {@link setNotificationHandler `setNotificationHandler`} for the underlying method
   * @see {@link McpUiToolInputNotification `McpUiToolInputNotification`} for the notification structure
   */
  set ontoolinput(callback) {
    this.setNotificationHandler(
      McpUiToolInputNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Convenience handler for receiving streaming partial tool input from the host.
   *
   * Set this property to register a handler that will be called as the host
   * streams partial tool arguments during tool call initialization. This enables
   * progressive rendering of tool arguments before they're complete.
   *
   * **Important:** Partial arguments are "healed" JSON — the host closes unclosed
   * brackets/braces to produce valid JSON. This means objects may be incomplete
   * (e.g., the last item in an array may be truncated). Use partial data only
   * for preview UI, not for critical operations.
   *
   * This setter is a convenience wrapper around `setNotificationHandler()` that
   * automatically handles the notification schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing notifications.
   *
   * @param callback - Function called with each partial tool input update ({@link McpUiToolInputPartialNotification.params `McpUiToolInputPartialNotification.params`})
   *
   * @example Progressive rendering of tool arguments
   * ```ts source="./app.examples.ts#App_ontoolinputpartial_progressiveRendering"
   * const codePreview = document.querySelector<HTMLPreElement>("#code-preview")!;
   * const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
   *
   * app.ontoolinputpartial = (params) => {
   *   codePreview.textContent = (params.arguments?.code as string) ?? "";
   *   codePreview.style.display = "block";
   *   canvas.style.display = "none";
   * };
   *
   * app.ontoolinput = (params) => {
   *   codePreview.style.display = "none";
   *   canvas.style.display = "block";
   *   render(params.arguments?.code as string);
   * };
   * ```
   *
   * @see {@link setNotificationHandler `setNotificationHandler`} for the underlying method
   * @see {@link McpUiToolInputPartialNotification `McpUiToolInputPartialNotification`} for the notification structure
   * @see {@link ontoolinput `ontoolinput`} for the complete tool input handler
   */
  set ontoolinputpartial(callback) {
    this.setNotificationHandler(
      McpUiToolInputPartialNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Convenience handler for receiving tool execution results from the host.
   *
   * Set this property to register a handler that will be called when the host
   * sends the result of a tool execution. This is sent after the tool completes
   * on the MCP server, allowing your app to display the results or update its state.
   *
   * This setter is a convenience wrapper around `setNotificationHandler()` that
   * automatically handles the notification schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing notifications.
   *
   * @param callback - Function called with the tool result ({@link McpUiToolResultNotification.params `McpUiToolResultNotification.params`})
   *
   * @example Display tool execution results
   * ```ts source="./app.examples.ts#App_ontoolresult_displayResults"
   * app.ontoolresult = (params) => {
   *   if (params.isError) {
   *     console.error("Tool execution failed:", params.content);
   *   } else if (params.content) {
   *     console.log("Tool output:", params.content);
   *   }
   * };
   * ```
   *
   * @see {@link setNotificationHandler `setNotificationHandler`} for the underlying method
   * @see {@link McpUiToolResultNotification `McpUiToolResultNotification`} for the notification structure
   * @see {@link ontoolinput `ontoolinput`} for the initial tool input handler
   */
  set ontoolresult(callback) {
    this.setNotificationHandler(
      McpUiToolResultNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Convenience handler for receiving tool cancellation notifications from the host.
   *
   * Set this property to register a handler that will be called when the host
   * notifies that tool execution was cancelled. This can occur for various reasons
   * including user action, sampling error, classifier intervention, or other
   * interruptions. Apps should update their state and display appropriate feedback.
   *
   * This setter is a convenience wrapper around `setNotificationHandler()` that
   * automatically handles the notification schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing notifications.
   *
   * @param callback - Function called when tool execution is cancelled. Receives optional cancellation reason — see {@link McpUiToolCancelledNotification.params `McpUiToolCancelledNotification.params`}.
   *
   * @example Handle tool cancellation
   * ```ts source="./app.examples.ts#App_ontoolcancelled_handleCancellation"
   * app.ontoolcancelled = (params) => {
   *   console.log("Tool cancelled:", params.reason);
   *   // Update your UI to show cancellation state
   * };
   * ```
   *
   * @see {@link setNotificationHandler `setNotificationHandler`} for the underlying method
   * @see {@link McpUiToolCancelledNotification `McpUiToolCancelledNotification`} for the notification structure
   * @see {@link ontoolresult `ontoolresult`} for successful tool completion
   */
  set ontoolcancelled(callback) {
    this.setNotificationHandler(
      McpUiToolCancelledNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Convenience handler for host context changes (theme, locale, etc.).
   *
   * Set this property to register a handler that will be called when the host's
   * context changes, such as theme switching (light/dark), locale changes, or
   * other environmental updates. Apps should respond by updating their UI
   * accordingly.
   *
   * This setter is a convenience wrapper around `setNotificationHandler()` that
   * automatically handles the notification schema and extracts the params for you.
   *
   * Notification params are automatically merged into the internal host context
   * before the callback is invoked. This means {@link getHostContext `getHostContext`} will
   * return the updated values even before your callback runs.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing notifications.
   *
   * @param callback - Function called with the updated host context
   *
   * @example Respond to theme changes
   * ```ts source="./app.examples.ts#App_onhostcontextchanged_respondToTheme"
   * app.onhostcontextchanged = (ctx) => {
   *   if (ctx.theme === "dark") {
   *     document.body.classList.add("dark-theme");
   *   } else {
   *     document.body.classList.remove("dark-theme");
   *   }
   * };
   * ```
   *
   * @see {@link setNotificationHandler `setNotificationHandler`} for the underlying method
   * @see {@link McpUiHostContextChangedNotification `McpUiHostContextChangedNotification`} for the notification structure
   * @see {@link McpUiHostContext `McpUiHostContext`} for the full context structure
   */
  set onhostcontextchanged(callback) {
    this.setNotificationHandler(
      McpUiHostContextChangedNotificationSchema,
      (n) => {
        this._hostContext = { ...this._hostContext, ...n.params };
        callback(n.params);
      }
    );
  }
  /**
   * Convenience handler for graceful shutdown requests from the host.
   *
   * Set this property to register a handler that will be called when the host
   * requests the app to prepare for teardown. This allows the app to perform
   * cleanup operations (save state, close connections, etc.) before being unmounted.
   *
   * The handler can be sync or async. The host will wait for the returned promise
   * to resolve before proceeding with teardown.
   *
   * This setter is a convenience wrapper around `setRequestHandler()` that
   * automatically handles the request schema.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing requests.
   *
   * @param callback - Function called when teardown is requested.
   *   Must return `McpUiResourceTeardownResult` (can be an empty object `{}`) or a Promise resolving to it.
   *
   * @example Perform cleanup before teardown
   * ```ts source="./app.examples.ts#App_onteardown_performCleanup"
   * app.onteardown = async () => {
   *   await saveState();
   *   closeConnections();
   *   console.log("App ready for teardown");
   *   return {};
   * };
   * ```
   *
   * @see {@link setRequestHandler `setRequestHandler`} for the underlying method
   * @see {@link McpUiResourceTeardownRequest `McpUiResourceTeardownRequest`} for the request structure
   */
  set onteardown(callback) {
    this.setRequestHandler(
      McpUiResourceTeardownRequestSchema,
      (request, extra) => callback(request.params, extra)
    );
  }
  /**
   * Convenience handler for tool call requests from the host.
   *
   * Set this property to register a handler that will be called when the host
   * requests this app to execute a tool. This enables apps to provide their own
   * tools that can be called by the host or LLM.
   *
   * The app must declare tool capabilities in the constructor to use this handler.
   *
   * This setter is a convenience wrapper around `setRequestHandler()` that
   * automatically handles the request schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing requests.
   *
   * @param callback - Async function that executes the tool and returns the result.
   *   The callback will only be invoked if the app declared tool capabilities
   *   in the constructor.
   *
   * @example Handle tool calls from the host
   * ```ts source="./app.examples.ts#App_oncalltool_handleFromHost"
   * app.oncalltool = async (params, extra) => {
   *   if (params.name === "greet") {
   *     const name = params.arguments?.name ?? "World";
   *     return { content: [{ type: "text", text: `Hello, ${name}!` }] };
   *   }
   *   throw new Error(`Unknown tool: ${params.name}`);
   * };
   * ```
   *
   * @see {@link setRequestHandler `setRequestHandler`} for the underlying method
   */
  set oncalltool(callback) {
    this.setRequestHandler(
      CallToolRequestSchema,
      (request, extra) => callback(request.params, extra)
    );
  }
  /**
   * Convenience handler for listing available tools.
   *
   * Set this property to register a handler that will be called when the host
   * requests a list of tools this app provides. This enables dynamic tool
   * discovery by the host or LLM.
   *
   * The app must declare tool capabilities in the constructor to use this handler.
   *
   * This setter is a convenience wrapper around `setRequestHandler()` that
   * automatically handles the request schema and extracts the params for you.
   *
   * Register handlers before calling {@link connect `connect`} to avoid missing requests.
   *
   * @param callback - Async function that returns tool names as strings (simplified
   *   from full `ListToolsResult` with `Tool` objects). Registration is always
   *   allowed; capability validation occurs when handlers are invoked.
   *
   * @example Return available tools
   * ```ts source="./app.examples.ts#App_onlisttools_returnTools"
   * app.onlisttools = async (params, extra) => {
   *   return {
   *     tools: ["greet", "calculate", "format"],
   *   };
   * };
   * ```
   *
   * @see {@link setRequestHandler `setRequestHandler`} for the underlying method
   * @see {@link oncalltool `oncalltool`} for handling tool execution
   */
  set onlisttools(callback) {
    this.setRequestHandler(
      ListToolsRequestSchema,
      (request, extra) => callback(request.params, extra)
    );
  }
  /**
   * Verify that the host supports the capability required for the given request method.
   * @internal
   */
  assertCapabilityForMethod(method) {
  }
  /**
   * Verify that the app declared the capability required for the given request method.
   * @internal
   */
  assertRequestHandlerCapability(method) {
    switch (method) {
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(
            `Client does not support tool capability (required for ${method})`
          );
        }
        return;
      case "ping":
      case "ui/resource-teardown":
        return;
      default:
        throw new Error(`No handler for method ${method} registered`);
    }
  }
  /**
   * Verify that the app supports the capability required for the given notification method.
   * @internal
   */
  assertNotificationCapability(method) {
  }
  /**
   * Verify that task creation is supported for the given request method.
   * @internal
   */
  assertTaskCapability(_method) {
    throw new Error("Tasks are not supported in MCP Apps");
  }
  /**
   * Verify that task handler is supported for the given method.
   * @internal
   */
  assertTaskHandlerCapability(_method) {
    throw new Error("Task handlers are not supported in MCP Apps");
  }
  /**
   * Call a tool on the originating MCP server (proxied through the host).
   *
   * Apps can call tools to fetch fresh data or trigger server-side actions.
   * The host proxies the request to the actual MCP server and returns the result.
   *
   * @param params - Tool name and arguments
   * @param options - Request options (timeout, etc.)
   * @returns Tool execution result
   *
   * @throws {Error} If the tool does not exist on the server
   * @throws {Error} If the request times out or the connection is lost
   * @throws {Error} If the host rejects the request
   *
   * Note: Tool-level execution errors are returned in the result with `isError: true`
   * rather than throwing exceptions. Always check `result.isError` to distinguish
   * between transport failures (thrown) and tool execution failures (returned).
   *
   * @example Fetch updated weather data
   * ```ts source="./app.examples.ts#App_callServerTool_fetchWeather"
   * try {
   *   const result = await app.callServerTool({
   *     name: "get_weather",
   *     arguments: { location: "Tokyo" },
   *   });
   *   if (result.isError) {
   *     console.error("Tool returned error:", result.content);
   *   } else {
   *     console.log(result.content);
   *   }
   * } catch (error) {
   *   console.error("Tool call failed:", error);
   * }
   * ```
   */
  async callServerTool(params, options) {
    if (typeof params === "string") {
      throw new Error(
        `callServerTool() expects an object as its first argument, but received a string ("${params}"). Did you mean: callServerTool({ name: "${params}", arguments: { ... } })?`
      );
    }
    return await this.request(
      { method: "tools/call", params },
      CallToolResultSchema2,
      options
    );
  }
  /**
   * Read a resource from the originating MCP server (proxied through the host).
   *
   * Apps can read resources to access files, data, or other content provided by
   * the MCP server. Resources are identified by URI (e.g., `file:///path/to/file`
   * or custom schemes like `videos://bunny-1mb`). The host proxies the request to
   * the actual MCP server and returns the resource content.
   *
   * @param params - Resource URI to read
   * @param options - Request options (timeout, etc.)
   * @returns Resource content with URI, name, description, mimeType, and contents array
   *
   * @throws {Error} If the resource does not exist on the server
   * @throws {Error} If the request times out or the connection is lost
   * @throws {Error} If the host rejects the request
   *
   * @example Read a video resource and play it
   * ```ts source="./app.examples.ts#App_readServerResource_playVideo"
   * try {
   *   const result = await app.readServerResource({
   *     uri: "videos://bunny-1mb",
   *   });
   *   const content = result.contents[0];
   *   if (content && "blob" in content) {
   *     const binary = Uint8Array.from(atob(content.blob), (c) =>
   *       c.charCodeAt(0),
   *     );
   *     const url = URL.createObjectURL(
   *       new Blob([binary], { type: content.mimeType || "video/mp4" }),
   *     );
   *     videoElement.src = url;
   *     videoElement.play();
   *   }
   * } catch (error) {
   *   console.error("Failed to read resource:", error);
   * }
   * ```
   *
   * @see {@link listServerResources `listServerResources`} to discover available resources
   */
  async readServerResource(params, options) {
    return await this.request(
      { method: "resources/read", params },
      ReadResourceResultSchema,
      options
    );
  }
  /**
   * List available resources from the originating MCP server (proxied through the host).
   *
   * Apps can list resources to discover what content is available on the MCP server.
   * This enables dynamic resource discovery and building resource browsers or pickers.
   * The host proxies the request to the actual MCP server and returns the resource list.
   *
   * Results may be paginated using the `cursor` parameter for servers with many resources.
   *
   * @param params - Optional parameters (omit for all resources, or `{ cursor }` for pagination)
   * @param options - Request options (timeout, etc.)
   * @returns List of resources with their URIs, names, descriptions, mimeTypes, and optional pagination cursor
   *
   * @throws {Error} If the request times out or the connection is lost
   * @throws {Error} If the host rejects the request
   *
   * @example Discover available videos and build a picker UI
   * ```ts source="./app.examples.ts#App_listServerResources_buildPicker"
   * try {
   *   const result = await app.listServerResources();
   *   const videoResources = result.resources.filter((r) =>
   *     r.mimeType?.startsWith("video/"),
   *   );
   *   videoResources.forEach((resource) => {
   *     const option = document.createElement("option");
   *     option.value = resource.uri;
   *     option.textContent = resource.description || resource.name;
   *     selectElement.appendChild(option);
   *   });
   * } catch (error) {
   *   console.error("Failed to list resources:", error);
   * }
   * ```
   *
   * @see {@link readServerResource `readServerResource`} to read a specific resource
   */
  async listServerResources(params, options) {
    return await this.request(
      { method: "resources/list", params },
      ListResourcesResultSchema,
      options
    );
  }
  /**
   * Send a message to the host's chat interface.
   *
   * Enables the app to add messages to the conversation thread. Useful for
   * user-initiated messages or app-to-conversation communication.
   *
   * @param params - Message role and content
   * @param options - Request options (timeout, etc.)
   * @returns Result with optional `isError` flag indicating host rejection
   *
   * @throws {Error} If the request times out or the connection is lost
   *
   * @example Send a text message from user interaction
   * ```ts source="./app.examples.ts#App_sendMessage_textFromInteraction"
   * try {
   *   const result = await app.sendMessage({
   *     role: "user",
   *     content: [{ type: "text", text: "Show me details for item #42" }],
   *   });
   *   if (result.isError) {
   *     console.error("Host rejected the message");
   *     // Handle rejection appropriately for your app
   *   }
   * } catch (error) {
   *   console.error("Failed to send message:", error);
   *   // Handle transport/protocol error
   * }
   * ```
   *
   * @example Send follow-up message after offloading large data to model context
   * ```ts source="./app.examples.ts#App_sendMessage_withLargeContext"
   * const markdown = `---
   * word-count: ${fullTranscript.split(/\s+/).length}
   * speaker-names: ${speakerNames.join(", ")}
   * ---
   *
   * ${fullTranscript}`;
   *
   * // Offload long transcript to model context
   * await app.updateModelContext({ content: [{ type: "text", text: markdown }] });
   *
   * // Send brief trigger message
   * await app.sendMessage({
   *   role: "user",
   *   content: [{ type: "text", text: "Summarize the key points" }],
   * });
   * ```
   *
   * @see {@link McpUiMessageRequest `McpUiMessageRequest`} for request structure
   */
  sendMessage(params, options) {
    return this.request(
      {
        method: "ui/message",
        params
      },
      McpUiMessageResultSchema,
      options
    );
  }
  /**
   * Send log messages to the host for debugging and telemetry.
   *
   * Logs are not added to the conversation but may be recorded by the host
   * for debugging purposes.
   *
   * @param params - Log level and message
   *
   * @example Log app state for debugging
   * ```ts source="./app.examples.ts#App_sendLog_debugState"
   * app.sendLog({
   *   level: "info",
   *   data: "Weather data refreshed",
   *   logger: "WeatherApp",
   * });
   * ```
   *
   * @returns Promise that resolves when the log notification is sent
   */
  sendLog(params) {
    return this.notification({
      method: "notifications/message",
      params
    });
  }
  /**
   * Update the host's model context with app state.
   *
   * Context updates are intended to be available to the model in future
   * turns, without triggering an immediate model response (unlike {@link sendMessage `sendMessage`}).
   *
   * The host will typically defer sending the context to the model until the
   * next user message — either from the actual user or via `sendMessage`. Only
   * the last update is sent; each call overwrites any previous context.
   *
   * @param params - Context content and/or structured content
   * @param options - Request options (timeout, etc.)
   *
   * @throws {Error} If the host rejects the context update (e.g., unsupported content type)
   * @throws {Error} If the request times out or the connection is lost
   *
   * @example Update model context with current app state
   * ```ts source="./app.examples.ts#App_updateModelContext_appState"
   * const markdown = `---
   * item-count: ${itemList.length}
   * total-cost: ${totalCost}
   * currency: ${currency}
   * ---
   *
   * User is viewing their shopping cart with ${itemList.length} items selected:
   *
   * ${itemList.map((item) => `- ${item}`).join("\n")}`;
   *
   * await app.updateModelContext({
   *   content: [{ type: "text", text: markdown }],
   * });
   * ```
   *
   * @example Report runtime error to model
   * ```ts source="./app.examples.ts#App_updateModelContext_reportError"
   * try {
   *   const _stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   *   // ... use _stream for transcription
   * } catch (err) {
   *   // Inform the model that the app is in a degraded state
   *   await app.updateModelContext({
   *     content: [
   *       {
   *         type: "text",
   *         text: "Error: transcription unavailable",
   *       },
   *     ],
   *   });
   * }
   * ```
   *
   * @returns Promise that resolves when the context update is acknowledged
   */
  updateModelContext(params, options) {
    return this.request(
      {
        method: "ui/update-model-context",
        params
      },
      EmptyResultSchema,
      options
    );
  }
  /**
   * Request the host to open an external URL in the default browser.
   *
   * The host may deny this request based on user preferences or security policy.
   * Apps should handle rejection gracefully by checking `result.isError`.
   *
   * @param params - URL to open
   * @param options - Request options (timeout, etc.)
   * @returns Result with `isError: true` if the host denied the request (e.g., blocked domain, user cancelled)
   *
   * @throws {Error} If the request times out or the connection is lost
   *
   * @example Open documentation link
   * ```ts source="./app.examples.ts#App_openLink_documentation"
   * const { isError } = await app.openLink({ url: "https://docs.example.com" });
   * if (isError) {
   *   // Host denied the request (e.g., blocked domain, user cancelled)
   *   // Optionally show fallback: display URL for manual copy
   *   console.warn("Link request denied");
   * }
   * ```
   *
   * @see {@link McpUiOpenLinkRequest `McpUiOpenLinkRequest`} for request structure
   * @see {@link McpUiOpenLinkResult `McpUiOpenLinkResult`} for result structure
   */
  openLink(params, options) {
    return this.request(
      {
        method: "ui/open-link",
        params
      },
      McpUiOpenLinkResultSchema,
      options
    );
  }
  /** @deprecated Use {@link openLink `openLink`} instead */
  sendOpenLink = this.openLink;
  /**
   * Request the host to download a file.
   *
   * Since MCP Apps run in sandboxed iframes where direct downloads are blocked,
   * this provides a host-mediated mechanism for file exports. The host will
   * typically show a confirmation dialog before initiating the download.
   *
   * Uses standard MCP resource types: `EmbeddedResource` for inline content
   * and `ResourceLink` for content the host can fetch directly.
   *
   * @param params - Resource contents to download
   * @param options - Request options (timeout, etc.)
   * @returns Result with `isError: true` if the host denied the request (e.g., user cancelled)
   *
   * @throws {Error} If the request times out or the connection is lost
   *
   * @example Download a JSON file (embedded text resource)
   * ```ts
   * const data = JSON.stringify({ items: selectedItems }, null, 2);
   * const { isError } = await app.downloadFile({
   *   contents: [{
   *     type: "resource",
   *     resource: {
   *       uri: "file:///export.json",
   *       mimeType: "application/json",
   *       text: data,
   *     },
   *   }],
   * });
   * if (isError) {
   *   console.warn("Download denied or cancelled");
   * }
   * ```
   *
   * @example Download binary content (embedded blob resource)
   * ```ts
   * const { isError } = await app.downloadFile({
   *   contents: [{
   *     type: "resource",
   *     resource: {
   *       uri: "file:///image.png",
   *       mimeType: "image/png",
   *       blob: base64EncodedPng,
   *     },
   *   }],
   * });
   * ```
   *
   * @example Download via resource link (host fetches)
   * ```ts
   * const { isError } = await app.downloadFile({
   *   contents: [{
   *     type: "resource_link",
   *     uri: "https://api.example.com/reports/q4.pdf",
   *     name: "Q4 Report",
   *     mimeType: "application/pdf",
   *   }],
   * });
   * ```
   *
   * @see {@link McpUiDownloadFileRequest `McpUiDownloadFileRequest`} for request structure
   * @see {@link McpUiDownloadFileResult `McpUiDownloadFileResult`} for result structure
   */
  downloadFile(params, options) {
    return this.request(
      {
        method: "ui/download-file",
        params
      },
      McpUiDownloadFileResultSchema,
      options
    );
  }
  /**
   * Request a change to the display mode.
   *
   * Requests the host to change the UI container to the specified display mode
   * (e.g., "inline", "fullscreen", "pip"). The host will respond with the actual
   * display mode that was set, which may differ from the requested mode if
   * the requested mode is not available (check `availableDisplayModes` in host context).
   *
   * @param params - The display mode being requested
   * @param options - Request options (timeout, etc.)
   * @returns Result containing the actual display mode that was set
   *
   * @example Toggle display mode
   * ```ts source="./app.examples.ts#App_requestDisplayMode_toggle"
   * const container = document.getElementById("main")!;
   * const ctx = app.getHostContext();
   * const newMode = ctx?.displayMode === "inline" ? "fullscreen" : "inline";
   * if (ctx?.availableDisplayModes?.includes(newMode)) {
   *   const result = await app.requestDisplayMode({ mode: newMode });
   *   container.classList.toggle("fullscreen", result.mode === "fullscreen");
   * }
   * ```
   *
   * @see {@link McpUiRequestDisplayModeRequest `McpUiRequestDisplayModeRequest`} for request structure
   * @see {@link McpUiHostContext `McpUiHostContext`} for checking availableDisplayModes
   */
  requestDisplayMode(params, options) {
    return this.request(
      {
        method: "ui/request-display-mode",
        params
      },
      McpUiRequestDisplayModeResultSchema,
      options
    );
  }
  /**
   * Notify the host of UI size changes.
   *
   * Apps can manually report size changes to help the host adjust the container.
   * If `autoResize` is enabled (default), this is called automatically.
   *
   * @param params - New width and height in pixels
   *
   * @example Manually notify host of size change
   * ```ts source="./app.examples.ts#App_sendSizeChanged_manual"
   * app.sendSizeChanged({
   *   width: 400,
   *   height: 600,
   * });
   * ```
   *
   * @returns Promise that resolves when the notification is sent
   *
   * @see {@link McpUiSizeChangedNotification `McpUiSizeChangedNotification`} for notification structure
   */
  sendSizeChanged(params) {
    return this.notification({
      method: "ui/notifications/size-changed",
      params
    });
  }
  /**
   * Set up automatic size change notifications using ResizeObserver.
   *
   * Observes both `document.documentElement` and `document.body` for size changes
   * and automatically sends `ui/notifications/size-changed` notifications to the host.
   * The notifications are debounced using requestAnimationFrame to avoid duplicates.
   *
   * Note: This method is automatically called by `connect()` if the `autoResize`
   * option is true (default). You typically don't need to call this manually unless
   * you disabled autoResize and want to enable it later.
   *
   * @returns Cleanup function to disconnect the observer
   *
   * @example Manual setup for custom scenarios
   * ```ts source="./app.examples.ts#App_setupAutoResize_manual"
   * const app = new App(
   *   { name: "MyApp", version: "1.0.0" },
   *   {},
   *   { autoResize: false },
   * );
   * await app.connect(transport);
   *
   * // Later, enable auto-resize manually
   * const cleanup = app.setupSizeChangedNotifications();
   *
   * // Clean up when done
   * cleanup();
   * ```
   */
  setupSizeChangedNotifications() {
    let scheduled = false;
    let lastWidth = 0;
    let lastHeight = 0;
    const sendBodySizeChanged = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const html = document.documentElement;
        const originalWidth = html.style.width;
        const originalHeight = html.style.height;
        html.style.width = "fit-content";
        html.style.height = "max-content";
        const rect = html.getBoundingClientRect();
        html.style.width = originalWidth;
        html.style.height = originalHeight;
        const scrollbarWidth = window.innerWidth - html.clientWidth;
        const width = Math.ceil(rect.width + scrollbarWidth);
        const height = Math.ceil(rect.height);
        if (width !== lastWidth || height !== lastHeight) {
          lastWidth = width;
          lastHeight = height;
          this.sendSizeChanged({ width, height });
        }
      });
    };
    sendBodySizeChanged();
    const resizeObserver = new ResizeObserver(sendBodySizeChanged);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }
  /**
   * Establish connection with the host and perform initialization handshake.
   *
   * This method performs the following steps:
   * 1. Connects the transport layer
   * 2. Sends `ui/initialize` request with app info and capabilities
   * 3. Receives host capabilities and context in response
   * 4. Sends `ui/notifications/initialized` notification
   * 5. Sets up auto-resize using {@link setupSizeChangedNotifications `setupSizeChangedNotifications`} if enabled (default)
   *
   * If initialization fails, the connection is automatically closed and an error
   * is thrown.
   *
   * @param transport - Transport layer (typically {@link PostMessageTransport `PostMessageTransport`})
   * @param options - Request options for the initialize request
   *
   * @throws {Error} If initialization fails or connection is lost
   *
   * @example Connect with PostMessageTransport
   * ```ts source="./app.examples.ts#App_connect_withPostMessageTransport"
   * const app = new App({ name: "MyApp", version: "1.0.0" }, {});
   *
   * try {
   *   await app.connect(new PostMessageTransport(window.parent, window.parent));
   *   console.log("Connected successfully!");
   * } catch (error) {
   *   console.error("Failed to connect:", error);
   * }
   * ```
   *
   * @see {@link McpUiInitializeRequest `McpUiInitializeRequest`} for the initialization request structure
   * @see {@link McpUiInitializedNotification `McpUiInitializedNotification`} for the initialized notification
   * @see {@link PostMessageTransport `PostMessageTransport`} for the typical transport implementation
   */
  async connect(transport = new PostMessageTransport(
    window.parent,
    window.parent
  ), options) {
    if (this.transport) {
      throw new Error(
        "App is already connected. Call close() before connecting again."
      );
    }
    await super.connect(transport);
    try {
      const result = await this.request(
        {
          method: "ui/initialize",
          params: {
            appCapabilities: this._capabilities,
            appInfo: this._appInfo,
            protocolVersion: LATEST_PROTOCOL_VERSION
          }
        },
        McpUiInitializeResultSchema,
        options
      );
      if (result === void 0) {
        throw new Error(`Server sent invalid initialize result: ${result}`);
      }
      this._hostCapabilities = result.hostCapabilities;
      this._hostInfo = result.hostInfo;
      this._hostContext = result.hostContext;
      await this.notification({
        method: "ui/notifications/initialized"
      });
      if (this.options?.autoResize) {
        this.setupSizeChangedNotifications();
      }
    } catch (error) {
      void this.close();
      throw error;
    }
  }
};

// node_modules/@modelcontextprotocol/ext-apps/src/app-bridge.ts
import {
  CallToolRequestSchema as CallToolRequestSchema2,
  CallToolResultSchema as CallToolResultSchema3,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
  ListResourcesRequestSchema,
  ListResourcesResultSchema as ListResourcesResultSchema2,
  ListResourceTemplatesRequestSchema,
  ListResourceTemplatesResultSchema,
  LoggingMessageNotificationSchema,
  PingRequestSchema as PingRequestSchema2,
  PromptListChangedNotificationSchema,
  ReadResourceRequestSchema,
  ReadResourceResultSchema as ReadResourceResultSchema2,
  ResourceListChangedNotificationSchema,
  ToolListChangedNotificationSchema
} from "./mcp-sdk-types.js";
import {
  Protocol as Protocol2
} from "./mcp-sdk-shared.js";
function getToolUiResourceUri(tool) {
  const uiMeta = tool._meta?.ui;
  let uri = uiMeta?.resourceUri;
  if (uri === void 0) {
    uri = tool._meta?.[RESOURCE_URI_META_KEY];
  }
  if (typeof uri === "string" && uri.startsWith("ui://")) {
    return uri;
  } else if (uri !== void 0) {
    throw new Error(`Invalid UI resource URI: ${JSON.stringify(uri)}`);
  }
  return void 0;
}
function isToolVisibilityModelOnly(tool) {
  const uiMeta = tool._meta?.ui;
  const visibility = uiMeta?.visibility;
  if (!visibility) return false;
  if (visibility.length === 1 && visibility[0] === "model") return true;
  return false;
}
function isToolVisibilityAppOnly(tool) {
  const uiMeta = tool._meta?.ui;
  const visibility = uiMeta?.visibility;
  if (!visibility) return false;
  if (visibility.length === 1 && visibility[0] === "app") return true;
  return false;
}
function buildAllowAttribute(permissions) {
  if (!permissions) return "";
  const allowList = [];
  if (permissions.camera) allowList.push("camera");
  if (permissions.microphone) allowList.push("microphone");
  if (permissions.geolocation) allowList.push("geolocation");
  if (permissions.clipboardWrite) allowList.push("clipboard-write");
  return allowList.join("; ");
}
var SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION];
var AppBridge = class extends Protocol2 {
  /**
   * Create a new AppBridge instance.
   *
   * @param _client - MCP client connected to the server, or `null`. When provided,
   *   {@link connect `connect`} will automatically set up forwarding of MCP requests/notifications
   *   between the View and the server. When `null`, you must register handlers
   *   manually using the {@link oncalltool `oncalltool`}, {@link onlistresources `onlistresources`}, etc. setters.
   * @param _hostInfo - Host application identification (name and version)
   * @param _capabilities - Features and capabilities the host supports
   * @param options - Configuration options (inherited from Protocol)
   *
   * @example With MCP client (automatic forwarding)
   * ```ts source="./app-bridge.examples.ts#AppBridge_constructor_withMcpClient"
   * const bridge = new AppBridge(
   *   mcpClient,
   *   { name: "MyHost", version: "1.0.0" },
   *   { openLinks: {}, serverTools: {}, logging: {} },
   * );
   * ```
   *
   * @example Without MCP client (manual handlers)
   * ```ts source="./app-bridge.examples.ts#AppBridge_constructor_withoutMcpClient"
   * const bridge = new AppBridge(
   *   null,
   *   { name: "MyHost", version: "1.0.0" },
   *   { openLinks: {}, serverTools: {}, logging: {} },
   * );
   * bridge.oncalltool = async (params, extra) => {
   *   // Handle tool calls manually
   *   return { content: [] };
   * };
   * ```
   */
  constructor(_client, _hostInfo, _capabilities, options) {
    super(options);
    this._client = _client;
    this._hostInfo = _hostInfo;
    this._capabilities = _capabilities;
    this._hostContext = options?.hostContext || {};
    this.setRequestHandler(
      McpUiInitializeRequestSchema,
      (request) => this._oninitialize(request)
    );
    this.setRequestHandler(PingRequestSchema2, (request, extra) => {
      this.onping?.(request.params, extra);
      return {};
    });
    this.setRequestHandler(McpUiRequestDisplayModeRequestSchema, (request) => {
      const currentMode = this._hostContext.displayMode ?? "inline";
      return { mode: currentMode };
    });
  }
  _appCapabilities;
  _hostContext = {};
  _appInfo;
  /**
   * Get the view's capabilities discovered during initialization.
   *
   * Returns the capabilities that the view advertised during its
   * initialization request. Returns `undefined` if called before
   * initialization completes.
   *
   * @returns view capabilities, or `undefined` if not yet initialized
   *
   * @example Check view capabilities after initialization
   * ```ts source="./app-bridge.examples.ts#AppBridge_getAppCapabilities_checkAfterInit"
   * bridge.oninitialized = () => {
   *   const caps = bridge.getAppCapabilities();
   *   if (caps?.tools) {
   *     console.log("View provides tools");
   *   }
   * };
   * ```
   *
   * @see {@link McpUiAppCapabilities `McpUiAppCapabilities`} for the capabilities structure
   */
  getAppCapabilities() {
    return this._appCapabilities;
  }
  /**
   * Get the view's implementation info discovered during initialization.
   *
   * Returns the view's name and version as provided in its initialization
   * request. Returns `undefined` if called before initialization completes.
   *
   * @returns view implementation info, or `undefined` if not yet initialized
   *
   * @example Log view information after initialization
   * ```ts source="./app-bridge.examples.ts#AppBridge_getAppVersion_logAfterInit"
   * bridge.oninitialized = () => {
   *   const appInfo = bridge.getAppVersion();
   *   if (appInfo) {
   *     console.log(`View: ${appInfo.name} v${appInfo.version}`);
   *   }
   * };
   * ```
   */
  getAppVersion() {
    return this._appInfo;
  }
  /**
   * Optional handler for ping requests from the view.
   *
   * The View can send standard MCP `ping` requests to verify the connection
   * is alive. The {@link AppBridge `AppBridge`} automatically responds with an empty object, but this
   * handler allows the host to observe or log ping activity.
   *
   * Unlike the other handlers which use setters, this is a direct property
   * assignment. It is optional; if not set, pings are still handled automatically.
   *
   * @param params - Empty params object from the ping request
   * @param extra - Request metadata (abort signal, session info)
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onping_handleRequest"
   * bridge.onping = (params, extra) => {
   *   console.log("Received ping from view");
   * };
   * ```
   */
  onping;
  /**
   * Register a handler for size change notifications from the view.
   *
   * The view sends `ui/notifications/size-changed` when its rendered content
   * size changes, typically via `ResizeObserver`. Set this callback to dynamically
   * adjust the iframe container dimensions based on the view's content.
   *
   * Note: This is for View → Host communication. To notify the View of
   * host container dimension changes, use {@link setHostContext `setHostContext`}.
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onsizechange_handleResize"
   * bridge.onsizechange = ({ width, height }) => {
   *   if (width != null) {
   *     iframe.style.width = `${width}px`;
   *   }
   *   if (height != null) {
   *     iframe.style.height = `${height}px`;
   *   }
   * };
   * ```
   *
   * @see {@link McpUiSizeChangedNotification `McpUiSizeChangedNotification`} for the notification type
   * @see {@link app!App.sendSizeChanged `App.sendSizeChanged`} - the View method that sends these notifications
   */
  set onsizechange(callback) {
    this.setNotificationHandler(
      McpUiSizeChangedNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Register a handler for sandbox proxy ready notifications.
   *
   * This is an internal callback used by web-based hosts implementing the
   * double-iframe sandbox architecture. The sandbox proxy sends
   * `ui/notifications/sandbox-proxy-ready` after it loads and is ready to receive
   * HTML content.
   *
   * When this fires, the host should call {@link sendSandboxResourceReady `sendSandboxResourceReady`} with
   * the HTML content to load into the inner sandboxed iframe.
   *
   * @example
   * ```typescript
   * bridge.onsandboxready = async () => {
   *   const resource = await mcpClient.request(
   *     { method: "resources/read", params: { uri: "ui://my-app" } },
   *     ReadResourceResultSchema
   *   );
   *
   *   bridge.sendSandboxResourceReady({
   *     html: resource.contents[0].text,
   *     sandbox: "allow-scripts"
   *   });
   * };
   * ```
   *
   * @internal
   * @see {@link McpUiSandboxProxyReadyNotification `McpUiSandboxProxyReadyNotification`} for the notification type
   * @see {@link sendSandboxResourceReady `sendSandboxResourceReady`} for sending content to the sandbox
   */
  set onsandboxready(callback) {
    this.setNotificationHandler(
      McpUiSandboxProxyReadyNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Called when the view completes initialization.
   *
   * Set this callback to be notified when the view has finished its
   * initialization handshake and is ready to receive tool input and other data.
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_oninitialized_sendToolInput"
   * bridge.oninitialized = () => {
   *   console.log("View ready");
   *   bridge.sendToolInput({ arguments: toolArgs });
   * };
   * ```
   *
   * @see {@link McpUiInitializedNotification `McpUiInitializedNotification`} for the notification type
   * @see {@link sendToolInput `sendToolInput`} for sending tool arguments to the View
   */
  set oninitialized(callback) {
    this.setNotificationHandler(
      McpUiInitializedNotificationSchema,
      (n) => callback(n.params)
    );
  }
  /**
   * Register a handler for message requests from the view.
   *
   * The view sends `ui/message` requests when it wants to add a message to
   * the host's chat interface. This enables interactive apps to communicate with
   * the user through the conversation thread.
   *
   * The handler should process the message (add it to the chat) and return a
   * result indicating success or failure. For security, the host should NOT
   * return conversation content or follow-up results to prevent information
   * leakage.
   *
   * @param callback - Handler that receives message params and returns a result
   *   - `params.role` - Message role (currently only "user" is supported)
   *   - `params.content` - Message content blocks (text, image, etc.)
   *   - `extra` - Request metadata (abort signal, session info)
   *   - Returns: `Promise<McpUiMessageResult>` with optional `isError` flag
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onmessage_logMessage"
   * bridge.onmessage = async ({ role, content }, extra) => {
   *   try {
   *     await chatManager.addMessage({ role, content, source: "app" });
   *     return {}; // Success
   *   } catch (error) {
   *     console.error("Failed to add message:", error);
   *     return { isError: true };
   *   }
   * };
   * ```
   *
   * @see {@link McpUiMessageRequest `McpUiMessageRequest`} for the request type
   * @see {@link McpUiMessageResult `McpUiMessageResult`} for the result type
   */
  set onmessage(callback) {
    this.setRequestHandler(
      McpUiMessageRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for external link requests from the view.
   *
   * The view sends `ui/open-link` requests when it wants to open an external
   * URL in the host's default browser. The handler should validate the URL and
   * open it according to the host's security policy and user preferences.
   *
   * The host MAY:
   * - Show a confirmation dialog before opening
   * - Block URLs based on a security policy or allowlist
   * - Log the request for audit purposes
   * - Reject the request entirely
   *
   * @param callback - Handler that receives URL params and returns a result
   *   - `params.url` - URL to open in the host's browser
   *   - `extra` - Request metadata (abort signal, session info)
   *   - Returns: `Promise<McpUiOpenLinkResult>` with optional `isError` flag
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onopenlink_handleRequest"
   * bridge.onopenlink = async ({ url }, extra) => {
   *   if (!isAllowedDomain(url)) {
   *     console.warn("Blocked external link:", url);
   *     return { isError: true };
   *   }
   *
   *   const confirmed = await showDialog({
   *     message: `Open external link?\n${url}`,
   *     buttons: ["Open", "Cancel"],
   *   });
   *
   *   if (confirmed) {
   *     window.open(url, "_blank", "noopener,noreferrer");
   *     return {};
   *   }
   *
   *   return { isError: true };
   * };
   * ```
   *
   * @see {@link McpUiOpenLinkRequest `McpUiOpenLinkRequest`} for the request type
   * @see {@link McpUiOpenLinkResult `McpUiOpenLinkResult`} for the result type
   */
  set onopenlink(callback) {
    this.setRequestHandler(
      McpUiOpenLinkRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for file download requests from the View.
   *
   * The View sends `ui/download-file` requests when the user wants to
   * download a file. The params contain an array of MCP resource content
   * items — either `EmbeddedResource` (inline data) or `ResourceLink`
   * (URI the host can fetch). The host should show a confirmation dialog
   * and then trigger the download.
   *
   * @param callback - Handler that receives download params and returns a result
   *   - `params.contents` - Array of `EmbeddedResource` or `ResourceLink` items
   *   - `extra` - Request metadata (abort signal, session info)
   *   - Returns: `Promise<McpUiDownloadFileResult>` with optional `isError` flag
   *
   * @example
   * ```ts
   * bridge.ondownloadfile = async ({ contents }, extra) => {
   *   for (const item of contents) {
   *     if (item.type === "resource") {
   *       // EmbeddedResource — inline content
   *       const res = item.resource;
   *       const blob = res.blob
   *         ? new Blob([Uint8Array.from(atob(res.blob), c => c.charCodeAt(0))], { type: res.mimeType })
   *         : new Blob([res.text ?? ""], { type: res.mimeType });
   *       const url = URL.createObjectURL(blob);
   *       const link = document.createElement("a");
   *       link.href = url;
   *       link.download = res.uri.split("/").pop() ?? "download";
   *       link.click();
   *       URL.revokeObjectURL(url);
   *     } else if (item.type === "resource_link") {
   *       // ResourceLink — host fetches or opens directly
   *       window.open(item.uri, "_blank");
   *     }
   *   }
   *   return {};
   * };
   * ```
   *
   * @see {@link McpUiDownloadFileRequest `McpUiDownloadFileRequest`} for the request type
   * @see {@link McpUiDownloadFileResult `McpUiDownloadFileResult`} for the result type
   */
  set ondownloadfile(callback) {
    this.setRequestHandler(
      McpUiDownloadFileRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for display mode change requests from the view.
   *
   * The view sends `ui/request-display-mode` requests when it wants to change
   * its display mode (e.g., from "inline" to "fullscreen"). The handler should
   * check if the requested mode is in `availableDisplayModes` from the host context,
   * update the display mode if supported, and return the actual mode that was set.
   *
   * If the requested mode is not available, the handler should return the current
   * display mode instead.
   *
   * By default, `AppBridge` returns the current `displayMode` from host context (or "inline").
   * Setting this property replaces that default behavior.
   *
   * @param callback - Handler that receives the requested mode and returns the actual mode set
   *   - `params.mode` - The display mode being requested ("inline" | "fullscreen" | "pip")
   *   - `extra` - Request metadata (abort signal, session info)
   *   - Returns: `Promise<McpUiRequestDisplayModeResult>` with the actual mode set
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onrequestdisplaymode_handleRequest"
   * bridge.onrequestdisplaymode = async ({ mode }, extra) => {
   *   if (availableDisplayModes.includes(mode)) {
   *     currentDisplayMode = mode;
   *   }
   *   return { mode: currentDisplayMode };
   * };
   * ```
   *
   * @see {@link McpUiRequestDisplayModeRequest `McpUiRequestDisplayModeRequest`} for the request type
   * @see {@link McpUiRequestDisplayModeResult `McpUiRequestDisplayModeResult`} for the result type
   */
  set onrequestdisplaymode(callback) {
    this.setRequestHandler(
      McpUiRequestDisplayModeRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for logging messages from the view.
   *
   * The view sends standard MCP `notifications/message` (logging) notifications
   * to report debugging information, errors, warnings, and other telemetry to the
   * host. The host can display these in a console, log them to a file, or send
   * them to a monitoring service.
   *
   * This uses the standard MCP logging notification format, not a UI-specific
   * message type.
   *
   * @param callback - Handler that receives logging params
   *   - `params.level` - Log level: "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency"
   *   - `params.logger` - Optional logger name/identifier
   *   - `params.data` - Log message and optional structured data
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onloggingmessage_handleLog"
   * bridge.onloggingmessage = ({ level, logger, data }) => {
   *   console[level === "error" ? "error" : "log"](
   *     `[${logger ?? "View"}] ${level.toUpperCase()}:`,
   *     data,
   *   );
   * };
   * ```
   */
  set onloggingmessage(callback) {
    this.setNotificationHandler(
      LoggingMessageNotificationSchema,
      async (notification) => {
        callback(notification.params);
      }
    );
  }
  /**
   * Register a handler for model context updates from the view.
   *
   * The view sends `ui/update-model-context` requests to update the Host's
   * model context. Each request overwrites the previous context stored by the view.
   * Unlike logging messages, context updates are intended to be available to
   * the model in future turns. Unlike messages, context updates do not trigger follow-ups.
   *
   * The host will typically defer sending the context to the model until the
   * next user message (including `ui/message`), and will only send the last
   * update received.
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onupdatemodelcontext_storeContext"
   * bridge.onupdatemodelcontext = async (
   *   { content, structuredContent },
   *   extra,
   * ) => {
   *   // Store the context snapshot for inclusion in the next model request
   *   modelContextManager.update({ content, structuredContent });
   *   return {};
   * };
   * ```
   *
   * @see {@link McpUiUpdateModelContextRequest `McpUiUpdateModelContextRequest`} for the request type
   */
  set onupdatemodelcontext(callback) {
    this.setRequestHandler(
      McpUiUpdateModelContextRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for tool call requests from the view.
   *
   * The view sends `tools/call` requests to execute MCP server tools. This
   * handler allows the host to intercept and process these requests, typically
   * by forwarding them to the MCP server.
   *
   * @param callback - Handler that receives tool call params and returns a
   *   `CallToolResult`
   *   - `params` - Tool call parameters (name and arguments)
   *   - `extra` - Request metadata (abort signal, session info)
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_oncalltool_forwardToServer"
   * bridge.oncalltool = async (params, extra) => {
   *   return mcpClient.request(
   *     { method: "tools/call", params },
   *     CallToolResultSchema,
   *     { signal: extra.signal },
   *   );
   * };
   * ```
   *
   * @see `CallToolRequest` from @modelcontextprotocol/sdk for the request type
   * @see `CallToolResult` from @modelcontextprotocol/sdk for the result type
   */
  set oncalltool(callback) {
    this.setRequestHandler(CallToolRequestSchema2, async (request, extra) => {
      return callback(request.params, extra);
    });
  }
  /**
   * Notify the view that the MCP server's tool list has changed.
   *
   * The host sends `notifications/tools/list_changed` to the view when it
   * receives this notification from the MCP server. This allows the view
   * to refresh its tool cache or UI accordingly.
   *
   * @param params - Optional notification params (typically empty)
   *
   * @example
   * ```typescript
   * // In your MCP client notification handler:
   * mcpClient.setNotificationHandler(ToolListChangedNotificationSchema, () => {
   *   bridge.sendToolListChanged();
   * });
   * ```
   *
   * @see `ToolListChangedNotification` from @modelcontextprotocol/sdk for the notification type
   */
  sendToolListChanged(params = {}) {
    return this.notification({
      method: "notifications/tools/list_changed",
      params
    });
  }
  /**
   * Register a handler for list resources requests from the view.
   *
   * The view sends `resources/list` requests to enumerate available MCP
   * resources. This handler allows the host to intercept and process these
   * requests, typically by forwarding them to the MCP server.
   *
   * @param callback - Handler that receives list params and returns a
   *   `ListResourcesResult`
   *   - `params` - Request params (may include cursor for pagination)
   *   - `extra` - Request metadata (abort signal, session info)
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onlistresources_returnResources"
   * bridge.onlistresources = async (params, extra) => {
   *   return mcpClient.request(
   *     { method: "resources/list", params },
   *     ListResourcesResultSchema,
   *     { signal: extra.signal },
   *   );
   * };
   * ```
   *
   * @see `ListResourcesRequest` from @modelcontextprotocol/sdk for the request type
   * @see `ListResourcesResult` from @modelcontextprotocol/sdk for the result type
   */
  set onlistresources(callback) {
    this.setRequestHandler(
      ListResourcesRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for list resource templates requests from the view.
   *
   * The view sends `resources/templates/list` requests to enumerate available
   * MCP resource templates. This handler allows the host to intercept and process
   * these requests, typically by forwarding them to the MCP server.
   *
   * @param callback - Handler that receives list params and returns a
   *   `ListResourceTemplatesResult`
   *   - `params` - Request params (may include cursor for pagination)
   *   - `extra` - Request metadata (abort signal, session info)
   *
   * @example
   * ```typescript
   * bridge.onlistresourcetemplates = async (params, extra) => {
   *   return mcpClient.request(
   *     { method: "resources/templates/list", params },
   *     ListResourceTemplatesResultSchema,
   *     { signal: extra.signal }
   *   );
   * };
   * ```
   *
   * @see `ListResourceTemplatesRequest` from @modelcontextprotocol/sdk for the request type
   * @see `ListResourceTemplatesResult` from @modelcontextprotocol/sdk for the result type
   */
  set onlistresourcetemplates(callback) {
    this.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Register a handler for read resource requests from the view.
   *
   * The view sends `resources/read` requests to retrieve the contents of an
   * MCP resource. This handler allows the host to intercept and process these
   * requests, typically by forwarding them to the MCP server.
   *
   * @param callback - Handler that receives read params and returns a
   *   `ReadResourceResult`
   *   - `params` - Read parameters including the resource URI
   *   - `extra` - Request metadata (abort signal, session info)
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onreadresource_returnResource"
   * bridge.onreadresource = async (params, extra) => {
   *   return mcpClient.request(
   *     { method: "resources/read", params },
   *     ReadResourceResultSchema,
   *     { signal: extra.signal },
   *   );
   * };
   * ```
   *
   * @see `ReadResourceRequest` from @modelcontextprotocol/sdk for the request type
   * @see `ReadResourceResult` from @modelcontextprotocol/sdk for the result type
   */
  set onreadresource(callback) {
    this.setRequestHandler(
      ReadResourceRequestSchema,
      async (request, extra) => {
        return callback(request.params, extra);
      }
    );
  }
  /**
   * Notify the view that the MCP server's resource list has changed.
   *
   * The host sends `notifications/resources/list_changed` to the view when it
   * receives this notification from the MCP server. This allows the view
   * to refresh its resource cache or UI accordingly.
   *
   * @param params - Optional notification params (typically empty)
   *
   * @example
   * ```typescript
   * // In your MCP client notification handler:
   * mcpClient.setNotificationHandler(ResourceListChangedNotificationSchema, () => {
   *   bridge.sendResourceListChanged();
   * });
   * ```
   *
   * @see `ResourceListChangedNotification` from @modelcontextprotocol/sdk for the notification type
   */
  sendResourceListChanged(params = {}) {
    return this.notification({
      method: "notifications/resources/list_changed",
      params
    });
  }
  /**
   * Register a handler for list prompts requests from the view.
   *
   * The view sends `prompts/list` requests to enumerate available MCP
   * prompts. This handler allows the host to intercept and process these
   * requests, typically by forwarding them to the MCP server.
   *
   * @param callback - Handler that receives list params and returns a
   *   `ListPromptsResult`
   *   - `params` - Request params (may include cursor for pagination)
   *   - `extra` - Request metadata (abort signal, session info)
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_onlistprompts_returnPrompts"
   * bridge.onlistprompts = async (params, extra) => {
   *   return mcpClient.request(
   *     { method: "prompts/list", params },
   *     ListPromptsResultSchema,
   *     { signal: extra.signal },
   *   );
   * };
   * ```
   *
   * @see `ListPromptsRequest` from @modelcontextprotocol/sdk for the request type
   * @see `ListPromptsResult` from @modelcontextprotocol/sdk for the result type
   */
  set onlistprompts(callback) {
    this.setRequestHandler(ListPromptsRequestSchema, async (request, extra) => {
      return callback(request.params, extra);
    });
  }
  /**
   * Notify the view that the MCP server's prompt list has changed.
   *
   * The host sends `notifications/prompts/list_changed` to the view when it
   * receives this notification from the MCP server. This allows the view
   * to refresh its prompt cache or UI accordingly.
   *
   * @param params - Optional notification params (typically empty)
   *
   * @example
   * ```typescript
   * // In your MCP client notification handler:
   * mcpClient.setNotificationHandler(PromptListChangedNotificationSchema, () => {
   *   bridge.sendPromptListChanged();
   * });
   * ```
   *
   * @see `PromptListChangedNotification` from @modelcontextprotocol/sdk for the notification type
   */
  sendPromptListChanged(params = {}) {
    return this.notification({
      method: "notifications/prompts/list_changed",
      params
    });
  }
  /**
   * Verify that the guest supports the capability required for the given request method.
   * @internal
   */
  assertCapabilityForMethod(method) {
  }
  /**
   * Verify that a request handler is registered and supported for the given method.
   * @internal
   */
  assertRequestHandlerCapability(method) {
  }
  /**
   * Verify that the host supports the capability required for the given notification method.
   * @internal
   */
  assertNotificationCapability(method) {
  }
  /**
   * Verify that task creation is supported for the given request method.
   * @internal
   */
  assertTaskCapability(_method) {
    throw new Error("Tasks are not supported in MCP Apps");
  }
  /**
   * Verify that task handler is supported for the given method.
   * @internal
   */
  assertTaskHandlerCapability(_method) {
    throw new Error("Task handlers are not supported in MCP Apps");
  }
  /**
   * Get the host capabilities passed to the constructor.
   *
   * @returns Host capabilities object
   *
   * @see {@link McpUiHostCapabilities `McpUiHostCapabilities`} for the capabilities structure
   */
  getCapabilities() {
    return this._capabilities;
  }
  /**
   * Handle the ui/initialize request from the guest.
   * @internal
   */
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._appCapabilities = request.params.appCapabilities;
    this._appInfo = request.params.appInfo;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(
      requestedVersion
    ) ? requestedVersion : LATEST_PROTOCOL_VERSION;
    return {
      protocolVersion,
      hostCapabilities: this.getCapabilities(),
      hostInfo: this._hostInfo,
      hostContext: this._hostContext
    };
  }
  /**
   * Update the host context and notify the view of changes.
   *
   * Compares fields present in the new context with the current context and sends a
   * `ui/notifications/host-context-changed` notification containing only fields
   * that have been added or modified. If no fields have changed, no notification is sent.
   * The new context fully replaces the internal state.
   *
   * Common use cases include notifying the view when:
   * - Theme changes (light/dark mode toggle)
   * - Viewport size changes (window resize)
   * - Display mode changes (inline/fullscreen)
   * - Locale or timezone changes
   *
   * @param hostContext - The complete new host context state
   *
   * @example Update theme when user toggles dark mode
   * ```ts source="./app-bridge.examples.ts#AppBridge_setHostContext_updateTheme"
   * bridge.setHostContext({ theme: "dark" });
   * ```
   *
   * @example Update multiple context fields
   * ```ts source="./app-bridge.examples.ts#AppBridge_setHostContext_updateMultiple"
   * bridge.setHostContext({
   *   theme: "dark",
   *   containerDimensions: { maxHeight: 600, width: 800 },
   * });
   * ```
   *
   * @see {@link McpUiHostContext `McpUiHostContext`} for the context structure
   * @see {@link McpUiHostContextChangedNotification `McpUiHostContextChangedNotification`} for the notification type
   */
  setHostContext(hostContext) {
    const changes = {};
    let hasChanges = false;
    for (const key of Object.keys(hostContext)) {
      const oldValue = this._hostContext[key];
      const newValue = hostContext[key];
      if (deepEqual(oldValue, newValue)) {
        continue;
      }
      changes[key] = newValue;
      hasChanges = true;
    }
    if (hasChanges) {
      this._hostContext = hostContext;
      this.sendHostContextChange(changes);
    }
  }
  /**
   * Low-level method to notify the view of host context changes.
   *
   * Most hosts should use {@link setHostContext `setHostContext`} instead, which automatically
   * detects changes and calls this method with only the modified fields.
   * Use this directly only when you need fine-grained control over change detection.
   *
   * @param params - The context fields that have changed (partial update)
   */
  sendHostContextChange(params) {
    return this.notification({
      method: "ui/notifications/host-context-changed",
      params
    });
  }
  /**
   * Send complete tool arguments to the view.
   *
   * The host MUST send this notification after the View completes initialization
   * (after {@link oninitialized `oninitialized`} callback fires) and complete tool arguments become available.
   * This notification is sent exactly once and is required before {@link sendToolResult `sendToolResult`}.
   *
   * @param params - Complete tool call arguments
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_sendToolInput_afterInit"
   * bridge.oninitialized = () => {
   *   bridge.sendToolInput({
   *     arguments: { location: "New York", units: "metric" },
   *   });
   * };
   * ```
   *
   * @see {@link McpUiToolInputNotification `McpUiToolInputNotification`} for the notification type
   * @see {@link oninitialized `oninitialized`} for the initialization callback
   * @see {@link sendToolResult `sendToolResult`} for sending results after execution
   */
  sendToolInput(params) {
    return this.notification({
      method: "ui/notifications/tool-input",
      params
    });
  }
  /**
   * Send streaming partial tool arguments to the view.
   *
   * The host MAY send this notification zero or more times while tool arguments
   * are being streamed, before {@link sendToolInput `sendToolInput`} is called with complete
   * arguments. This enables progressive rendering of tool arguments in the
   * view.
   *
   * The arguments represent best-effort recovery of incomplete JSON. views
   * SHOULD handle missing or changing fields gracefully between notifications.
   *
   * @param params - Partial tool call arguments (may be incomplete)
   *
   * @example Stream partial arguments as they arrive
   * ```ts source="./app-bridge.examples.ts#AppBridge_sendToolInputPartial_streaming"
   * // As streaming progresses...
   * bridge.sendToolInputPartial({ arguments: { loc: "N" } });
   * bridge.sendToolInputPartial({ arguments: { location: "New" } });
   * bridge.sendToolInputPartial({ arguments: { location: "New York" } });
   *
   * // When complete, send final input
   * bridge.sendToolInput({
   *   arguments: { location: "New York", units: "metric" },
   * });
   * ```
   *
   * @see {@link McpUiToolInputPartialNotification `McpUiToolInputPartialNotification`} for the notification type
   * @see {@link sendToolInput `sendToolInput`} for sending complete arguments
   */
  sendToolInputPartial(params) {
    return this.notification({
      method: "ui/notifications/tool-input-partial",
      params
    });
  }
  /**
   * Send tool execution result to the view.
   *
   * The host MUST send this notification when tool execution completes successfully,
   * provided the view is still displayed. If the view was closed before execution
   * completes, the host MAY skip this notification. This must be sent after
   * {@link sendToolInput `sendToolInput`}.
   *
   * @param params - Standard MCP tool execution result
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_sendToolResult_afterExecution"
   * const result = await mcpClient.request(
   *   { method: "tools/call", params: { name: "get_weather", arguments: args } },
   *   CallToolResultSchema,
   * );
   * bridge.sendToolResult(result);
   * ```
   *
   * @see {@link McpUiToolResultNotification `McpUiToolResultNotification`} for the notification type
   * @see {@link sendToolInput `sendToolInput`} for sending tool arguments before results
   */
  sendToolResult(params) {
    return this.notification({
      method: "ui/notifications/tool-result",
      params
    });
  }
  /**
   * Notify the view that tool execution was cancelled.
   *
   * The host MUST send this notification if tool execution was cancelled for any
   * reason, including user action, sampling error, classifier intervention, or
   * any other interruption. This allows the view to update its state and
   * display appropriate feedback to the user.
   *
   * @param params - Cancellation details object
   *   - `reason`: Human-readable explanation for why the tool was cancelled
   *
   * @example User-initiated cancellation
   * ```ts source="./app-bridge.examples.ts#AppBridge_sendToolCancelled_userInitiated"
   * // User clicked "Cancel" button
   * bridge.sendToolCancelled({ reason: "User cancelled the operation" });
   * ```
   *
   * @example System-level cancellation
   * ```ts source="./app-bridge.examples.ts#AppBridge_sendToolCancelled_systemLevel"
   * // Sampling error or timeout
   * bridge.sendToolCancelled({ reason: "Request timeout after 30 seconds" });
   *
   * // Classifier intervention
   * bridge.sendToolCancelled({ reason: "Content policy violation detected" });
   * ```
   *
   * @see {@link McpUiToolCancelledNotification `McpUiToolCancelledNotification`} for the notification type
   * @see {@link sendToolResult `sendToolResult`} for sending successful results
   * @see {@link sendToolInput `sendToolInput`} for sending tool arguments
   */
  sendToolCancelled(params) {
    return this.notification({
      method: "ui/notifications/tool-cancelled",
      params
    });
  }
  /**
   * Send HTML resource to the sandbox proxy for secure loading.
   *
   * This is an internal method used by web-based hosts implementing the
   * double-iframe sandbox architecture. After the sandbox proxy signals readiness
   * via `ui/notifications/sandbox-proxy-ready`, the host sends this notification
   * with the HTML content to load.
   *
   * @param params - HTML content and sandbox configuration:
   *   - `html`: The HTML content to load into the sandboxed iframe
   *   - `sandbox`: Optional sandbox attribute value (e.g., "allow-scripts")
   *
   * @internal
   * @see {@link onsandboxready `onsandboxready`} for handling the sandbox proxy ready notification
   */
  sendSandboxResourceReady(params) {
    return this.notification({
      method: "ui/notifications/sandbox-resource-ready",
      params
    });
  }
  /**
   * Request graceful shutdown of the view.
   *
   * The host MUST send this request before tearing down the UI resource (before
   * unmounting the iframe). This gives the view an opportunity to save state,
   * cancel pending operations, or show confirmation dialogs.
   *
   * The host SHOULD wait for the response before unmounting to prevent data loss.
   *
   * @param params - Empty params object
   * @param options - Request options (timeout, etc.)
   * @returns Promise resolving when view confirms readiness for teardown
   *
   * @example
   * ```ts source="./app-bridge.examples.ts#AppBridge_teardownResource_gracefulShutdown"
   * try {
   *   await bridge.teardownResource({});
   *   // View is ready, safe to unmount iframe
   *   iframe.remove();
   * } catch (error) {
   *   console.error("Teardown failed:", error);
   * }
   * ```
   */
  teardownResource(params, options) {
    return this.request(
      {
        method: "ui/resource-teardown",
        params
      },
      McpUiResourceTeardownResultSchema,
      options
    );
  }
  /** @deprecated Use {@link teardownResource `teardownResource`} instead */
  sendResourceTeardown = this.teardownResource;
  /**
   * Connect to the view via transport and optionally set up message forwarding.
   *
   * This method establishes the transport connection. If an MCP client was passed
   * to the constructor, it also automatically sets up request/notification forwarding
   * based on the MCP server's capabilities, proxying the following to the view:
   * - Tools (tools/call, notifications/tools/list_changed)
   * - Resources (resources/list, resources/read, resources/templates/list, notifications/resources/list_changed)
   * - Prompts (prompts/list, notifications/prompts/list_changed)
   *
   * If no client was passed to the constructor, no automatic forwarding is set up
   * and you must register handlers manually using the {@link oncalltool `oncalltool`}, {@link onlistresources `onlistresources`},
   * etc. setters.
   *
   * After calling connect, wait for the {@link oninitialized `oninitialized`} callback before sending
   * tool input and other data to the View.
   *
   * @param transport - Transport layer (typically {@link PostMessageTransport `PostMessageTransport`})
   * @returns Promise resolving when connection is established
   *
   * @throws {Error} If a client was passed but server capabilities are not available.
   *   This occurs when connect() is called before the MCP client has completed its
   *   initialization with the server. Ensure `await client.connect()` completes
   *   before calling `bridge.connect()`.
   *
   * @example With MCP client (automatic forwarding)
   * ```ts source="./app-bridge.examples.ts#AppBridge_connect_withMcpClient"
   * const bridge = new AppBridge(mcpClient, hostInfo, capabilities);
   * const transport = new PostMessageTransport(
   *   iframe.contentWindow!,
   *   iframe.contentWindow!,
   * );
   *
   * bridge.oninitialized = () => {
   *   console.log("View ready");
   *   bridge.sendToolInput({ arguments: toolArgs });
   * };
   *
   * await bridge.connect(transport);
   * ```
   *
   * @example Without MCP client (manual handlers)
   * ```ts source="./app-bridge.examples.ts#AppBridge_connect_withoutMcpClient"
   * const bridge = new AppBridge(null, hostInfo, capabilities);
   *
   * // Register handlers manually
   * bridge.oncalltool = async (params, extra) => {
   *   // Custom tool call handling
   *   return { content: [] };
   * };
   *
   * await bridge.connect(transport);
   * ```
   */
  async connect(transport) {
    if (this.transport) {
      throw new Error(
        "AppBridge is already connected. Call close() before connecting again."
      );
    }
    if (this._client) {
      const serverCapabilities = this._client.getServerCapabilities();
      if (!serverCapabilities) {
        throw new Error("Client server capabilities not available");
      }
      if (serverCapabilities.tools) {
        this.oncalltool = async (params, extra) => {
          return this._client.request(
            { method: "tools/call", params },
            CallToolResultSchema3,
            { signal: extra.signal }
          );
        };
        if (serverCapabilities.tools.listChanged) {
          this._client.setNotificationHandler(
            ToolListChangedNotificationSchema,
            (n) => this.sendToolListChanged(n.params)
          );
        }
      }
      if (serverCapabilities.resources) {
        this.onlistresources = async (params, extra) => {
          return this._client.request(
            { method: "resources/list", params },
            ListResourcesResultSchema2,
            { signal: extra.signal }
          );
        };
        this.onlistresourcetemplates = async (params, extra) => {
          return this._client.request(
            { method: "resources/templates/list", params },
            ListResourceTemplatesResultSchema,
            { signal: extra.signal }
          );
        };
        this.onreadresource = async (params, extra) => {
          return this._client.request(
            { method: "resources/read", params },
            ReadResourceResultSchema2,
            { signal: extra.signal }
          );
        };
        if (serverCapabilities.resources.listChanged) {
          this._client.setNotificationHandler(
            ResourceListChangedNotificationSchema,
            (n) => this.sendResourceListChanged(n.params)
          );
        }
      }
      if (serverCapabilities.prompts) {
        this.onlistprompts = async (params, extra) => {
          return this._client.request(
            { method: "prompts/list", params },
            ListPromptsResultSchema,
            { signal: extra.signal }
          );
        };
        if (serverCapabilities.prompts.listChanged) {
          this._client.setNotificationHandler(
            PromptListChangedNotificationSchema,
            (n) => this.sendPromptListChanged(n.params)
          );
        }
      }
    }
    return super.connect(transport);
  }
};
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// pkg/mcp/src/message-transport.js
import {
  JSONRPCMessageSchema as JSONRPCMessageSchema2
} from "./mcp-sdk-types.js";
var MessagePortTransport = class {
  /**
   * @param {MessagePort} port Connected message port used for transport I/O.
   */
  constructor(port) {
    this.port = port;
    this.started = false;
    this.closed = false;
    this.onPortMessage = (event) => {
      const parsed = JSONRPCMessageSchema2.safeParse(event.data);
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
};
export {
  App,
  AppBridge,
  DOWNLOAD_FILE_METHOD,
  HOST_CONTEXT_CHANGED_METHOD,
  INITIALIZED_METHOD,
  INITIALIZE_METHOD,
  LATEST_PROTOCOL_VERSION,
  MESSAGE_METHOD,
  McpUiAppCapabilitiesSchema,
  McpUiDisplayModeSchema,
  McpUiDownloadFileRequestSchema,
  McpUiDownloadFileResultSchema,
  McpUiHostCapabilitiesSchema,
  McpUiHostContextChangedNotificationSchema,
  McpUiHostContextSchema,
  McpUiHostCssSchema,
  McpUiHostStylesSchema,
  McpUiInitializeRequestSchema,
  McpUiInitializeResultSchema,
  McpUiInitializedNotificationSchema,
  McpUiMessageRequestSchema,
  McpUiMessageResultSchema,
  McpUiOpenLinkRequestSchema,
  McpUiOpenLinkResultSchema,
  McpUiRequestDisplayModeRequestSchema,
  McpUiRequestDisplayModeResultSchema,
  McpUiResourceCspSchema,
  McpUiResourceMetaSchema,
  McpUiResourcePermissionsSchema,
  McpUiResourceTeardownRequestSchema,
  McpUiResourceTeardownResultSchema,
  McpUiSandboxProxyReadyNotificationSchema,
  McpUiSandboxResourceReadyNotificationSchema,
  McpUiSizeChangedNotificationSchema,
  McpUiSupportedContentBlockModalitiesSchema,
  McpUiThemeSchema,
  McpUiToolCancelledNotificationSchema,
  McpUiToolInputNotificationSchema,
  McpUiToolInputPartialNotificationSchema,
  McpUiToolMetaSchema,
  McpUiToolResultNotificationSchema,
  McpUiToolVisibilitySchema,
  McpUiUpdateModelContextRequestSchema,
  MessagePortTransport,
  OPEN_LINK_METHOD,
  PostMessageTransport,
  REQUEST_DISPLAY_MODE_METHOD,
  RESOURCE_MIME_TYPE,
  RESOURCE_TEARDOWN_METHOD,
  RESOURCE_URI_META_KEY,
  SANDBOX_PROXY_READY_METHOD,
  SANDBOX_RESOURCE_READY_METHOD,
  SIZE_CHANGED_METHOD,
  SUPPORTED_PROTOCOL_VERSIONS,
  TOOL_CANCELLED_METHOD,
  TOOL_INPUT_METHOD,
  TOOL_INPUT_PARTIAL_METHOD,
  TOOL_RESULT_METHOD,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  buildAllowAttribute,
  getDocumentTheme,
  getToolUiResourceUri,
  isToolVisibilityAppOnly,
  isToolVisibilityModelOnly
};
//# sourceMappingURL=mcp-ext-apps.js.map
