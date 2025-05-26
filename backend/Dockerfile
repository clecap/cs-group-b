FROM python:3.9.22-bookworm

# set a directory for the app
WORKDIR /usr/src/app

# install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# copy all the files to the container
COPY ./pyproject.toml ./poetry.lock .

# add poetry to path
ENV PATH="${PATH}:/root/.local/bin"

# install dependencies
RUN poetry install

# copy only whats needed or delete '.venv' since for reasons I am not sure about it messes up the environment
# if copy list becomes too long then can also use dockerignore file
COPY ./app.py .

# define the port number the container should expose
EXPOSE 8000

# run the command
CMD ["poetry","run","flask", "run","-h","0.0.0.0","-p","8000"]
