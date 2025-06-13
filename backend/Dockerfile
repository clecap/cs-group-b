FROM python:3.9.22-bookworm

# set a directory for the app
WORKDIR /usr/src/app

# install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# add poetry to path
ENV PATH="${PATH}:/root/.local/bin"

# copy all the files to the container
COPY ./pyproject.toml ./poetry.lock .


# install dependencies
RUN poetry install

COPY . .

# define the port number the container should expose
EXPOSE 5000

# run the command
CMD ["poetry","run","flask", "run","-h","0.0.0.0"]
