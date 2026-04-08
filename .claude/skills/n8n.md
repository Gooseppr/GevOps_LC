name: n8n

description: >

  Expert n8n automation engineer and integration architect. Use this skill for

  ANY n8n-related task: building workflows programmatically via the REST API,

  creating and deploying custom nodes in TypeScript, designing automation

  pipelines, connecting Claude Code to a live n8n instance, debugging

  executions, managing credentials, creating webhooks, building AI agent

  workflows, and architecting multi-step automations. Triggers include:

  "create a workflow", "build an automation", "n8n node", "connect to n8n",

  "trigger a workflow", "webhook n8n", "custom node", "n8n API", "automate

  this", "build a pipeline", "n8n credential", "schedule workflow", "n8n

  execution", "deploy n8n", "n8n self-host", "n8n AI agent", or any mention

  of connecting apps, automating tasks, or building integrations. Always

  consult this skill before writing any n8n-related code — for both REST API

  calls and custom node development. This skill contains the complete

  reference for n8n development from Claude Code.

---


# ⚡ n8n Skill — Automation Engineering from Claude Code


You are a **senior n8n automation architect**. You build production-grade

workflows via the REST API, craft custom nodes in TypeScript, and design

multi-service pipelines. You always reference official n8n docs patterns,

write valid JSON workflow schemas, and validate before deploying.


Official docs: https://docs.n8n.io

API reference:  https://docs.n8n.io/api/api-reference/

Node building:  https://docs.n8n.io/integrations/creating-nodes/


---


## ⚙️ Phase 0 — Connection Setup


### Environment Configuration

```bash

# .env or shell config — set these before anything else

N8N_BASE_URL=http://localhost:5678      # or https://your-n8n.cloud

N8N_API_KEY=your_api_key_here           # Settings > n8n API > Create key

N8N_WEBHOOK_BASE=http://localhost:5678  # webhook base URL

```


### Get your API key

```

1. Open n8n UI

2. Go to Settings (bottom left) > n8n API

3. Click "Create an API key"

4. Copy the key — it won't be shown again

```


### Test your connection

```bash

# Verify API is reachable and key is valid

curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \

  "$N8N_BASE_URL/api/v1/workflows?limit=5" | jq '.data[].name'


# Expected: list of workflow names (or empty array)

```


### Python client setup

```python

import os

import requests

from typing import Any


class N8NClient:

    """Thin wrapper around the n8n REST API v1."""


    def __init__(self):

        self.base = os.environ["N8N_BASE_URL"].rstrip("/") + "/api/v1"

        self.headers = {

            "X-N8N-API-KEY": os.environ["N8N_API_KEY"],

            "Content-Type": "application/json",

        }


    def get(self, path: str, params: dict = {}) -> Any:

        r = requests.get(f"{self.base}{path}", headers=self.headers, params=params)

        r.raise_for_status()

        return r.json()


    def post(self, path: str, body: dict = {}) -> Any:

        r = requests.post(f"{self.base}{path}", headers=self.headers, json=body)

        r.raise_for_status()

        return r.json()


    def put(self, path: str, body: dict = {}) -> Any:

        r = requests.put(f"{self.base}{path}", headers=self.headers, json=body)

        r.raise_for_status()

        return r.json()


    def patch(self, path: str, body: dict = {}) -> Any:

        r = requests.patch(f"{self.base}{path}", headers=self.headers, json=body)

        r.raise_for_status()

        return r.json()


    def delete(self, path: str) -> Any:

        r = requests.delete(f"{self.base}{path}", headers=self.headers)

        r.raise_for_status()

        return r.json() if r.content else {}


n8n = N8NClient()

```


---


## 📋 Phase 1 — REST API Complete Reference


Base URL: `{N8N_BASE_URL}/api/v1`

Auth header: `X-N8N-API-KEY: {your_key}`

All responses: JSON. Pagination via `cursor` + `limit`.


### 1.1 Workflows

```python

# ── List all workflows ────────────────────────────────────────

GET /workflows

params: limit(int), cursor(str), active(bool), tags(str, comma-sep)


workflows = n8n.get("/workflows", {"limit": 50, "active": True})

for wf in workflows["data"]:

    print(wf["id"], wf["name"], wf["active"])


# ── Get single workflow ───────────────────────────────────────

GET /workflows/{id}

wf = n8n.get(f"/workflows/{workflow_id}")


# ── Create workflow ───────────────────────────────────────────

POST /workflows

body: { name, nodes[], connections{}, settings{}, staticData? }


new_wf = n8n.post("/workflows", {

    "name": "My Automation",

    "nodes": [...],           # see Node Schema below

    "connections": {...},     # see Connection Schema below

    "settings": {

        "executionOrder": "v1",

        "saveDataSuccessExecution": "all",

        "saveDataErrorExecution": "all",

        "saveManualExecutions": True,

        "timezone": "Europe/Paris",

    }

})

print(f"Created: {new_wf['id']}")


# ── Update workflow ───────────────────────────────────────────

PUT /workflows/{id}

# Full replacement — include all nodes and connections

n8n.put(f"/workflows/{workflow_id}", updated_workflow_object)


# ── Delete workflow ───────────────────────────────────────────

DELETE /workflows/{id}

n8n.delete(f"/workflows/{workflow_id}")


# ── Activate / Deactivate ─────────────────────────────────────

POST /workflows/{id}/activate    # make it run on triggers

POST /workflows/{id}/deactivate  # stop it

n8n.post(f"/workflows/{workflow_id}/activate")


# ── Manage tags on a workflow ─────────────────────────────────

GET  /workflows/{id}/tags

PUT  /workflows/{id}/tags  body: [{"id": "tag_id"}, ...]

```


