# Beep API

The Beep API is the backend of the Beep app.

## Table of content

1. [Technologies used](#technologies-used)
2. [Justification of Technology choices](#justification-of-technology-choices)
3. [Architecture](#architecture)
4. [Routing description](#routing-description)
5. [Start the app in development mode](#start-the-app-in-development-mode)
6. [Husky pre-commit hooks](#pre-commit-with-husky)
7. [Launching tests](#launching-tests)

## Technologies used

We mainly use the following technologies :

### Language

- Javascript

### Framework

- AdonisJS

### Database

- PostgreSQL
- Redis
- Minio

### Other

- Docker
- Dokku
- SMTP Server

## Justification of technology choices

### Language: JavaScript

JavaScript, with Node.js, is the primary language of the application. Its selection is justified due to the demand of the teachers but also due to its widespread adoption.

### Framework: AdonisJS

AdonisJS is selected as the framework for building the backend due to its robust feature set, strong conventions, and focus on developer productivity. Its powerful command-line interface streamlines common development tasks making it easier to start the project and collaborate between members.

### Database: PostgreSQL, Redis, Minio

- **PostgreSQL**: Chosen as the primary relational database management system (RDBMS) due to its reliability, performance, and rich feature set. PostgreSQL offers advanced SQL capabilities, support for complex data types, and robust transaction support, making it well-suited for handling the application's data storage needs in terms of users, channels and messages handling.

- **Redis**: Selected as an in-memory data store and caching solution to improve performance and scalability. We mainly use Redis to keep track of the real-time connected users.

- **Minio**: Utilized as an object storage solution for storing unstructured data such as images, documents, and media files. We use Minio to store all files exchanged between users of the app.

### Other: Docker, Dokku and SMTP Server

Docker is chosen as the containerization technology to streamline the deployment process, improve scalability, and enhance portability across different environments.

The SMTP server handles the emails to validate an account and its the way to retrieve the password if you forget it.

Finally Dokku is integrated with the existing Docker setup to streamline the deployment process. It simplifies the management and scaling of the containerized application, providing a Heroku-like platform. With Dokku, we deploy, manage, and easily scale our application using simple Git push commands.

## Architecture

![Description of the architecture of the API](image.png)

##  Routing description

Following below are all the routes described in the API

| Route                        | Method | Prefix          | Middleware | Controller               | Action      | Description                                |
| ---------------------------- | ------ | --------------- | ---------- | ------------------------ | ----------- | ------------------------------------------ |
| /authentication/login        | POST   | /authentication |            | AuthenticationController | login       | Logs in a user.                            |
| /authentication/register     | POST   | /authentication |            | AuthenticationController | register    | Registers a new user.                      |
| /authentication/verify       | POST   | /authentication |            | AuthenticationController | verifyEmail | Verifies user email.                       |
| /authentication/refresh      | POST   | /authentication |            | AuthenticationController | refresh     | Refreshes user authentication token.       |
| /authentication/send-email   | POST   | /authentication | auth       | AuthenticationController | sendEmail   | Sends email (authenticated route).         |
| /channels                    | GET    | /channels       | auth       | ChannelsController       | index       | Retrieves all channels.                    |
| /channels/:id                | GET    | /channels       | auth       | ChannelsController       | show        | Retrieves a specific channel by ID.        |
| /channels                    | POST   | /channels       | auth       | ChannelsController       | store       | Creates a new channel.                     |
| /channels                    | PATCH  | /channels       | auth       | ChannelsController       | update      | Updates an existing channel.               |
| /channels/:id/join           | POST   | /channels       | auth       | ChannelsController       | join        | Allows a user to join a specific channel.  |
| /channels/:id/leave          | POST   | /channels       | auth       | ChannelsController       | leave       | Allows a user to leave a specific channel. |
| /messages                    | GET    | /messages       | auth       | MessageController        | index       | Retrieves all messages.                    |
| /messages                    | POST   | /messages       | auth       | MessageController        | store       | Stores a new message.                      |
| /messages/channel/:channelId | GET    | /messages       | auth       | MessageController        | index       | Retrieves messages for a specific channel. |
| /messages/:id                | GET    | /messages       | auth       | MessageController        | show        | Retrieves a specific message by ID.        |
| /messages/:id                | PUT    | /messages       | auth       | MessageController        | update      | Updates an existing message.               |
| /messages/:id                | DELETE | /messages       | auth       | MessageController        | destroy     | Deletes a message by ID.                   |
| /storage/files/:id           | GET    | /storage/files  | auth       | FilesController          | show        | Retrieves a file by ID.                    |
| /storage/files               | POST   | /storage/files  | auth       | FilesController          | store       | Stores a new file.                         |
| /storage/files/:id           | PUT    | /storage/files  | auth       | FilesController          | update      | Updates an existing file.                  |
| /storage/files/:id           | DELETE | /storage/files  | auth       | FilesController          | destroy     | Deletes a file by ID.                      |

## Start the app in development mode

Install all dependancies

```bash
pnpm install
```

Launch the containers and create the database

```bash
docker compose up -d
node ace migration:run
```

Launch all seeders

```bash
node ace db:seed
```

If you want development data, run :

```bash
node ace db:seed --files "./database/seeders/main/dev_seeder.ts"
```

## Pre-commit with husky

### What's husky?

[Husky](https://typicode.github.io/husky/) is a tool that makes it easy to manage Git hooks, such as pre-commit hooks, to automate tasks before committing code. By using Husky, we can ensure that our code adheres to project quality standards before being pushed to the repository.

### Our pre-commit file

In our project, the pre-commit hook runs a series of commands to guarantee code quality and consistency before each commit. Here are the commands we've configured:

- `pnpm run prettier`: Checks the code formatting based on the rules defined in Prettier.
- `pnpm run lint`: Runs ESLint to verify that the code follows style conventions and detects potential issues.
- `pnpm run typescript`: Verifies types to ensure that the code complies with the defined TypeScript types.

> **Note**: If `pnpm run prettier` fails, you can run `pnpm run format` to automatically fix the formatting.

## Launching Test

If you have your docker compose for the backend up please execute:

```bash
docker compose down
```

Launch data base test:

```bash
docker compose -f docker-compose-test.yml up -d
```

Launch tests:

```bash
pnpm test
```

If you want to down the docker compose for tests:

```bash
docker compose -f docker-compose-test.yml down
```
