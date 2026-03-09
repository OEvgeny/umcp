export const DEFAULT_NEGOTIATED_PROTOCOL_VERSION = "2025-03-26";

export const ErrorCode = {"ConnectionClosed":-32000,"-32000":"ConnectionClosed","RequestTimeout":-32001,"-32001":"RequestTimeout","ParseError":-32700,"-32700":"ParseError","InvalidRequest":-32600,"-32600":"InvalidRequest","MethodNotFound":-32601,"-32601":"MethodNotFound","InvalidParams":-32602,"-32602":"InvalidParams","InternalError":-32603,"-32603":"InternalError","UrlElicitationRequired":-32042,"-32042":"UrlElicitationRequired"};

export const JSONRPC_VERSION = "2.0";

export const LATEST_PROTOCOL_VERSION = "2025-11-25";

export const McpError = class McpError extends Error {
    constructor(code, message, data) {
        super(`MCP error ${code}: ${message}`);
        this.code = code;
        this.data = data;
        this.name = 'McpError';
    }
    /**
     * Factory method to create the appropriate error type based on the error code and data
     */
    static fromError(code, message, data) {
        // Check for specific error types
        if (code === ErrorCode.UrlElicitationRequired && data) {
            const errorData = data;
            if (errorData.elicitations) {
                return new UrlElicitationRequiredError(errorData.elicitations, message);
            }
        }
        // Default to generic McpError
        return new McpError(code, message, data);
    }
}

export const RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25","2025-06-18","2025-03-26","2024-11-05","2024-10-07"];

export const UrlElicitationRequiredError = class UrlElicitationRequiredError extends McpError {
    constructor(elicitations, message = `URL elicitation${elicitations.length > 1 ? 's' : ''} required`) {
        super(ErrorCode.UrlElicitationRequired, message, {
            elicitations: elicitations
        });
    }
    get elicitations() {
        return this.data?.elicitations ?? [];
    }
}

export const assertCompleteRequestPrompt = function assertCompleteRequestPrompt(request) {
    if (request.params.ref.type !== 'ref/prompt') {
        throw new TypeError(`Expected CompleteRequestPrompt, but got ${request.params.ref.type}`);
    }
    void request;
}

export const assertCompleteRequestResourceTemplate = function assertCompleteRequestResourceTemplate(request) {
    if (request.params.ref.type !== 'ref/resource') {
        throw new TypeError(`Expected CompleteRequestResourceTemplate, but got ${request.params.ref.type}`);
    }
    void request;
}

export const isInitializeRequest = (value) => InitializeRequestSchema.safeParse(value).success

export const isInitializedNotification = (value) => InitializedNotificationSchema.safeParse(value).success

export const isJSONRPCError = (value) => JSONRPCErrorResponseSchema.safeParse(value).success

export const isJSONRPCErrorResponse = (value) => JSONRPCErrorResponseSchema.safeParse(value).success

export const isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success

export const isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success

export const isJSONRPCResponse = (value) => JSONRPCResultResponseSchema.safeParse(value).success

export const isJSONRPCResultResponse = (value) => JSONRPCResultResponseSchema.safeParse(value).success

export const isTaskAugmentedRequestParams = (value) => TaskAugmentedRequestParamsSchema.safeParse(value).success

export const AnnotationsSchemaJSON = {type: "object", properties: {audience: {type: "array", items: {type: "string", enum: ["user", "assistant"]}}, priority: {type: "number", minimum: 0, maximum: 1}, lastModified: {type: "string", format: "date-time", pattern: "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"}}, additionalProperties: false};

export const AudioContentSchemaJSON = {type: "object", properties: {type: {type: "string", const: "audio"}, data: {type: "string"}, mimeType: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "data", "mimeType"], additionalProperties: false};

export const BaseMetadataSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}}, required: ["name"], additionalProperties: false};

export const BlobResourceContentsSchemaJSON = {type: "object", properties: {uri: {type: "string"}, mimeType: {type: "string"}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}, blob: {type: "string"}}, required: ["uri", "blob"], additionalProperties: false};

export const BooleanSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "boolean"}, title: {type: "string"}, description: {type: "string"}, default: {type: "boolean"}}, required: ["type"], additionalProperties: false};

export const ProgressTokenSchemaJSON = {anyOf: [{type: "string"}, {type: "integer", minimum: -9007199254740991, maximum: 9007199254740991}]};

export const RelatedTaskMetadataSchemaJSON = {type: "object", properties: {taskId: {type: "string"}}, required: ["taskId"], additionalProperties: false};

