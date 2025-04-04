# MERmaid API v2

This repo contains the MERmaid API, part of the MERmaid system web app.

In brief:

- A RESTful API developed in JS (Node.js + Express.js)
- Connects to a relational DB (PostgreSQL) using an ORM (Sequelize)
- Interacts with YouTube (search for videos) using youtube-search
- Updates the user via websockets (socket.io)
- Sends emails when a user registers (via nodemailer)
- Connects to rabbitMQ and posts the music URL on the `musicExtraction` queue when a new music is selected

**Note: this project uses yarn, do not use npm!**

## Running the Project

**Please check the dev-orchestrator repo first, this now requires the external docker network `mermaid-dev-network`.**

The API is containerized, check all the docker-compose* and Dockerfile* under the project root and .devcontainer/.

To run / dev the project install:

- Docker Desktop
- WSL2 + Ubuntu distro (under windows)
- VSCode + Remote Dev extension

Before continuing, follow the instructions at the MERmaid FE repo - [Configure Development Environment](https://github.com/mer-team/mermaid-fe?tab=readme-ov-file#configure-development-environment).

### Development Environment

Similarly to the MERmaid FE, this project uses devcontainers to automatically configure the entire dev env. Check carefully the `.devcontainer/devcontainer.json` file, as well as additional files mentioned there.

In summary, after opening the project under VSCode, the IDE will:

1. Detect the presence of a devcontainer
2. Build the associated Docker image
3. Launch all the other Docker images described in the docker-compose files.
   - PostgreSQL, MailCatcher, RabbitMQ
4. Install VSCode extensions (linter, formatter, icons, and others)
5. Attach to the api service container.

After that, the terminal will be inside the container, the code will be edited inside VSCode and everything should go smooth. When existing check Docker Desktop and make sure to stop the stack of containers.

Quickstart instructions (if on Windows, inside WSL):

```bash
# Go to your user home folder
cd ~

# Create a MERmaid folder to host all the project parts
mkdir MERmaid
cd MERmaid

# Clone the repo using SSH to a folder
git clone git@github.com:mer-team/mermaid-bk.git

# Copy / edit .env file
cd mermaid-bk
cp .env.example .env

# Enter the project folder:
cd ~/MERmaid/mermaid-bk

# Open VSCode on the current folder
code .

# Wait for VSCode to setup everything.
# Say *YES* when asked about opening project on Dev Container.
```

When running the full dev stack, several services are available:

- The API - http://localhost:8000
- The API Swagger docs - http://localhost:8000/api-docs
- The RabbitMQ UI - http://localhost:15672/
- The MailCatcher UI - http://localhost:1080/
- The DB can be accessed using the SQLTools extension
  - Preconfigured, check VSCode left-menu.

### Docker Params

Check all the .env\* files for details on the ENV vars currently passed to all the containers.

### Seeding

On first start the DB needs to be created, inside the project folder:

```
cd src
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Building Docker Images

To build a local `api` image from source use:

```bash
# Uses the development Dockerfile (shared volume)
docker build -t api:local -f Dockerfile.dev .

# Uses the development Dockerfile (shared volume)
docker build -t api:local -f Dockerfile.prod .
```

The previous official image was built and pushed to DockerHub using GitHub Actions, still to be done here. For now, build the production image on the server or locally (and push) using:

```bash
# Uses the development Dockerfile (shared volume)
docker build -t merteam/api:latest -t merteam/api:v0.2.0 -f Dockerfile.prod .
```

### Running Locally

Just enter the project folder and use the docker-compose.yml to launch the API and all the associated services.

This can be used as a way to develop the MERmaid FE without having VSCode open with the API too.

```bash
docker compose up -d
```

### Check outdated libraries

If using docker, first launch a shell inside the container with `docker compose exec api sh`.

```bash
cd src
yarn outdated
```

Check the packages listed. Note that some are patch updates (no problem updating) but others are minor (careful) and major (code changes needed, check migrating from X to Y). Next upgrade your code if needed and run `yarn upgrade <package name>`. After updating always run tests.

Alternatively use `yarn upgrade-interactive`.

### Automated Tests

Jest tests to be developed.
