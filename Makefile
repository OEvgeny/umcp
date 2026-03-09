export PATH := $(realpath ../node_modules/.bin):$(PATH)
OUT := out

MCP_SDK_TYPES_IMPORT := @modelcontextprotocol/sdk/types.js

AJV_SRC := node_modules/ajv-esm/ajv.js
AJV_FORMATS_SRC := node_modules/ajv-esm/ajv-formats.js
MCP_ZOD_COMPAT_SRC := node_modules/zod-compat/mcp-zod-compat.js
MCP_SDK_TYPES_SRC := node_modules/mcp/mcp-sdk-types.js
MCP_SDK_SHARED_SRC := node_modules/mcp/mcp-sdk-shared.js
MCP_SDK_SERVER_SRC := node_modules/mcp/mcp-sdk-server.js
MCP_SDK_CLIENT_SRC := node_modules/mcp/mcp-sdk-client.js
MCP_APPS_EXTENSION_SRC := node_modules/mcp/mcp-ext-apps.js

AJV_OUT := $(OUT)/ajv.js
AJV_FORMATS_OUT := $(OUT)/ajv-formats.js
MCP_ZOD_COMPAT_OUT := $(OUT)/mcp-zod-compat.js
MCP_SDK_JSON_TYPES_OUT := $(OUT)/mcp-sdk-json-types.js
MCP_SDK_TYPES_OUT := $(OUT)/mcp-sdk-types.js
MCP_SDK_SHARED_OUT := $(OUT)/mcp-sdk-shared.js
MCP_SDK_SERVER_OUT := $(OUT)/mcp-sdk-server.js
MCP_SDK_CLIENT_OUT := $(OUT)/mcp-sdk-client.js
MCP_APPS_EXTENSION_OUT := $(OUT)/mcp-ext-apps.js

AJV_ALIAS := --alias:ajv=./ajv.js --external:./ajv.js
AJV_FORMATS_ALIAS := --alias:ajv-formats=./ajv-formats.js --external:./ajv-formats.js
ZOD_ALIAS := --alias:zod/v3=./mcp-zod-compat.js --alias:zod/v4=./mcp-zod-compat.js --alias:zod/v4-mini=./mcp-zod-compat.js --alias:zod=./mcp-zod-compat.js --external:./mcp-zod-compat.js

ESBUILD_SHARED_FLAGS := --sourcemap --format=esm --bundle --platform=browser --tree-shaking=true

TSC_SHARED_FLAGS := --allowJs --declaration --emitDeclarationOnly --noCheck --module esnext --moduleResolution bundler --verbatimModuleSyntax --esModuleInterop

.PHONY: all clean install-deps

all: clean $(MCP_ZOD_COMPAT_OUT) $(MCP_SDK_JSON_TYPES_OUT) $(MCP_SDK_SERVER_OUT) $(MCP_SDK_CLIENT_OUT) $(MCP_APPS_EXTENSION_OUT) $(OUT)/package.json

install-deps: node_modules/@modelcontextprotocol/ext-apps/package.json

$(OUT):
	mkdir -p $(OUT)

$(OUT)/package.json: $(OUT)
$(OUT)/package.json: umcp/package.json
	cp $< $@

node_modules/@modelcontextprotocol/ext-apps/package.json:
  npm i --no-save https://github.com/modelcontextprotocol/ext-apps/archive/refs/tags/v1.2.0.tar.gz
 