### 1.2 Executions

```python

# ── List executions ───────────────────────────────────────────

GET /executions

params: limit, cursor, workflowId, status(waiting|running|success|error|canceled)

        includeData(bool)


execs = n8n.get("/executions", {

    "workflowId": workflow_id,

    "status": "error",

    "limit": 20,

})


# ── Get single execution ──────────────────────────────────────

GET /executions/{id}

params: includeData(bool) — include full node-by-node data

exec = n8n.get(f"/executions/{exec_id}", {"includeData": True})


# ── Delete execution ──────────────────────────────────────────

DELETE /executions/{id}

n8n.delete(f"/executions/{exec_id}")


# ── Retry a failed execution ──────────────────────────────────

POST /executions/{id}/retry

body: { loadWorkflow: bool }  # True = use latest wf version

n8n.post(f"/executions/{exec_id}/retry", {"loadWorkflow": True})

```


### 1.3 Credentials

```python

# ── List credential types ─────────────────────────────────────

GET /credential-types  (returns all available types)


# ── Create credential ─────────────────────────────────────────

POST /credentials

body: { name, type, data: { ...type-specific fields } }


cred = n8n.post("/credentials", {

    "name": "My Slack Workspace",

    "type": "slackApi",

    "data": {

        "accessToken": "xoxb-your-slack-bot-token"

    }

})


# Common credential types and their data fields:

# slackApi:        { accessToken }

# githubApi:       { accessToken }

# notionApi:       { apiKey }

# openAiApi:       { apiKey }

# googleSheetsOAuth2Api: (OAuth2 — configure in UI)

# httpHeaderAuth:  { name, value }  (generic API key header)

# httpBearerAuth:  { token }


# ── Delete credential ─────────────────────────────────────────

DELETE /credentials/{id}

```


### 1.4 Tags

```python

# ── CRUD for tags ─────────────────────────────────────────────

GET    /tags                         # list all tags

POST   /tags   { name: str }         # create tag

GET    /tags/{id}                    # get tag

PATCH  /tags/{id}  { name: str }     # rename

DELETE /tags/{id}                    # delete


tag = n8n.post("/tags", {"name": "production"})

```


### 1.5 Variables

```python

# ── Instance-wide variables ───────────────────────────────────

GET    /variables

POST   /variables  { key: str, value: str }

DELETE /variables/{id}


n8n.post("/variables", {"key": "OPENAI_MODEL", "value": "gpt-4o"})

# Access in workflows via: $vars.OPENAI_MODEL

```


### 1.6 Security Audit

```python

# ── Run a security audit on your instance ────────────────────

POST /audit

body: { categories: ["credentials","database","filesystem","instance","nodes"] }


audit = n8n.post("/audit", {"categories": ["credentials", "nodes"]})

```


---


## 🔧 Phase 2 — Workflow JSON Schema


Every workflow is a JSON object. Understanding the schema is required

to create workflows programmatically.


### Complete Node Schema

```json

{

  "id": "uuid-v4-string",

  "name": "Human readable name",

  "type": "n8n-nodes-base.httpRequest",

  "typeVersion": 4,

  "position": [x, y],

  "parameters": {

    // node-specific parameters — see each node's docs

  },

  "credentials": {

    "credentialTypeName": {

      "id": "credential-id",

      "name": "My Credential Name"

    }

  },

  "disabled": false,

  "notes": "Optional notes shown in UI",

  "continueOnFail": false,

  "retryOnFail": false,

  "maxTries": 3,

  "waitBetweenTries": 1000

}

```


### Connection Schema

```json

{

  "Source Node Name": {

    "main": [

      [

        {

          "node": "Target Node Name",

          "type": "main",

          "index": 0

        }

      ]

    ]

  }

}

// For conditional (IF node) with two branches:

{

  "IF": {

    "main": [

      [{ "node": "True Branch Node", "type": "main", "index": 0 }],

      [{ "node": "False Branch Node", "type": "main", "index": 0 }]

    ]

  }

}

```


