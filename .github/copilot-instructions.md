# MCP Calendar Assistant - AI Coding Guidelines

## Architecture Overview

This is an Express.js application implementing a voice-controlled calendar assistant using the Model Context Protocol (MCP):

- **MCP Server** (`src/mcp-server/`): Exposes calendar tools (createEvent, listEvents, getEventsByDateRange) backed by CalDAV
- **MCP Client** (`src/mcp-client/`): Processes user prompts via OpenAI-compatible API and invokes MCP tools
- **API Layer** (`src/api/v1/`): REST endpoints for MCP server (`/api/v1/mcp`) and client (`/api/v1/client`)
- **CalDAV Integration** (`src/calDav/`): Calendar data persistence using `tsdav` library
- **Voice Pipeline**: Browser UI → Audio upload → Whisper transcription → MCP client → OpenAI → MCP tools → CalDAV

## Key Patterns & Conventions

### MCP Tool Registration
Use Zod schemas for input validation and register tools with descriptive metadata:

```typescript
const createEventInputSchema = z.object({
  start: z.iso.datetime().describe('Start date and time as ISO 8601 UTC'),
  title: z.string().describe('Event title'),
  // ... other fields
});

mcpServer.registerTool(
  'createEvent',
  {
    title: 'Create Calendar Event',
    description: 'Creates a new event in the calendar',
    inputSchema: createEventInputSchema,
  },
  async (input) => {
    // Tool implementation
    return { content: [{ type: 'text', text: result }] };
  }
);
```

### CalDAV Operations
Use singleton `DAVClient` instance and primary calendar pattern:

```typescript
const getPrimaryCalendar = async () => {
  const client = await getAuthenticatedClient();
  const calendars = await client.fetchCalendars();
  return { client, calendar: calendars[0] };
};
```

### Error Handling
Use `CustomError` class for consistent error responses:

```typescript
next(new CustomError('Descriptive error message', statusCode));
```

### Path Mapping
Import from `src/` using `@/` alias:

```typescript
import { mcpServer } from '@/mcp-server';
import CustomError from '@/classes/CustomError';
```

### Date/Time Handling
- Tool inputs: ISO 8601 UTC strings
- Internal processing: JavaScript `Date` objects
- CalDAV operations: ISO strings for time ranges

## Development Workflows

### Environment Setup
```bash
cp .env-sample .env
# Configure OPENAI_PROXY_URL, MCP_SERVER_URL, CalDAV credentials
```

### Development Server
```bash
npm run dev  # Uses nodemon + ts-node + tsconfig-paths
```

### Build & Run
```bash
npm run build  # tsc + tsc-alias to dist/
npm start      # node dist/index.js
```

### Testing
```bash
npm run test  # Jest with ts-jest, path mapping enabled
```

Tests require live CalDAV server. Integration tests create/delete real events.

## Integration Points

### OpenAI-Compatible API
- Chat completions: `POST /v1/chat/completions` with tools
- Audio transcription: `POST /v1/audio/transcriptions`
- Text-to-speech: `POST /v1/audio/speech` (optional)

### CalDAV Server
Defaults to local Radicale instance. Configure via `CALDAV_*` env vars.

### MCP Communication
StreamableHTTP transport between MCP client and server within the same Express app.

## File Upload Handling
- Audio files stored temporarily in `uploads/` directory
- Automatic cleanup after transcription
- Multer configuration with 25MB limit and audio-only filter

## Tool Response Format
MCP tools return structured content for AI consumption:

```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify(parsedEvents)  // Structured data as JSON string
  }]
};
```

## Browser UI
Simple static files in `public/` with client-side audio recording and WebSocket-free operation.</content>
<parameter name="filePath">d:\Semester 6\mcp-lab-starter\.github\copilot-instructions.md