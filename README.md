## Description

Service that enables collaborative features for ExplorViz.

## Installation

- `git clone <repository-url>` this repository
- `cd collaboration-service`
- `npm install`

## Running / Development

- Start local Redis instance: `docker compose -f .dev/compose.yaml up -d`
- Start application: `npm run start`

## Testing

### Unit Tests

- Run unit tests: `npm test`

### Integration Tests

- Start local Redis instance: `docker compose -f .dev/compose.yaml up -d`
- Start application: `npm run start`
- Wait for the server to be ready (running on port 4444)
- Run integration tests: `npm run test:supertest`

**Note:** Integration tests require the application server to be running. The tests will fail with connection errors if the server is not accessible.

## Building

- Execute `npm run build`
