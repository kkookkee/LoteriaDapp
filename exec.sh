#!/bin/bash
docker build -loteria:v1 .
docker run -p 3000:3000 loteria:v1 etrypoint.sh
