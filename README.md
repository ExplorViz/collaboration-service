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

- Start local Redis instance: `docker compose -f .dev/compose.yaml up -d`
- Start application: `npm start`
- Start tests: `npm test`

## Building

- Execute `npm run build`
