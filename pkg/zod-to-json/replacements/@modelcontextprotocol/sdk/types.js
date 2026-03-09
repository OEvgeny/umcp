import {
  ProgressTokenSchema,
  RELATED_TASK_META_KEY,
  RelatedTaskMetadataSchema,
  ImplementationSchema,
  RequestSchema,
  ResultSchema,
  BaseMetadataSchema,
  IconsSchema,
  ToolAnnotationsSchema,
  ToolExecutionSchema,
  PaginatedResultSchema,
  TaskAugmentedRequestParamsSchema,
  SamplingMessageSchema,
  ModelPreferencesSchema,
  ToolChoiceSchema,
  PingRequestSchema,
  CompleteRequestSchema,
  SetLevelRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetTaskRequestSchema,
  GetTaskPayloadRequestSchema,
  ListTasksRequestSchema,
  CancelTaskRequestSchema,
  ElicitRequestSchema,
  ListRootsRequestSchema,
  EmptyResultSchema,
  CompleteResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ReadResourceResultSchema,
  CallToolResultSchema,
  GetTaskResultSchema,
  ListTasksResultSchema,
  CreateTaskResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod';

const RequestMetaSchema = z
  .object({
    progressToken: ProgressTokenSchema.optional(),
    [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional(),
  })
  .catchall(z.unknown());

const BaseRequestParamsSchema = z.object({
  _meta: RequestMetaSchema.optional(),
});

const AnyObjectSchema = z.object({}).catchall(z.unknown());

const JsonSchemaNodeSchema = z.union([
  z.boolean(),
  z.object({}).catchall(z.unknown()),
]);

const JsonSchemaObjectRootSchema = z
  .object({
    type: z.literal('object'),
    properties: z.record(z.string(), JsonSchemaNodeSchema).optional(),
    required: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

const FormElicitationCapabilitySchema = z
  .object({
    applyDefaults: z.boolean().optional(),
  })
  .catchall(z.unknown());

// no preprocess here; if you still want {} -> { form: {} }, do it outside validation
const ElicitationCapabilitySchema = z
  .object({
    form: FormElicitationCapabilitySchema.optional(),
    url: AnyObjectSchema.optional(),
  })
  .catchall(z.unknown());

export const ClientTasksCapabilitySchema = z
  .object({
    list: AnyObjectSchema.optional(),
    cancel: AnyObjectSchema.optional(),
    requests: z
      .object({
        sampling: z
          .object({
            createMessage: AnyObjectSchema.optional(),
          })
          .catchall(z.unknown())
          .optional(),
        elicitation: z
          .object({
            create: AnyObjectSchema.optional(),
          })
          .catchall(z.unknown())
          .optional(),
      })
      .catchall(z.unknown())
      .optional(),
  })
  .catchall(z.unknown());

export const ServerTasksCapabilitySchema = z
  .object({
    list: AnyObjectSchema.optional(),
    cancel: AnyObjectSchema.optional(),
    requests: z
      .object({
        tools: z
          .object({
            call: AnyObjectSchema.optional(),
          })
          .catchall(z.unknown())
          .optional(),
      })
      .catchall(z.unknown())
      .optional(),
  })
  .catchall(z.unknown());

export const ClientCapabilitiesSchema = z.object({
  experimental: z.record(z.string(), AnyObjectSchema).optional(),
  sampling: z
    .object({
      context: AnyObjectSchema.optional(),
      tools: AnyObjectSchema.optional(),
    })
    .optional(),
  elicitation: ElicitationCapabilitySchema.optional(),
  roots: z
    .object({
      listChanged: z.boolean().optional(),
    })
    .optional(),
  tasks: ClientTasksCapabilitySchema.optional(),
});

export const InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
  protocolVersion: z.string(),
  capabilities: ClientCapabilitiesSchema,
  clientInfo: ImplementationSchema,
});

export const InitializeRequestSchema = RequestSchema.extend({
  method: z.literal('initialize'),
  params: InitializeRequestParamsSchema,
});

export const ServerCapabilitiesSchema = z.object({
  experimental: z.record(z.string(), AnyObjectSchema).optional(),
  logging: AnyObjectSchema.optional(),
  completions: AnyObjectSchema.optional(),
  prompts: z
    .object({
      listChanged: z.boolean().optional(),
    })
    .optional(),
  resources: z
    .object({
      subscribe: z.boolean().optional(),
      listChanged: z.boolean().optional(),
    })
    .optional(),
  tools: z
    .object({
      listChanged: z.boolean().optional(),
    })
    .optional(),
  tasks: ServerTasksCapabilitySchema.optional(),
});

export const InitializeResultSchema = ResultSchema.extend({
  protocolVersion: z.string(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema,
  instructions: z.string().optional(),
});

export const ToolSchema = z.object({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  description: z.string().optional(),
  inputSchema: JsonSchemaObjectRootSchema,
  outputSchema: JsonSchemaObjectRootSchema.optional(),
  annotations: ToolAnnotationsSchema.optional(),
  execution: ToolExecutionSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: z.array(ToolSchema),
});

export const CreateMessageRequestParamsSchema =
  TaskAugmentedRequestParamsSchema.extend({
    messages: z.array(SamplingMessageSchema),
    modelPreferences: ModelPreferencesSchema.optional(),
    systemPrompt: z.string().optional(),
    includeContext: z.enum(['none', 'thisServer', 'allServers']).optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().int(),
    stopSequences: z.array(z.string()).optional(),
    metadata: AnyObjectSchema.optional(),
    tools: z.array(ToolSchema).optional(),
    toolChoice: ToolChoiceSchema.optional(),
  });

export const CreateMessageRequestSchema = RequestSchema.extend({
  method: z.literal('sampling/createMessage'),
  params: CreateMessageRequestParamsSchema,
});

// better for JSON Schema export than plain union
export const ClientRequestSchema = z.discriminatedUnion('method', [
  PingRequestSchema,
  InitializeRequestSchema,
  CompleteRequestSchema,
  SetLevelRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetTaskRequestSchema,
  GetTaskPayloadRequestSchema,
  ListTasksRequestSchema,
  CancelTaskRequestSchema,
]);

export const ServerRequestSchema = z.discriminatedUnion('method', [
  PingRequestSchema,
  CreateMessageRequestSchema,
  ElicitRequestSchema,
  ListRootsRequestSchema,
  GetTaskRequestSchema,
  GetTaskPayloadRequestSchema,
  ListTasksRequestSchema,
  CancelTaskRequestSchema,
]);

// ServerResultSchema can stay a plain union; there is no common discriminator
export const ServerResultSchema = z.union([
  EmptyResultSchema,
  InitializeResultSchema,
  CompleteResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ReadResourceResultSchema,
  CallToolResultSchema,
  ListToolsResultSchema,
  GetTaskResultSchema,
  ListTasksResultSchema,
  CreateTaskResultSchema,
]);
