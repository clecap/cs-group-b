# Project Repository

This repository contains the codebase for a Fiege-Fiat-Shamir web application with a separate backend and frontend.

## Directory Structure

* **`backend/`**: Contains all the files and code for the backend of the application.
* **`docs/`**: Contains documentation related to the project.
* **`frontend/`**: Contains all the files and code for the frontend of the application.
* **`docker-compose.yml`**: Configuration file for defining and managing multi-container Docker applications.

## Technologies Used

* **Backend:** Flask (Python microframework)
* **Frontend:** Vue.js (JavaScript framework)

## Getting Started

This project utilizes Docker Compose to easily run both the backend and frontend services. Ensure you have Docker and Docker Compose installed on your system. Or you can install Docker Desktop which contains both of them.
### Prerequisites

* **Docker Desktop:** [Install Docker Desktop](https://docs.docker.com/desktop/) (recommended way)

<p align="center">or</p>

* **Docker:** [Install Docker](https://docs.docker.com/get-docker/)
* **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/)

### Running the application locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/clecap/cs-group-b.git
    cd cs-group-b
    ```
2.  **Start the services using Docker Compose:**
    ```bash
    docker compose up --build
    ```

    This command will build the Docker images for the backend and frontend and then start the containers as defined in the `docker-compose.yml` file.

### Accessing the application locally

Once the Docker containers are running, you can access the frontend of the application in your web browser at the following address: http://localhost:8001

### Running the application on production server

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/clecap/cs-group-b.git
    cd cs-group-b
    ```
2.  **Add the certificate and private key**

    To integrate https, add the certificate and the private key in the server. Make appropriate changes in the `docker-compose-prod.yml` and `frontend\Dockerfile-prod` to point them towards the correct location.
3.  **Start the services using Docker Compose:**
    ```bash
    docker compose -f docker-compose-prod.yml up --build -d
    ```

    This command will build the Docker images for the backend and frontend and then start the containers as defined in the `docker-compose-prod.yml` file.

### Accessing the Application

Once the Docker containers are running, you can access the frontend of the application in your web browser at the following address: [https://\<your-domain>]()
