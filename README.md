# NestJS Movie API Backend

This is the backend API for the Movie API project - TravelZap, built with NestJS, TypeScript, TypeORM, and SQLite. It provides endpoints for managing movies, actors, and movie ratings, along with a robust authentication system using JWTs.

## Table of Contents

* [Features](#features)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
    * [Clone the Repository](#clone-the-repository)
    * [Install Dependencies](#install-dependencies)
    * [Environment Variables](#environment-variables)
    * [Run the Development Server](#run-the-development-server)
* [Project Structure](#project-structure)
* [Database](#database)
* [Authentication](#authentication)
* [API Documentation (Swagger)](#api-documentation-swagger)
* [Testing](#testing)
* [Dockerization](#dockerization)
* [CI/CD with GitLab](#cicd-with-gitlab)
* [Troubleshooting](#troubleshooting)
* [Contributing](#contributing)
* [License](#license)
* [Credits](#credits)

## Features

* RESTful API for Movies (CRUD)
* RESTful API for Actors (CRUD)
* RESTful API for Movie Ratings (CRUD)
* User Authentication and Authorization using JWT
* SQLite database with TypeORM for data persistence
* Database seeding with sample movies, actors, ratings, and a default user
* Data validation using `class-validator` and `class-transformer`
* API documentation with Swagger UI
* Unit and End-to-End (E2E) testing
* Docker support for containerized deployment
* GitLab CI/CD pipeline for automated testing and Docker image building

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (LTS version, e.g., 18.x or newer)
* **npm** (comes with Node.js) or Yarn
* **NestJS CLI**: `npm install -g @nestjs/cli`
* **Docker** (optional, for Dockerization)

## Getting Started

Follow these steps to set up and run the backend API on your local machine.

### Clone the Repository

If you haven't already, clone the backend repository:

git clone [https://github.com/jordosgoite/destify-backend.git](https://github.com/jordosgoite/destify-backend.git)
npm install 

Environment Variables
Create a .env file in the root of your movie-api project. This file will store your sensitive environment variables.
## JWT_SECRET value could be provided by email if needed


DB_DATABASE=movie.sqlite
JWT_SECRET=superSecretJWTKey_replace_this_in_production
Important:
## JWT_SECRET value could be provided by email if needed

DB_DATABASE: This specifies the name of your SQLite database file. You can change it if needed.
JWT_SECRET: This is crucial for JWT security. Replace superSecretJWTKey_replace_this_in_production with a strong, unique, randomly generated string. You can generate one using Node.js:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

#Run the Development Server

npm run start:dev
The application will typically be accessible at http://localhost:3000. You will see messages in your terminal indicating the database seeding process and the application URL.

The API documentation (Swagger UI) will be available at http://localhost:3000/api.

Test Credentials for Login (seeded automatically if no users exist):

Username: testuser
Password: password123
Project Structure
The core directories and files for this NestJS backend include:

### Project Structure

movie-api/
├── dist/                     # Compiled JavaScript output (automatically generated)
├── src/
│   ├── main.ts               # Main application entry point
│   ├── app.module.ts         # Root application module
│   ├── app.service.ts        # Service for database seeding
│   ├── common/
│   │   └── decorators/
│   │       └── public.decorator.ts # Custom decorator for public routes
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   └── login-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── movies/               # Movies module
│   │   ├── movies.controller.ts
│   │   ├── movies.module.ts
│   │   ├── movies.service.ts
│   │   ├── dto/
│   │   │   ├── create-movie.dto.ts
│   │   │   └── update-movie.dto.ts
│   │   └── entities/
│   │       └── movie.entity.ts
│   ├── actors/               # Actors module
│   │   ├── actors.controller.ts
│   │   ├── actors.module.ts
│   │   ├── actors.service.ts
│   │   ├── dto/
│   │   │   ├── create-actor.dto.ts
│   │   │   └── update-actor.dto.ts
│   │   └── entities/
│   │       └── actor.entity.ts
│   ├── movie-ratings/        # Movie Ratings module
│   │   ├── movie-ratings.controller.ts
│   │   ├── movie-ratings.module.ts
│   │   ├── movie-ratings.service.ts
│   │   ├── dto/
│   │   │   ├── create-movie-rating.dto.ts
│   │   │   └── update-movie-rating.dto.ts
│   │   └── entities/
│   │       └── movie-rating.entity.ts
├── test/                     # End-to-End (e2e) tests
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── Dockerfile                # Docker build instructions
├── docker-compose.yml        # Docker Compose configuration
├── .gitlab-ci.yml            # GitLab CI/CD pipeline
├── nest-cli.json             # NestJS CLI configuration
├── package.json              # Project dependencies and scripts 
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
Database
This project uses SQLite as its database, managed by TypeORM.

DB_DATABASE in .env: Specifies the SQLite database file (default: movie.sqlite). This file will be created in your project's root directory.
src/app.module.ts: Configures the TypeORM connection. synchronize: true is enabled for development ease, which automatically creates and updates database tables based on your entities. For production, synchronize should be false and migrations should be used.
src/app.service.ts: Contains onModuleInit hook to seed initial data (movies, actors, ratings, and a default testuser) into the database if it's empty.

Authentication is handled via JSON Web Tokens (JWTs).

src/auth/entities/user.entity.ts: Defines the User entity.
src/auth/auth.service.ts: Handles user validation and JWT generation using @nestjs/jwt and bcrypt for password hashing.
src/auth/strategies/jwt.strategy.ts: Validates incoming JWTs. It extracts the token from the Authorization header and verifies it using the JWT_SECRET.
src/auth/guards/jwt-auth.guard.ts: A global authentication guard that protects most API routes.
src/common/decorators/public.decorator.ts: A custom decorator (@Public()) used to bypass the JwtAuthGuard for specific routes (e.g., the login endpoint).
src/main.ts: Registers the JwtAuthGuard globally.
API Documentation (Swagger)
The API is documented using Swagger UI, accessible at http://localhost:3000/api when the server is running.

src/main.ts: Configures Swagger with basic API info, tags, and defines the JWT Bearer authentication scheme.
@ApiTags(), @ApiOperation(), @ApiResponse(), @ApiBearerAuth(): Decorators used in controllers (src/movies/movies.controller.ts, etc.) to enhance Swagger documentation.
Testing
This project includes both unit and end-to-end (e2e) tests.

Unit Tests: Located in src/<module-name>/*.service.spec.ts. These test individual services in isolation.
E2E Tests: Located in test/app.e2e-spec.ts. These test the full API flow, including authentication and CRUD operations, by making actual HTTP requests. The E2E tests include a beforeAll hook to log in and obtain a JWT for subsequent authenticated requests.

To run tests:

# Run all tests (unit and e2e)
npm test

# Run e2e tests only
npm run test:e2e

Dockerization
The application can be easily containerized using Docker.

Dockerfile: Defines the steps to build the Docker image for your application.
docker-compose.yml: Configures a Docker Compose service to run your backend, mapping ports and persisting the SQLite database file outside the container.
To build and run with Docker Compose:

# Build the Docker image (only needed once or after Dockerfile changes)
docker-compose build

# Run the containers in detached mode
docker-compose up -d

# Stop and remove containers
docker-compose down

CI/CD with GitLab
A .gitlab-ci.yml file is provided to set up a basic CI/CD pipeline for GitLab.

Stages: test (runs unit and e2e tests), build (builds and pushes Docker image).
Test Job: Installs dependencies and runs all tests.
Build Job: Builds a Docker image of the application and pushes it to GitLab Container Registry ($CI_REGISTRY_IMAGE). This job runs only on the main branch.
Note: You'll need to configure a GitLab Runner that can execute Docker commands (e.g., a Docker executor or a shell executor with Docker installed).


Credits
This project was developed by (https://www.linkedin.com/in/juan-ordosgoite/).