---


## 🧩 Phase 3 — Core Node Reference & Parameters


### Trigger Nodes

```python

# ── Manual Trigger ────────────────────────────────────────────

{

  "type": "n8n-nodes-base.manualTrigger",

  "typeVersion": 1,

  "parameters": {}

}


# ── Schedule Trigger ──────────────────────────────────────────

{

  "type": "n8n-nodes-base.scheduleTrigger",

  "typeVersion": 1.2,

  "parameters": {

    "rule": {

      "interval": [

        { "field": "cronExpression", "expression": "0 9 * * 1-5" }

        # Alt: { "field": "hours", "hoursInterval": 1 }

        # Alt: { "field": "days",  "daysInterval": 1, "triggerAtHour": 9 }

      ]

    }

  }

}


# ── Webhook Trigger ───────────────────────────────────────────

{

  "type": "n8n-nodes-base.webhook",

  "typeVersion": 2,

  "parameters": {

    "httpMethod": "POST",         # GET | POST | PUT | PATCH | DELETE

    "path": "my-webhook-path",   # URL: {N8N_BASE}/webhook/my-webhook-path

    "responseMode": "lastNode",   # onReceived | lastNode | responseNode

    "responseData": "allEntries",

    "options": {

      "rawBody": False,

      "responseContentType": "application/json"

    }

  }

}


# ── Chat Trigger (AI) ─────────────────────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.chatTrigger",

  "typeVersion": 1,

  "parameters": {

    "public": False,

    "initialMessages": "How can I help you today?",

    "options": {}

  }

}

```


### Core Processing Nodes

```python

# ── HTTP Request ──────────────────────────────────────────────

{

  "type": "n8n-nodes-base.httpRequest",

  "typeVersion": 4.2,

  "parameters": {

    "method": "POST",

    "url": "https://api.example.com/endpoint",

    "sendHeaders": True,

    "headerParameters": {

      "parameters": [

        { "name": "Content-Type", "value": "application/json" }

      ]

    },

    "sendBody": True,

    "bodyContentType": "json",

    "bodyParameters": {

      "parameters": [

        { "name": "key", "value": "={{ $json.someField }}" }

      ]

    },

    "options": {

      "timeout": 10000,

      "redirect": { "redirect": { "followRedirects": True, "maxRedirects": 10 } },

      "response": { "response": { "fullResponse": False } }

    }

  }

}


# ── Set / Edit Fields ─────────────────────────────────────────

{

  "type": "n8n-nodes-base.set",

  "typeVersion": 3.4,

  "parameters": {

    "mode": "manual",

    "duplicateItem": False,

    "assignments": {

      "assignments": [

        { "id": "uuid", "name": "outputField", "type": "string",

          "value": "={{ $json.inputField }}" },

        { "id": "uuid", "name": "timestamp",   "type": "string",

          "value": "={{ $now.toISO() }}" },

        { "id": "uuid", "name": "count",       "type": "number",

          "value": "={{ $json.items.length }}" }

      ]

    }

  }

}


# ── IF / Conditional ──────────────────────────────────────────

{

  "type": "n8n-nodes-base.if",

  "typeVersion": 2.2,

  "parameters": {

    "conditions": {

      "options": { "caseSensitive": True, "leftValue": "", "typeValidation": "strict" },

      "conditions": [

        {

          "id": "uuid",

          "leftValue": "={{ $json.status }}",

          "rightValue": "active",

          "operator": { "type": "string", "operation": "equals" }

        }

      ],

      "combinator": "and"

    }

  }

}

# Operators: equals | notEquals | contains | notContains | startsWith |

#            endsWith | regex | exists | notExists | larger | smaller


# ── Code Node ─────────────────────────────────────────────────

{

  "type": "n8n-nodes-base.code",

  "typeVersion": 2,

  "parameters": {

    "mode": "runOnceForAllItems",  # or runOnceForEachItem

    "jsCode": """

// Available: $input, $items, $json, $node, $workflow, $vars, $now

const items = $input.all();

return items.map(item => ({

  json: {

    ...item.json,

    processed: true,

    timestamp: new Date().toISOString(),

  }

}));

"""

  }

}


# ── Merge ─────────────────────────────────────────────────────

{

  "type": "n8n-nodes-base.merge",

  "typeVersion": 3,

  "parameters": {

    "mode": "combine",     # append | combine | chooseBranch | mergeByKey | mergeByPosition

    "combinationMode": "mergeByPosition"

  }

}


# ── Wait ──────────────────────────────────────────────────────

{

  "type": "n8n-nodes-base.wait",

  "typeVersion": 1.1,

  "parameters": {

    "resume": "timeInterval",   # timeInterval | webhook | form

    "amount": 5,

    "unit": "minutes"           # seconds | minutes | hours | days

  }

}


# ── Split In Batches ──────────────────────────────────────────

{

  "type": "n8n-nodes-base.splitInBatches",

  "typeVersion": 3,

  "parameters": { "batchSize": 10, "options": {} }

}


# ── Respond to Webhook ────────────────────────────────────────

{

  "type": "n8n-nodes-base.respondToWebhook",

  "typeVersion": 1.1,

  "parameters": {

    "respondWith": "json",

    "responseBody": "={{ JSON.stringify($json) }}",

    "options": { "responseCode": 200 }

  }

}

```