export const TaskMetadataSchemaJSON = {type: "object", properties: {ttl: {type: "number"}}, additionalProperties: false};

export const CallToolRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskMetadataSchemaJSON, name: {type: "string"}, arguments: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["name"], additionalProperties: false};

export const CallToolRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tools/call"}, params: CallToolRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const TextResourceContentsSchemaJSON = {type: "object", properties: {uri: {type: "string"}, mimeType: {type: "string"}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}, text: {type: "string"}}, required: ["uri", "text"], additionalProperties: false};

export const EmbeddedResourceSchemaJSON = {type: "object", properties: {type: {type: "string", const: "resource"}, resource: {anyOf: [TextResourceContentsSchemaJSON, BlobResourceContentsSchemaJSON]}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "resource"], additionalProperties: false};

export const ImageContentSchemaJSON = {type: "object", properties: {type: {type: "string", const: "image"}, data: {type: "string"}, mimeType: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "data", "mimeType"], additionalProperties: false};

export const IconSchemaJSON = {type: "object", properties: {src: {type: "string"}, mimeType: {type: "string"}, sizes: {type: "array", items: {type: "string"}}, theme: {type: "string", enum: ["light", "dark"]}}, required: ["src"], additionalProperties: false};

export const ResourceLinkSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, uri: {type: "string"}, description: {type: "string"}, mimeType: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", properties: {}, additionalProperties: {}}, type: {type: "string", const: "resource_link"}}, required: ["name", "uri", "type"], additionalProperties: false};

export const TextContentSchemaJSON = {type: "object", properties: {type: {type: "string", const: "text"}, text: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "text"], additionalProperties: false};

export const ContentBlockSchemaJSON = {anyOf: [TextContentSchemaJSON, ImageContentSchemaJSON, AudioContentSchemaJSON, ResourceLinkSchemaJSON, EmbeddedResourceSchemaJSON]};

export const CallToolResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, content: {default: [], type: "array", items: ContentBlockSchemaJSON}, structuredContent: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}, isError: {type: "boolean"}}, required: ["content"], additionalProperties: {}};

export const CancelTaskRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tasks/cancel"}, params: {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, taskId: {type: "string"}}, required: ["taskId"], additionalProperties: false}}, required: ["method", "params"], additionalProperties: false};

export const CancelTaskResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, taskId: {type: "string"}, status: {type: "string", enum: ["working", "input_required", "completed", "failed", "cancelled"]}, ttl: {anyOf: [{type: "number"}, {type: "null"}]}, createdAt: {type: "string"}, lastUpdatedAt: {type: "string"}, pollInterval: {type: "number"}, statusMessage: {type: "string"}}, required: ["taskId", "status", "ttl", "createdAt", "lastUpdatedAt"], additionalProperties: false};

export const CancelledNotificationParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, requestId: ProgressTokenSchemaJSON, reason: {type: "string"}}, additionalProperties: false};

export const CancelledNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/cancelled"}, params: CancelledNotificationParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const ClientTasksCapabilitySchemaJSON = {type: "object", properties: {list: {type: "object", properties: {}, additionalProperties: {}}, cancel: {type: "object", properties: {}, additionalProperties: {}}, requests: {type: "object", properties: {sampling: {type: "object", properties: {createMessage: {type: "object", properties: {}, additionalProperties: {}}}, additionalProperties: {}}, elicitation: {type: "object", properties: {create: {type: "object", properties: {}, additionalProperties: {}}}, additionalProperties: {}}}, additionalProperties: {}}}, additionalProperties: {}};

export const ClientCapabilitiesSchemaJSON = {type: "object", properties: {experimental: {type: "object", propertyNames: {type: "string"}, additionalProperties: {type: "object", properties: {}, additionalProperties: {}}}, sampling: {type: "object", properties: {context: {type: "object", properties: {}, additionalProperties: {}}, tools: {type: "object", properties: {}, additionalProperties: {}}}, additionalProperties: false}, elicitation: {type: "object", properties: {form: {type: "object", properties: {applyDefaults: {type: "boolean"}}, additionalProperties: {}}, url: {type: "object", properties: {}, additionalProperties: {}}}, additionalProperties: {}}, roots: {type: "object", properties: {listChanged: {type: "boolean"}}, additionalProperties: false}, tasks: ClientTasksCapabilitySchemaJSON}, additionalProperties: false};

export const EmptyResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}}, additionalProperties: false};

export const InitializedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/initialized"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ProgressNotificationParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, progress: {type: "number"}, total: {type: "number"}, message: {type: "string"}, progressToken: ProgressTokenSchemaJSON}, required: ["progress", "progressToken"], additionalProperties: false};

