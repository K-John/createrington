FROM postgres:15

ENV POSTGRES_DB=createrington_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

COPY ./schema/init-docker.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY ./data/test-data.sql /docker-entrypoint-initdb.d/02-test-data.sql

EXPOSE 5432