### AI / LangChain Nodes

```python

# ── AI Agent ──────────────────────────────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.agent",

  "typeVersion": 1.7,

  "parameters": {

    "agent": "conversationalAgent",  # openAiFunctionsAgent | reActAgent

    "promptType": "define",

    "text": "={{ $json.chatInput }}",

    "systemMessage": "You are a helpful assistant.",

    "hasOutputParser": False,

    "options": { "maxIterations": 10 }

  }

}


# ── OpenAI Chat Model ─────────────────────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",

  "typeVersion": 1.1,

  "parameters": {

    "model": "gpt-4o",

    "options": { "temperature": 0.7, "maxTokens": 1000 }

  },

  "credentials": { "openAiApi": { "id": "cred_id", "name": "OpenAI" } }

}


# ── Simple Memory (AI chat history) ──────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",

  "typeVersion": 1.2,

  "parameters": { "sessionIdType": "autoGenerate", "contextWindowLength": 10 }

}


# ── Tool: HTTP Request ────────────────────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",

  "typeVersion": 1.1,

  "parameters": {

    "url": "https://api.example.com/search",

    "sendQuery": True,

    "queryParameters": { "parameters": [{ "name": "q", "value": "{query}" }] },

    "toolDescription": "Search external API for data"

  }

}


# ── Tool: Call n8n Workflow ───────────────────────────────────

{

  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",

  "typeVersion": 1.2,

  "parameters": {

    "name": "database_lookup",

    "workflowId": { "value": "other-workflow-id" },

    "description": "Looks up records in the database"

  }

}

```


---


## 🐍 Phase 4 — Workflow Builder (Python SDK)

```python

import uuid

import json


def node_id() -> str:

    return str(uuid.uuid4())


def make_position(x: int, y: int) -> list:

    return [x, y]


class WorkflowBuilder:

    """Programmatic n8n workflow construction."""


    def __init__(self, name: str):

        self.name = name

        self.nodes: list = []

        self.connections: dict = {}

        self._last_node_name: str | None = None


    def add_node(self, node: dict, connect_from: str | None = "auto") -> "WorkflowBuilder":

        """Add a node and optionally auto-connect from the last node."""

        self.nodes.append(node)

        src = connect_from if connect_from != "auto" else self._last_node_name

        if src and connect_from != None:

            self.connect(src, node["name"])

        self._last_node_name = node["name"]

        return self


    def connect(self, from_node: str, to_node: str,

                from_branch: int = 0, to_index: int = 0) -> "WorkflowBuilder":

        """Add a connection between two nodes."""

        if from_node not in self.connections:

            self.connections[from_node] = {"main": []}

        while len(self.connections[from_node]["main"]) <= from_branch:

            self.connections[from_node]["main"].append([])

        self.connections[from_node]["main"][from_branch].append(

            {"node": to_node, "type": "main", "index": to_index}

        )

        return self


    def build(self) -> dict:

        return {

            "name": self.name,

            "nodes": self.nodes,

            "connections": self.connections,

            "settings": {

                "executionOrder": "v1",

                "saveDataSuccessExecution": "all",

                "saveDataErrorExecution": "all",

                "saveManualExecutions": True,

            }

        }


    def deploy(self, activate: bool = False) -> dict:

        wf = n8n.post("/workflows", self.build())

        if activate:

            n8n.post(f"/workflows/{wf['id']}/activate")

        print(f"✅ Deployed: {wf['name']} (id={wf['id']}, active={activate})")

        return wf



# ── Example: Build a complete webhook → transform → notify workflow ──

def build_webhook_slack_workflow(slack_cred_id: str) -> dict:

    builder = WorkflowBuilder("Webhook → Process → Slack")


    builder.add_node({

        "id": node_id(), "name": "Webhook", "position": [250, 300],

        "type": "n8n-nodes-base.webhook", "typeVersion": 2,

        "parameters": {

            "httpMethod": "POST",

            "path": "my-automation",

            "responseMode": "lastNode",

        }

    }, connect_from=None)  # trigger — no incoming connection


    builder.add_node({

        "id": node_id(), "name": "Transform Data", "position": [500, 300],

        "type": "n8n-nodes-base.set", "typeVersion": 3.4,

        "parameters": {

            "mode": "manual",

            "assignments": {

                "assignments": [

                    {"id": node_id(), "name": "message",

                     "type": "string",

                     "value": "={{ 'New event: ' + $json.body.event }}"},

                    {"id": node_id(), "name": "ts",

                     "type": "string",

                     "value": "={{ $now.toISO() }}"},

                ]

            }

        }

    })


    builder.add_node({

        "id": node_id(), "name": "Notify Slack", "position": [750, 300],

        "type": "n8n-nodes-base.slack", "typeVersion": 2.3,

        "parameters": {

            "resource": "message", "operation": "post",

            "channel": { "value": "#alerts", "__rl": True, "mode": "name" },

            "text": "={{ $json.message }}",

            "otherOptions": {}

        },

        "credentials": {

            "slackApi": { "id": slack_cred_id, "name": "Slack" }

        }

    })


    builder.add_node({

        "id": node_id(), "name": "Respond to Webhook", "position": [1000, 300],

        "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1.1,

        "parameters": {

            "respondWith": "json",

            "responseBody": '={"ok": true, "ts": "{{ $json.ts }}"}',

            "options": { "responseCode": 200 }

        }

    })


    return builder.deploy(activate=True)

```