export const ProgressNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/progress"}, params: ProgressNotificationParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const RootsListChangedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/roots/list_changed"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const TaskStatusNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/tasks/status"}, params: CancelTaskResultSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const ClientNotificationSchemaJSON = {anyOf: [CancelledNotificationSchemaJSON, ProgressNotificationSchemaJSON, InitializedNotificationSchemaJSON, RootsListChangedNotificationSchemaJSON, TaskStatusNotificationSchemaJSON]};

export const PromptReferenceSchemaJSON = {type: "object", properties: {type: {type: "string", const: "ref/prompt"}, name: {type: "string"}}, required: ["type", "name"], additionalProperties: false};

export const ResourceReferenceSchemaJSON = {type: "object", properties: {type: {type: "string", const: "ref/resource"}, uri: {type: "string"}}, required: ["type", "uri"], additionalProperties: false};

export const CompleteRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, ref: {anyOf: [PromptReferenceSchemaJSON, ResourceReferenceSchemaJSON]}, argument: {type: "object", properties: {name: {type: "string"}, value: {type: "string"}}, required: ["name", "value"], additionalProperties: false}, context: {type: "object", properties: {arguments: {type: "object", propertyNames: {type: "string"}, additionalProperties: {type: "string"}}}, additionalProperties: false}}, required: ["ref", "argument"], additionalProperties: false};

export const CompleteRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "completion/complete"}, params: CompleteRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const GetPromptRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, name: {type: "string"}, arguments: {type: "object", propertyNames: {type: "string"}, additionalProperties: {type: "string"}}}, required: ["name"], additionalProperties: false};

export const GetPromptRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "prompts/get"}, params: GetPromptRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const GetTaskPayloadRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tasks/result"}, params: {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, taskId: {type: "string"}}, required: ["taskId"], additionalProperties: false}}, required: ["method", "params"], additionalProperties: false};

export const GetTaskRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tasks/get"}, params: {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, taskId: {type: "string"}}, required: ["taskId"], additionalProperties: false}}, required: ["method", "params"], additionalProperties: false};

export const ImplementationSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, version: {type: "string"}, websiteUrl: {type: "string"}, description: {type: "string"}}, required: ["name", "version"], additionalProperties: false};

export const InitializeRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, protocolVersion: {type: "string"}, capabilities: ClientCapabilitiesSchemaJSON, clientInfo: ImplementationSchemaJSON}, required: ["protocolVersion", "capabilities", "clientInfo"], additionalProperties: false};

export const InitializeRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "initialize"}, params: InitializeRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const PaginatedRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, cursor: {type: "string"}}, additionalProperties: false};

export const ListPromptsRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "prompts/list"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const ListResourceTemplatesRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "resources/templates/list"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const ListResourcesRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "resources/list"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const ListTasksRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tasks/list"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const ListToolsRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "tools/list"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const PingRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "ping"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ReadResourceRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, uri: {type: "string"}}, required: ["uri"], additionalProperties: false};

export const ReadResourceRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "resources/read"}, params: ReadResourceRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const SetLevelRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, level: {type: "string", enum: ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]}}, required: ["level"], additionalProperties: false};

export const SetLevelRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "logging/setLevel"}, params: SetLevelRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const SubscribeRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "resources/subscribe"}, params: ReadResourceRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const UnsubscribeRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "resources/unsubscribe"}, params: ReadResourceRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const ClientRequestSchemaJSON = {oneOf: [PingRequestSchemaJSON, InitializeRequestSchemaJSON, CompleteRequestSchemaJSON, SetLevelRequestSchemaJSON, GetPromptRequestSchemaJSON, ListPromptsRequestSchemaJSON, ListResourcesRequestSchemaJSON, ListResourceTemplatesRequestSchemaJSON, ReadResourceRequestSchemaJSON, SubscribeRequestSchemaJSON, UnsubscribeRequestSchemaJSON, CallToolRequestSchemaJSON, ListToolsRequestSchemaJSON, GetTaskRequestSchemaJSON, GetTaskPayloadRequestSchemaJSON, ListTasksRequestSchemaJSON, CancelTaskRequestSchemaJSON]};

export const SamplingContentSchemaJSON = {oneOf: [TextContentSchemaJSON, ImageContentSchemaJSON, AudioContentSchemaJSON]};

