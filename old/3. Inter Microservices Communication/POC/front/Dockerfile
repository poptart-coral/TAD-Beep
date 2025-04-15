FROM rust:latest AS builder

# Installe Trunk + wasm32 target
RUN cargo install trunk wasm-bindgen-cli
RUN rustup target add wasm32-unknown-unknown

WORKDIR /app
COPY . .

RUN trunk build --release --public-url /

# --------

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80