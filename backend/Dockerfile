# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file and install dependencies
COPY ./app/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application code
COPY ./app /code/app

# Set the working directory to the app folder where main.py is
WORKDIR /code/app

# Expose the ports the servers will run on
EXPOSE 5000
EXPOSE 8000

# The CMD is provided by the docker-compose.yml file