export const CreateMessageResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, model: {type: "string"}, stopReason: {anyOf: [{type: "string", enum: ["endTurn", "stopSequence", "maxTokens"]}, {type: "string"}]}, role: {type: "string", enum: ["user", "assistant"]}, content: SamplingContentSchemaJSON}, required: ["model", "role", "content"], additionalProperties: {}};

export const ToolResultContentSchemaJSON = {type: "object", properties: {type: {type: "string", const: "tool_result"}, toolUseId: {type: "string", description: "The unique identifier for the corresponding tool call."}, content: {default: [], type: "array", items: ContentBlockSchemaJSON}, structuredContent: {type: "object", properties: {}, additionalProperties: {}}, isError: {type: "boolean"}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "toolUseId", "content"], additionalProperties: false};

export const ToolUseContentSchemaJSON = {type: "object", properties: {type: {type: "string", const: "tool_use"}, name: {type: "string"}, id: {type: "string"}, input: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["type", "name", "id", "input"], additionalProperties: false};

export const SamplingMessageContentBlockSchemaJSON = {oneOf: [TextContentSchemaJSON, ImageContentSchemaJSON, AudioContentSchemaJSON, ToolUseContentSchemaJSON, ToolResultContentSchemaJSON]};

export const CreateMessageResultWithToolsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, model: {type: "string"}, stopReason: {anyOf: [{type: "string", enum: ["endTurn", "stopSequence", "maxTokens", "toolUse"]}, {type: "string"}]}, role: {type: "string", enum: ["user", "assistant"]}, content: {anyOf: [SamplingMessageContentBlockSchemaJSON, {type: "array", items: SamplingMessageContentBlockSchemaJSON}]}}, required: ["model", "role", "content"], additionalProperties: {}};

export const TaskSchemaJSON = {type: "object", properties: {taskId: {type: "string"}, status: {type: "string", enum: ["working", "input_required", "completed", "failed", "cancelled"]}, ttl: {anyOf: [{type: "number"}, {type: "null"}]}, createdAt: {type: "string"}, lastUpdatedAt: {type: "string"}, pollInterval: {type: "number"}, statusMessage: {type: "string"}}, required: ["taskId", "status", "ttl", "createdAt", "lastUpdatedAt"], additionalProperties: false};

export const CreateTaskResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskSchemaJSON}, required: ["task"], additionalProperties: {}};

export const ElicitResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, action: {type: "string", enum: ["accept", "decline", "cancel"]}, content: {type: "object", propertyNames: {type: "string"}, additionalProperties: {anyOf: [{type: "string"}, {type: "number"}, {type: "boolean"}, {type: "array", items: {type: "string"}}]}}}, required: ["action"], additionalProperties: {}};

export const RootSchemaJSON = {type: "object", properties: {uri: {type: "string", pattern: "^file:\\/\\/.*"}, name: {type: "string"}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["uri"], additionalProperties: false};

export const ListRootsResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, roots: {type: "array", items: RootSchemaJSON}}, required: ["roots"], additionalProperties: {}};

export const ListTasksResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}, tasks: {type: "array", items: TaskSchemaJSON}}, required: ["tasks"], additionalProperties: {}};

export const ClientResultSchemaJSON = {anyOf: [EmptyResultSchemaJSON, CreateMessageResultSchemaJSON, CreateMessageResultWithToolsSchemaJSON, ElicitResultSchemaJSON, ListRootsResultSchemaJSON, CancelTaskResultSchemaJSON, ListTasksResultSchemaJSON, CreateTaskResultSchemaJSON]};

export const CompatibilityCallToolResultSchemaJSON = {anyOf: [CallToolResultSchemaJSON, {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, toolResult: {}}, required: ["toolResult"], additionalProperties: {}}]};

export const CompleteResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, completion: {type: "object", properties: {values: {maxItems: 100, type: "array", items: {type: "string"}}, total: {type: "integer", minimum: -9007199254740991, maximum: 9007199254740991}, hasMore: {type: "boolean"}}, required: ["values"], additionalProperties: {}}}, required: ["completion"], additionalProperties: {}};

export const ModelHintSchemaJSON = {type: "object", properties: {name: {type: "string"}}, additionalProperties: false};

export const ModelPreferencesSchemaJSON = {type: "object", properties: {hints: {type: "array", items: ModelHintSchemaJSON}, costPriority: {type: "number", minimum: 0, maximum: 1}, speedPriority: {type: "number", minimum: 0, maximum: 1}, intelligencePriority: {type: "number", minimum: 0, maximum: 1}}, additionalProperties: false};

