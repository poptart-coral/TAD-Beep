FROM rust:latest AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:stable-slim
COPY --from=builder /app/target/release/compliments-api /usr/local/bin/compliments-api
EXPOSE 3000
CMD ["compliments-api"]