---


## 🔨 Phase 5 — Custom Node Development


When no built-in node covers your use case, build one in TypeScript.


### Project Scaffold

```bash

# Create a new node package with the official CLI

npm create @n8n/node@latest

# → Choose: declarative or programmatic style

# → Enter: package name, display name, description


# Or use the starter repo

git clone https://github.com/n8n-io/n8n-nodes-starter my-nodes

cd my-nodes

npm install

```


### Project Structure

```

my-n8n-nodes/

├── package.json              ← n8n registration here

├── tsconfig.json

├── nodes/

│   └── MyNode/

│       ├── MyNode.node.ts    ← main node file

│       ├── MyNode.node.json  ← codex (description + examples)

│       └── mynode.svg        ← icon (60×60px)

└── credentials/

    └── MyNodeApi.credentials.ts

```


### package.json (required fields)

```json

{

  "name": "n8n-nodes-myservice",

  "version": "0.1.0",

  "n8n": {

    "n8nNodesApiVersion": 1,

    "credentials": ["dist/credentials/MyNodeApi.credentials.js"],

    "nodes":       ["dist/nodes/MyNode/MyNode.node.js"]

  },

  "keywords": ["n8n-community-node-package"],

  "scripts": {

    "build": "tsc && gulp build:icons",

    "dev":   "n8n-node dev",

    "lint":  "eslint nodes credentials --ext .ts"

  }

}

```


### Declarative Node (recommended for API integrations)

```typescript

// nodes/MyService/MyService.node.ts

import { INodeType, INodeTypeDescription } from 'n8n-workflow';


export class MyService implements INodeType {

  description: INodeTypeDescription = {

    displayName:  'My Service',

    name:         'myService',

    icon:         'file:myservice.svg',

    group:        ['transform'],

    version:      1,

    description:  'Interact with My Service API',

    defaults:     { name: 'My Service' },

    inputs:       ['main'],

    outputs:      ['main'],

    credentials: [{

      name:     'myServiceApi',

      required: true,

    }],

    requestDefaults: {

      baseURL: 'https://api.myservice.com/v1',

      headers: { Accept: 'application/json' },

    },

    properties: [

      {

        displayName: 'Resource',

        name:        'resource',

        type:        'options',

        noDataExpression: true,

        options: [

          { name: 'User',    value: 'user'    },

          { name: 'Project', value: 'project' },

        ],

        default: 'user',

      },

      {

        displayName: 'Operation',

        name:        'operation',

        type:        'options',

        noDataExpression: true,

        displayOptions: { show: { resource: ['user'] } },

        options: [

          {

            name:  'Get',

            value: 'get',

            action: 'Get a user',

            routing: {

              request: { method: 'GET', url: '/users/={{ $parameter.userId }}' }

            }

          },

          {

            name:  'Create',

            value: 'create',

            action: 'Create a user',

            routing: {

              request: {

                method: 'POST',

                url:    '/users',

                body: {

                  name:  '={{ $parameter.name  }}',

                  email: '={{ $parameter.email }}',

                }

              }

            }

          },

        ],

        default: 'get',

      },

      // ── Conditional fields ──

      {

        displayName: 'User ID',

        name:        'userId',

        type:        'string',

        required:    true,

        displayOptions: { show: { resource: ['user'], operation: ['get'] } },

        default: '',

        description: 'The ID of the user to retrieve',

      },

      {

        displayName: 'Name',

        name:        'name',

        type:        'string',

        required:    true,

        displayOptions: { show: { resource: ['user'], operation: ['create'] } },

        default: '',

      },

      {

        displayName: 'Email',

        name:        'email',

        type:        'string',

        required:    true,

        displayOptions: { show: { resource: ['user'], operation: ['create'] } },

        default: '',

        placeholder: 'hello@example.com',

      },

    ],

  };

}

```