export const SamplingMessageSchemaJSON = {type: "object", properties: {role: {type: "string", enum: ["user", "assistant"]}, content: {anyOf: [SamplingMessageContentBlockSchemaJSON, {type: "array", items: SamplingMessageContentBlockSchemaJSON}]}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["role", "content"], additionalProperties: false};

export const ToolChoiceSchemaJSON = {type: "object", properties: {mode: {type: "string", enum: ["auto", "required", "none"]}}, additionalProperties: false};

export const ToolAnnotationsSchemaJSON = {type: "object", properties: {title: {type: "string"}, readOnlyHint: {type: "boolean"}, destructiveHint: {type: "boolean"}, idempotentHint: {type: "boolean"}, openWorldHint: {type: "boolean"}}, additionalProperties: false};

export const ToolExecutionSchemaJSON = {type: "object", properties: {taskSupport: {type: "string", enum: ["required", "optional", "forbidden"]}}, additionalProperties: false};

export const ToolSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, description: {type: "string"}, inputSchema: {type: "object", properties: {type: {type: "string", const: "object"}, properties: {type: "object", propertyNames: {type: "string"}, additionalProperties: {anyOf: [{type: "boolean"}, {type: "object", properties: {}, additionalProperties: {}}]}}, required: {type: "array", items: {type: "string"}}}, required: ["type"], additionalProperties: {}}, outputSchema: {type: "object", properties: {type: {type: "string", const: "object"}, properties: {type: "object", propertyNames: {type: "string"}, additionalProperties: {anyOf: [{type: "boolean"}, {type: "object", properties: {}, additionalProperties: {}}]}}, required: {type: "array", items: {type: "string"}}}, required: ["type"], additionalProperties: {}}, annotations: ToolAnnotationsSchemaJSON, execution: ToolExecutionSchemaJSON, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["name", "inputSchema"], additionalProperties: false};

export const CreateMessageRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskMetadataSchemaJSON, messages: {type: "array", items: SamplingMessageSchemaJSON}, modelPreferences: ModelPreferencesSchemaJSON, systemPrompt: {type: "string"}, includeContext: {type: "string", enum: ["none", "thisServer", "allServers"]}, temperature: {type: "number"}, maxTokens: {type: "integer", minimum: -9007199254740991, maximum: 9007199254740991}, stopSequences: {type: "array", items: {type: "string"}}, metadata: {type: "object", properties: {}, additionalProperties: {}}, tools: {type: "array", items: ToolSchemaJSON}, toolChoice: ToolChoiceSchemaJSON}, required: ["messages", "maxTokens"], additionalProperties: false};

export const CreateMessageRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "sampling/createMessage"}, params: CreateMessageRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const CursorSchemaJSON = {type: "string"};

export const LegacyTitledEnumSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "string"}, title: {type: "string"}, description: {type: "string"}, enum: {type: "array", items: {type: "string"}}, enumNames: {type: "array", items: {type: "string"}}, default: {type: "string"}}, required: ["type", "enum"], additionalProperties: false};

export const TitledMultiSelectEnumSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "array"}, title: {type: "string"}, description: {type: "string"}, minItems: {type: "number"}, maxItems: {type: "number"}, items: {type: "object", properties: {anyOf: {type: "array", items: {type: "object", properties: {const: {type: "string"}, title: {type: "string"}}, required: ["const", "title"], additionalProperties: false}}}, required: ["anyOf"], additionalProperties: false}, default: {type: "array", items: {type: "string"}}}, required: ["type", "items"], additionalProperties: false};

export const UntitledMultiSelectEnumSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "array"}, title: {type: "string"}, description: {type: "string"}, minItems: {type: "number"}, maxItems: {type: "number"}, items: {type: "object", properties: {type: {type: "string", const: "string"}, enum: {type: "array", items: {type: "string"}}}, required: ["type", "enum"], additionalProperties: false}, default: {type: "array", items: {type: "string"}}}, required: ["type", "items"], additionalProperties: false};

export const MultiSelectEnumSchemaSchemaJSON = {anyOf: [UntitledMultiSelectEnumSchemaSchemaJSON, TitledMultiSelectEnumSchemaSchemaJSON]};

export const TitledSingleSelectEnumSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "string"}, title: {type: "string"}, description: {type: "string"}, oneOf: {type: "array", items: {type: "object", properties: {const: {type: "string"}, title: {type: "string"}}, required: ["const", "title"], additionalProperties: false}}, default: {type: "string"}}, required: ["type", "oneOf"], additionalProperties: false};

export const UntitledSingleSelectEnumSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "string"}, title: {type: "string"}, description: {type: "string"}, enum: {type: "array", items: {type: "string"}}, default: {type: "string"}}, required: ["type", "enum"], additionalProperties: false};

