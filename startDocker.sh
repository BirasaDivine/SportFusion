#!/bin/bash

# Build the Docker image with the tag 'birasaMatch'
docker build -t birasamatch .

# Run the Docker container in detached mode, mapping port 8080 to port 80
docker run -d -p 8080:80 birasamatch