### Programmatic Node (for complex logic)

```typescript

// nodes/MyNode/MyNode.node.ts

import {

  IExecuteFunctions,

  INodeExecutionData,

  INodeType,

  INodeTypeDescription,

  NodeOperationError,

} from 'n8n-workflow';


export class MyNode implements INodeType {

  description: INodeTypeDescription = {

    displayName: 'My Custom Node',

    name:        'myCustomNode',

    icon:        'file:mynode.svg',

    group:       ['transform'],

    version:     1,

    description: 'Does custom data processing',

    defaults:    { name: 'My Custom Node' },

    inputs:      ['main'],

    outputs:     ['main'],

    credentials: [{ name: 'myApiCredentials', required: true }],

    properties: [

      {

        displayName: 'Operation',

        name:        'operation',

        type:        'options',

        noDataExpression: true,

        options: [

          { name: 'Process', value: 'process', action: 'Process items' },

          { name: 'Validate', value: 'validate', action: 'Validate items' },

        ],

        default: 'process',

      },

      {

        displayName: 'Field Name',

        name:        'fieldName',

        type:        'string',

        default:     'data',

        description: 'Name of the field to process',

        required:    true,

      },

    ],

  };


  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

    const items     = this.getInputData();

    const operation = this.getNodeParameter('operation', 0) as string;

    const returnData: INodeExecutionData[] = [];


    // Get credentials

    const credentials = await this.getCredentials('myApiCredentials') as {

      baseUrl: string;

      apiKey:  string;

    };


    for (let i = 0; i < items.length; i++) {

      try {

        const fieldName = this.getNodeParameter('fieldName', i) as string;

        const value     = items[i].json[fieldName];


        if (operation === 'process') {

          // Make external API call

          const response = await this.helpers.request({

            method: 'POST',

            url:    `${credentials.baseUrl}/process`,

            headers: { Authorization: `Bearer ${credentials.apiKey}` },

            json: { value },

          });

          returnData.push({

            json: { ...items[i].json, result: response, processed: true },

            pairedItem: { item: i },

          });


        } else if (operation === 'validate') {

          const isValid = value !== undefined && value !== null && value !== '';

          returnData.push({

            json: { ...items[i].json, valid: isValid, fieldName },

            pairedItem: { item: i },

          });

        }


      } catch (error) {

        if (this.continueOnFail()) {

          returnData.push({

            json: { error: (error as Error).message, item: i },

            pairedItem: { item: i },

          });

        } else {

          throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });

        }

      }

    }


    return [returnData];

  }

}

```


### Credential File

```typescript

// credentials/MyNodeApi.credentials.ts

import { ICredentialType, INodeProperties } from 'n8n-workflow';


export class MyNodeApi implements ICredentialType {

  name         = 'myApiCredentials';

  displayName  = 'My Service API';

  documentationUrl = 'https://docs.myservice.com/auth';

  properties: INodeProperties[] = [

    {

      displayName: 'Base URL',

      name:        'baseUrl',

      type:        'string',

      default:     'https://api.myservice.com/v1',

    },

    {

      displayName: 'API Key',

      name:        'apiKey',

      type:        'string',

      typeOptions: { password: true },

      default:     '',

    },

  ];


  // Optional: test the credential on creation

  test = {

    request: {

      baseURL: '={{$credentials.baseUrl}}',

      url:     '/me',

      headers: { Authorization: '=Bearer {{$credentials.apiKey}}' },

    }

  };

}

```


### Deploy Custom Node

```bash

# ── Local development (npm link) ──────────────────────────────

cd my-n8n-nodes

npm run build

npm link


cd ~/.n8n

npm link n8n-nodes-myservice

n8n start   # node appears in the UI


# ── Self-hosted / Docker deployment ──────────────────────────

npm run build

# Copy built files to n8n custom directory:

cp -r dist/nodes/MyNode     ~/.n8n/custom/nodes/

cp -r dist/credentials/     ~/.n8n/custom/credentials/

# Restart n8n


# ── Docker volume mount ───────────────────────────────────────

# docker-compose.yml:

# volumes:

#   - ./my-n8n-nodes:/home/node/.n8n/custom/my-n8n-nodes


# ── Publish to npm (community node) ──────────────────────────

npm publish --access public

# Install from n8n UI: Settings > Community Nodes > Install

```


---


## 🤖 Phase 6 — Claude + n8n Automation Patterns


### Pattern 1: Claude triggers n8n via webhook

```python

# Claude Code calls an n8n webhook to kick off a workflow

import requests


def trigger_n8n_workflow(webhook_path: str, payload: dict) -> dict:

    """Trigger any active n8n webhook workflow."""

    url = f"{os.environ['N8N_WEBHOOK_BASE']}/webhook/{webhook_path}"

    response = requests.post(url, json=payload, timeout=30)

    response.raise_for_status()

    return response.json()


# Usage

result = trigger_n8n_workflow("process-new-user", {

    "userId": "123",

    "email": "user@example.com",

    "plan": "pro"

})

```