export const SingleSelectEnumSchemaSchemaJSON = {anyOf: [UntitledSingleSelectEnumSchemaSchemaJSON, TitledSingleSelectEnumSchemaSchemaJSON]};

export const EnumSchemaSchemaJSON = {anyOf: [LegacyTitledEnumSchemaSchemaJSON, SingleSelectEnumSchemaSchemaJSON, MultiSelectEnumSchemaSchemaJSON]};

export const NumberSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", enum: ["number", "integer"]}, title: {type: "string"}, description: {type: "string"}, minimum: {type: "number"}, maximum: {type: "number"}, default: {type: "number"}}, required: ["type"], additionalProperties: false};

export const StringSchemaSchemaJSON = {type: "object", properties: {type: {type: "string", const: "string"}, title: {type: "string"}, description: {type: "string"}, minLength: {type: "number"}, maxLength: {type: "number"}, format: {type: "string", enum: ["email", "uri", "date", "date-time"]}, default: {type: "string"}}, required: ["type"], additionalProperties: false};

export const PrimitiveSchemaDefinitionSchemaJSON = {anyOf: [EnumSchemaSchemaJSON, BooleanSchemaSchemaJSON, StringSchemaSchemaJSON, NumberSchemaSchemaJSON]};

export const ElicitRequestFormParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskMetadataSchemaJSON, mode: {type: "string", const: "form"}, message: {type: "string"}, requestedSchema: {type: "object", properties: {type: {type: "string", const: "object"}, properties: {type: "object", propertyNames: {type: "string"}, additionalProperties: PrimitiveSchemaDefinitionSchemaJSON}, required: {type: "array", items: {type: "string"}}}, required: ["type", "properties"], additionalProperties: false}}, required: ["message", "requestedSchema"], additionalProperties: false};

export const ElicitRequestURLParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskMetadataSchemaJSON, mode: {type: "string", const: "url"}, message: {type: "string"}, elicitationId: {type: "string"}, url: {type: "string", format: "uri"}}, required: ["mode", "message", "elicitationId", "url"], additionalProperties: false};

export const ElicitRequestParamsSchemaJSON = {anyOf: [ElicitRequestFormParamsSchemaJSON, ElicitRequestURLParamsSchemaJSON]};

export const ElicitRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "elicitation/create"}, params: ElicitRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const ElicitationCompleteNotificationParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, elicitationId: {type: "string"}}, required: ["elicitationId"], additionalProperties: false};

export const ElicitationCompleteNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/elicitation/complete"}, params: ElicitationCompleteNotificationParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const PromptMessageSchemaJSON = {type: "object", properties: {role: {type: "string", enum: ["user", "assistant"]}, content: ContentBlockSchemaJSON}, required: ["role", "content"], additionalProperties: false};

export const GetPromptResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, description: {type: "string"}, messages: {type: "array", items: PromptMessageSchemaJSON}}, required: ["messages"], additionalProperties: {}};

export const GetTaskPayloadResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}}, additionalProperties: {}};

export const IconsSchemaJSON = {type: "object", properties: {icons: {type: "array", items: IconSchemaJSON}}, additionalProperties: false};

export const ServerTasksCapabilitySchemaJSON = {type: "object", properties: {list: {type: "object", properties: {}, additionalProperties: {}}, cancel: {type: "object", properties: {}, additionalProperties: {}}, requests: {type: "object", properties: {tools: {type: "object", properties: {call: {type: "object", properties: {}, additionalProperties: {}}}, additionalProperties: {}}}, additionalProperties: {}}}, additionalProperties: {}};

export const ServerCapabilitiesSchemaJSON = {type: "object", properties: {experimental: {type: "object", propertyNames: {type: "string"}, additionalProperties: {type: "object", properties: {}, additionalProperties: {}}}, logging: {type: "object", properties: {}, additionalProperties: {}}, completions: {type: "object", properties: {}, additionalProperties: {}}, prompts: {type: "object", properties: {listChanged: {type: "boolean"}}, additionalProperties: false}, resources: {type: "object", properties: {subscribe: {type: "boolean"}, listChanged: {type: "boolean"}}, additionalProperties: false}, tools: {type: "object", properties: {listChanged: {type: "boolean"}}, additionalProperties: false}, tasks: ServerTasksCapabilitySchemaJSON}, additionalProperties: false};

export const InitializeResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, protocolVersion: {type: "string"}, capabilities: ServerCapabilitiesSchemaJSON, serverInfo: ImplementationSchemaJSON, instructions: {type: "string"}}, required: ["protocolVersion", "capabilities", "serverInfo"], additionalProperties: {}};

