# golang 1.26-alpine
FROM golang@sha256:ecb67f987aa1a57794c91d19ade7ae0209f2f0f5496aaef9e6ae85ddf92d02ab AS build

WORKDIR /app

# Copiar archivos de dependencias desde apps/api
COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

# Copiar el código fuente y compilar
COPY apps/api/ ./
RUN CGO_ENABLED=0 go build -o /app/auditoria-api .

# Runtime ligero
# alpine 3.23.7
FROM alpine@sha256:ff7f0c727dd796aa36787bfcd9a64bf35a6ce72a73451b3359fde849b6703d63
WORKDIR /app
RUN apk update && apk upgrade --no-cache && \
    addgroup -S nonroot -g 10001 && adduser -S nonroot -G nonroot -u 10001
COPY --from=build --chown=10001:10001 /app/auditoria-api /app/auditoria-api

USER 10001:10001
EXPOSE 8080
CMD ["/app/auditoria-api"]