### Pattern 2: n8n calls Claude via HTTP Request node

```json

// HTTP Request node config to call Claude API from n8n

{

  "method": "POST",

  "url": "https://api.anthropic.com/v1/messages",

  "sendHeaders": true,

  "headerParameters": {

    "parameters": [

      { "name": "x-api-key",         "value": "={{ $vars.ANTHROPIC_API_KEY }}" },

      { "name": "anthropic-version", "value": "2023-06-01" },

      { "name": "Content-Type",      "value": "application/json" }

    ]

  },

  "sendBody": true,

  "bodyContentType": "json",

  "bodyParameters": {

    "parameters": [

      { "name": "model",      "value": "claude-sonnet-4-5" },

      { "name": "max_tokens", "value": 1024 },

      { "name": "messages",   "value": "={{ [{\"role\": \"user\", \"content\": $json.userMessage}] }}" }

    ]

  }

}

```


### Pattern 3: Claude Code creates workflows on demand

```python

def create_workflow_from_description(description: str) -> dict:

    """

    Have Claude design and deploy a workflow from a text description.

    Claude Code → generates JSON → deploys via API → returns live URL.

    """

    # 1. Build the workflow JSON from description

    # 2. Deploy via n8n.post("/workflows", workflow_json)

    # 3. Activate if it has triggers

    # 4. Return the workflow URL


    # Claude Code implements the logic based on description

    # Then calls: n8n.post("/workflows", built_workflow)

    pass


# Examples of what Claude Code can generate and deploy:

# "Every morning at 9am, fetch our analytics and post to Slack"

# "When a GitHub issue is labeled 'urgent', create a Notion task"

# "Monitor our API health every 5 minutes, alert on failures"

```


### Pattern 4: Workflow monitoring script

```python

def monitor_workflows() -> None:

    """Daily health check on all active workflows."""

    active = n8n.get("/workflows", {"active": True})


    for wf in active["data"]:

        # Get recent executions for this workflow

        execs = n8n.get("/executions", {

            "workflowId": wf["id"],

            "limit": 10,

            "status": "error"

        })

        errors = execs["data"]

        if errors:

            print(f"⚠️  {wf['name']}: {len(errors)} recent errors")

            for e in errors[:3]:

                print(f"   └─ {e['id']} at {e['startedAt']}")

        else:

            print(f"✅ {wf['name']}: healthy")

```


---


## 🔧 Phase 7 — Common Workflow Templates (Ready to Deploy)


### Template: Daily Report Pipeline

```python

def deploy_daily_report(source_url: str, slack_cred_id: str, channel: str) -> dict:

    """Fetch data daily, process it, post to Slack."""

    return (WorkflowBuilder("Daily Report")

        .add_node({

            "id": node_id(), "name": "Schedule", "position": [250, 300],

            "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2,

            "parameters": {"rule": {"interval": [

                {"field": "cronExpression", "expression": "0 9 * * 1-5"}

            ]}}

        }, connect_from=None)

        .add_node({

            "id": node_id(), "name": "Fetch Data", "position": [500, 300],

            "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,

            "parameters": {"method": "GET", "url": source_url}

        })

        .add_node({

            "id": node_id(), "name": "Format Report", "position": [750, 300],

            "type": "n8n-nodes-base.code", "typeVersion": 2,

            "parameters": {"mode": "runOnceForAllItems", "jsCode": """

const data = $input.first().json;

return [{ json: {

  text: `📊 Daily Report\\n${JSON.stringify(data, null, 2)}`

}}];

"""}

        })

        .add_node({

            "id": node_id(), "name": "Post Slack", "position": [1000, 300],

            "type": "n8n-nodes-base.slack", "typeVersion": 2.3,

            "parameters": {

                "resource": "message", "operation": "post",

                "channel": {"value": channel, "__rl": True, "mode": "name"},

                "text": "={{ $json.text }}",

                "otherOptions": {}

            },

            "credentials": {"slackApi": {"id": slack_cred_id, "name": "Slack"}}

        })

        .deploy(activate=True))

```


### Template: Webhook → AI → Response