export const JSONRPCErrorResponseSchemaJSON = {type: "object", properties: {jsonrpc: {type: "string", const: "2.0"}, id: ProgressTokenSchemaJSON, error: {type: "object", properties: {code: {type: "integer", minimum: -9007199254740991, maximum: 9007199254740991}, message: {type: "string"}, data: {}}, required: ["code", "message"], additionalProperties: false}}, required: ["jsonrpc", "error"], additionalProperties: false};

export const JSONRPCNotificationSchemaJSON = {type: "object", properties: {jsonrpc: {type: "string", const: "2.0"}, method: {type: "string"}, params: GetTaskPayloadResultSchemaJSON}, required: ["jsonrpc", "method"], additionalProperties: false};

export const JSONRPCRequestSchemaJSON = {type: "object", properties: {jsonrpc: {type: "string", const: "2.0"}, id: ProgressTokenSchemaJSON, method: {type: "string"}, params: GetTaskPayloadResultSchemaJSON}, required: ["jsonrpc", "id", "method"], additionalProperties: false};

export const JSONRPCResultResponseSchemaJSON = {type: "object", properties: {jsonrpc: {type: "string", const: "2.0"}, id: ProgressTokenSchemaJSON, result: GetTaskPayloadResultSchemaJSON}, required: ["jsonrpc", "id", "result"], additionalProperties: false};

export const JSONRPCMessageSchemaJSON = {anyOf: [JSONRPCRequestSchemaJSON, JSONRPCNotificationSchemaJSON, JSONRPCResultResponseSchemaJSON, JSONRPCErrorResponseSchemaJSON]};

export const JSONRPCResponseSchemaJSON = {anyOf: [JSONRPCResultResponseSchemaJSON, JSONRPCErrorResponseSchemaJSON]};

export const ListChangedOptionsBaseSchemaJSON = {type: "object", properties: {autoRefresh: {default: true, type: "boolean"}, debounceMs: {default: 300, type: "integer", minimum: 0, maximum: 9007199254740991}}, required: ["autoRefresh", "debounceMs"], additionalProperties: false};

export const PromptArgumentSchemaJSON = {type: "object", properties: {name: {type: "string"}, description: {type: "string"}, required: {type: "boolean"}}, required: ["name"], additionalProperties: false};

export const PromptSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, description: {type: "string"}, arguments: {type: "array", items: PromptArgumentSchemaJSON}, _meta: {type: "object", properties: {}, additionalProperties: {}}}, required: ["name"], additionalProperties: false};

export const ListPromptsResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}, prompts: {type: "array", items: PromptSchemaJSON}}, required: ["prompts"], additionalProperties: {}};

export const ResourceTemplateSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, uriTemplate: {type: "string"}, description: {type: "string"}, mimeType: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", properties: {}, additionalProperties: {}}}, required: ["name", "uriTemplate"], additionalProperties: false};

export const ListResourceTemplatesResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}, resourceTemplates: {type: "array", items: ResourceTemplateSchemaJSON}}, required: ["resourceTemplates"], additionalProperties: {}};

export const ResourceSchemaJSON = {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, icons: {type: "array", items: IconSchemaJSON}, uri: {type: "string"}, description: {type: "string"}, mimeType: {type: "string"}, annotations: AnnotationsSchemaJSON, _meta: {type: "object", properties: {}, additionalProperties: {}}}, required: ["name", "uri"], additionalProperties: false};

export const ListResourcesResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}, resources: {type: "array", items: ResourceSchemaJSON}}, required: ["resources"], additionalProperties: {}};

export const ListRootsRequestSchemaJSON = {type: "object", properties: {method: {type: "string", const: "roots/list"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ListToolsResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}, tools: {type: "array", items: ToolSchemaJSON}}, required: ["tools"], additionalProperties: {}};

export const LoggingLevelSchemaJSON = {type: "string", enum: ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]};

export const LoggingMessageNotificationParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, level: {type: "string", enum: ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]}, logger: {type: "string"}, data: {}}, required: ["level", "data"], additionalProperties: false};

export const LoggingMessageNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/message"}, params: LoggingMessageNotificationParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const NotificationSchemaJSON = {type: "object", properties: {method: {type: "string"}, params: GetTaskPayloadResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const PaginatedRequestSchemaJSON = {type: "object", properties: {method: {type: "string"}, params: PaginatedRequestParamsSchemaJSON}, required: ["method"], additionalProperties: false};