$(AJV_OUT): $(OUT)
$(AJV_OUT): $(AJV_SRC)
	esbuild $(AJV_SRC) --outfile=$(AJV_OUT) $(ESBUILD_SHARED_FLAGS)
	tsc $(AJV_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(AJV_FORMATS_OUT): $(OUT)
$(AJV_FORMATS_OUT): $(AJV_FORMATS_SRC)
	esbuild $(AJV_FORMATS_SRC) --outfile=$(AJV_FORMATS_OUT) $(ESBUILD_SHARED_FLAGS)
	tsc $(AJV_FORMATS_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(MCP_SDK_JSON_TYPES_OUT): $(OUT)
$(MCP_SDK_JSON_TYPES_OUT):
	zod-to-json $(MCP_SDK_TYPES_IMPORT) $(MCP_SDK_JSON_TYPES_OUT)

$(MCP_ZOD_COMPAT_OUT): $(OUT)
$(MCP_ZOD_COMPAT_OUT): $(MCP_ZOD_COMPAT_SRC)
	esbuild $(MCP_ZOD_COMPAT_SRC) --outfile=$(MCP_ZOD_COMPAT_OUT) $(ESBUILD_SHARED_FLAGS)
	cp node_modules/zod-compat/index.d.ts $(OUT)/mcp-zod-compat.d.ts

$(MCP_SDK_TYPES_OUT): $(OUT)
$(MCP_SDK_TYPES_OUT): $(MCP_SDK_TYPES_SRC) $(MCP_ZOD_COMPAT_OUT)
	esbuild $(MCP_SDK_TYPES_SRC) --outfile=$(MCP_SDK_TYPES_OUT) $(ESBUILD_SHARED_FLAGS) $(ZOD_ALIAS) \
	--alias:zod-to-json-schema=./mcp-zod-compat.js
	tsc $(MCP_SDK_TYPES_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(MCP_SDK_SHARED_OUT): $(OUT)
$(MCP_SDK_SHARED_OUT): $(MCP_SDK_SHARED_SRC) $(MCP_ZOD_COMPAT_OUT)
	esbuild $(MCP_SDK_SHARED_SRC) --outfile=$(MCP_SDK_SHARED_OUT) $(ESBUILD_SHARED_FLAGS) $(ZOD_ALIAS) \
	--alias:zod-to-json-schema=./mcp-zod-compat.js
	tsc $(MCP_SDK_SHARED_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(MCP_SDK_SERVER_OUT): $(OUT)
$(MCP_SDK_SERVER_OUT): $(MCP_SDK_SERVER_SRC) $(MCP_SDK_TYPES_OUT) $(MCP_SDK_SHARED_OUT) $(AJV_OUT) $(AJV_FORMATS_OUT) $(MCP_ZOD_COMPAT_OUT)
	esbuild $(MCP_SDK_SERVER_SRC) --outfile=$(MCP_SDK_SERVER_OUT) $(ESBUILD_SHARED_FLAGS) $(AJV_ALIAS) $(AJV_FORMATS_ALIAS) $(ZOD_ALIAS) \
	--alias:zod-to-json-schema=./mcp-zod-compat.js \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/types.js \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
	replace-strings $(MCP_SDK_SERVER_OUT) -- ../node_modules/@modelcontextprotocol/sdk/dist/esm/types.js:./mcp-sdk-types.js \
	../node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:./mcp-sdk-shared.js
	tsc $(MCP_SDK_SERVER_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(MCP_SDK_CLIENT_OUT): $(OUT)
$(MCP_SDK_CLIENT_OUT): $(MCP_SDK_CLIENT_SRC) $(MCP_SDK_TYPES_OUT) $(MCP_SDK_SHARED_OUT) $(AJV_OUT) $(AJV_FORMATS_OUT) $(MCP_ZOD_COMPAT_OUT)
	esbuild $(MCP_SDK_CLIENT_SRC) --outfile=$(MCP_SDK_CLIENT_OUT) $(ESBUILD_SHARED_FLAGS) $(AJV_ALIAS) $(AJV_FORMATS_ALIAS) $(ZOD_ALIAS) \
	--alias:zod-to-json-schema=./mcp-zod-compat.js \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/types.js \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
	replace-strings $(MCP_SDK_CLIENT_OUT) -- ../node_modules/@modelcontextprotocol/sdk/dist/esm/types.js:./mcp-sdk-types.js \
	../node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:./mcp-sdk-shared.js
	tsc $(MCP_SDK_CLIENT_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)

$(MCP_APPS_EXTENSION_OUT): $(OUT)
$(MCP_APPS_EXTENSION_OUT): $(MCP_APPS_EXTENSION_SRC) $(MCP_SDK_TYPES_OUT) $(MCP_SDK_SHARED_OUT) $(MCP_ZOD_COMPAT_OUT) $(MCP_SDK_TYPES_OUT)
	esbuild $(MCP_APPS_EXTENSION_SRC) --outfile=$(MCP_APPS_EXTENSION_OUT) $(ESBUILD_SHARED_FLAGS) $(ZOD_ALIAS) \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/types.js \
	--external:./node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
	replace-strings $(MCP_APPS_EXTENSION_OUT) -- ../node_modules/@modelcontextprotocol/sdk/dist/esm/types.js:./mcp-sdk-types.js \
	../node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:./mcp-sdk-shared.js
	tsc $(MCP_APPS_EXTENSION_SRC) --outDir $(OUT) $(TSC_SHARED_FLAGS)
	replace-strings $(OUT)/mcp-ext-apps.d.ts -- ../../node_modules/@modelcontextprotocol/ext-apps/src/app.ts:@modelcontextprotocol/ext-apps/types

clean:
	rm -rf $(OUT)