```python

def deploy_ai_webhook(openai_cred_id: str, system_prompt: str) -> dict:

    """Receive a message via webhook, process with AI, respond."""

    return (WorkflowBuilder("AI Webhook Handler")

        .add_node({

            "id": node_id(), "name": "Webhook", "position": [250, 300],

            "type": "n8n-nodes-base.webhook", "typeVersion": 2,

            "parameters": {"httpMethod": "POST", "path": "ai-chat",

                           "responseMode": "lastNode"}

        }, connect_from=None)

        .add_node({

            "id": node_id(), "name": "Extract Message", "position": [500, 300],

            "type": "n8n-nodes-base.set", "typeVersion": 3.4,

            "parameters": {"mode": "manual", "assignments": {"assignments": [

                {"id": node_id(), "name": "userMessage", "type": "string",

                 "value": "={{ $json.body.message }}"}

            ]}}

        })

        .add_node({

            "id": node_id(), "name": "Call AI", "position": [750, 300],

            "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,

            "parameters": {

                "method": "POST",

                "url": "https://api.anthropic.com/v1/messages",

                "sendHeaders": True,

                "headerParameters": {"parameters": [

                    {"name": "x-api-key", "value": "={{ $vars.ANTHROPIC_KEY }}"},

                    {"name": "anthropic-version", "value": "2023-06-01"},

                ]},

                "sendBody": True, "bodyContentType": "json",

                "bodyParameters": {"parameters": [

                    {"name": "model", "value": "claude-haiku-4-5"},

                    {"name": "max_tokens", "value": "1024"},

                    {"name": "system", "value": system_prompt},

                    {"name": "messages", "value":

                     '=[{"role": "user", "content": "{{ $json.userMessage }}"}]'},

                ]}

            }

        })

        .add_node({

            "id": node_id(), "name": "Respond", "position": [1000, 300],

            "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1.1,

            "parameters": {

                "respondWith": "json",

                "responseBody": '={"reply": "{{ $json.content[0].text }}"}',

                "options": {"responseCode": 200}

            }

        })

        .deploy(activate=True))

```


---


## 🐛 Phase 8 — Debugging & Troubleshooting


### Common errors and fixes

```

Error: "Workflow could not be activated — webhook path already exists"

Fix:   Change the webhook path or deactivate the conflicting workflow

       n8n.post(f"/workflows/{other_wf_id}/deactivate")


Error: "Credentials not found" on deployment

Fix:   Credential ID must exist — create it first via POST /credentials


Error: Workflow created but nodes not visible in UI

Fix:   Ensure nodes array is not empty and each node has id, name, type,

       typeVersion, position, and parameters fields


Error: Connection not working

Fix:   Connection keys must be the exact node "name" string, not the ID

       The "main" array index corresponds to output branch (0=true, 1=false for IF)


Error: Expression {{ $json.field }} returning undefined

Fix:   Use $json.body.field for webhook payloads (data is nested under body)

       Use $input.first().json.field when accessing previous node explicitly

```


### Execution debugging script

```python

def debug_workflow(workflow_id: str, last_n: int = 5):

    """Print the last N executions with error details."""

    execs = n8n.get("/executions", {

        "workflowId": workflow_id,

        "limit": last_n,

        "includeData": False,

    })

    for e in execs["data"]:

        status_icon = {"success": "✅", "error": "❌", "running": "🔄",

                       "waiting": "⏳"}.get(e["status"], "❓")

        print(f"{status_icon} {e['id']} | {e['status']} | started: {e['startedAt']}")

        if e.get("data", {}).get("resultData", {}).get("error"):

            err = e["data"]["resultData"]["error"]

            print(f"   └─ Error: {err.get('message', 'unknown')}")

            print(f"   └─ Node:  {err.get('node', {}).get('name', '?')}")

```


---


## 📚 Phase 9 — Reference Links

```

Official docs:        https://docs.n8n.io

API reference:        https://docs.n8n.io/api/api-reference/

Node building:        https://docs.n8n.io/integrations/creating-nodes/

Declarative nodes:    https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/

Programmatic nodes:   https://docs.n8n.io/integrations/creating-nodes/build/programmatic-style-node/

Starter repo:         https://github.com/n8n-io/n8n-nodes-starter

Community nodes npm:  https://www.npmjs.com/search?q=keywords:n8n-community-node-package

Workflow templates:   https://n8n.io/workflows/

Expression docs:      https://docs.n8n.io/code/expressions/

Built-in variables:   https://docs.n8n.io/code/builtin/overview/

Community forum:      https://community.n8n.io

```


### Built-in n8n expressions quick ref

```javascript

// Current item

$json.fieldName          // field from current node output

$input.first().json      // first item from previous node

$input.all()             // all items from previous node

$items("Node Name")      // items from specific node


// Metadata

$workflow.id             // current workflow ID

$workflow.name           // current workflow name

$execution.id            // current execution ID

$node.name               // current node name

$now                     // current DateTime object

$today                   // today at midnight


// Helpers

$if(condition, val1, val2)

$min(a, b) / $max(a, b)

$jmespath($json, "query")  // JMESPath query

```


---


*Always test workflows in a staging n8n instance before deploying to

production. Use n8n.post("/workflows/{id}/deactivate") to safely pause

any workflow. Keep API keys in n8n Variables, never hardcoded in nodes.*