export const PaginatedResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, nextCursor: {type: "string"}}, additionalProperties: {}};

export const ProgressSchemaJSON = {type: "object", properties: {progress: {type: "number"}, total: {type: "number"}, message: {type: "string"}}, required: ["progress"], additionalProperties: false};

export const PromptListChangedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/prompts/list_changed"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ReadResourceResultSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, contents: {type: "array", items: {anyOf: [TextResourceContentsSchemaJSON, BlobResourceContentsSchemaJSON]}}}, required: ["contents"], additionalProperties: {}};

export const ResourceContentsSchemaJSON = {type: "object", properties: {uri: {type: "string"}, mimeType: {type: "string"}, _meta: {type: "object", propertyNames: {type: "string"}, additionalProperties: {}}}, required: ["uri"], additionalProperties: false};

export const ResourceListChangedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/resources/list_changed"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ResourceUpdatedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/resources/updated"}, params: ReadResourceRequestParamsSchemaJSON}, required: ["method", "params"], additionalProperties: false};

export const RoleSchemaJSON = {type: "string", enum: ["user", "assistant"]};

export const ToolListChangedNotificationSchemaJSON = {type: "object", properties: {method: {type: "string", const: "notifications/tools/list_changed"}, params: EmptyResultSchemaJSON}, required: ["method"], additionalProperties: false};

export const ServerNotificationSchemaJSON = {anyOf: [CancelledNotificationSchemaJSON, ProgressNotificationSchemaJSON, LoggingMessageNotificationSchemaJSON, ResourceUpdatedNotificationSchemaJSON, ResourceListChangedNotificationSchemaJSON, ToolListChangedNotificationSchemaJSON, PromptListChangedNotificationSchemaJSON, TaskStatusNotificationSchemaJSON, ElicitationCompleteNotificationSchemaJSON]};

export const ServerRequestSchemaJSON = {oneOf: [PingRequestSchemaJSON, CreateMessageRequestSchemaJSON, ElicitRequestSchemaJSON, ListRootsRequestSchemaJSON, GetTaskRequestSchemaJSON, GetTaskPayloadRequestSchemaJSON, ListTasksRequestSchemaJSON, CancelTaskRequestSchemaJSON]};

export const ServerResultSchemaJSON = {anyOf: [EmptyResultSchemaJSON, InitializeResultSchemaJSON, CompleteResultSchemaJSON, GetPromptResultSchemaJSON, ListPromptsResultSchemaJSON, ListResourcesResultSchemaJSON, ListResourceTemplatesResultSchemaJSON, ReadResourceResultSchemaJSON, CallToolResultSchemaJSON, ListToolsResultSchemaJSON, CancelTaskResultSchemaJSON, ListTasksResultSchemaJSON, CreateTaskResultSchemaJSON]};

export const TaskAugmentedRequestParamsSchemaJSON = {type: "object", properties: {_meta: {type: "object", properties: {progressToken: ProgressTokenSchemaJSON, "io.modelcontextprotocol/related-task": RelatedTaskMetadataSchemaJSON}, additionalProperties: {}}, task: TaskMetadataSchemaJSON}, additionalProperties: false};

export const TaskCreationParamsSchemaJSON = {type: "object", properties: {ttl: {anyOf: [{type: "number"}, {type: "null"}]}, pollInterval: {type: "number"}}, additionalProperties: {}};

export const TaskStatusSchemaJSON = {type: "string", enum: ["working", "input_required", "completed", "failed", "cancelled"]};

export const GetTaskResultSchemaJSON = CancelTaskResultSchemaJSON;

export const JSONRPCErrorSchemaJSON = JSONRPCErrorResponseSchemaJSON;

export const RequestIdSchemaJSON = ProgressTokenSchemaJSON;

export const RequestSchemaJSON = NotificationSchemaJSON;

export const ResourceRequestParamsSchemaJSON = ReadResourceRequestParamsSchemaJSON;

export const ResourceTemplateReferenceSchemaJSON = ResourceReferenceSchemaJSON;

export const ResourceUpdatedNotificationParamsSchemaJSON = ReadResourceRequestParamsSchemaJSON;

export const ResultSchemaJSON = GetTaskPayloadResultSchemaJSON;

export const SubscribeRequestParamsSchemaJSON = ReadResourceRequestParamsSchemaJSON;

export const TaskStatusNotificationParamsSchemaJSON = CancelTaskResultSchemaJSON;

export const UnsubscribeRequestParamsSchemaJSON = ReadResourceRequestParamsSchemaJSON;

