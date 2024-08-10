# Bull Monitor with basic auth for NocoDB

This provides a simple way to monitor the status of a Bull queue in NocoDB. It uses basic auth to secure the endpoint.

## Usage

Provide the following environment variables:
- `REDIS_HOST`: The host of the Redis server
- `REDIS_PORT`: The port of the Redis server
- `REDIS_DB`: The database of the Redis server -- optional
- `REDIS_PASSWORD`: The password of the Redis server -- optional
- `SESSION_SECRET`: The secret for the session -- default is `my-secret-key`
- `BASIC_AUTH_USERNAME`: The username for basic auth -- default is `admin`
- `BASIC_AUTH_PASSWORD`: The password for basic auth -- default is `bull`
- `BULL_PREFIX`: The prefix for the Bull queues -- default is `bull`
- `PORT`: The port for the server -- default is `3000`

It will try to detect all the queues using bull prefix and provide the status of each queue.


## Development

```bash
npm install
npm run start
```

## Docker

```bash
npm run build:docker
```
