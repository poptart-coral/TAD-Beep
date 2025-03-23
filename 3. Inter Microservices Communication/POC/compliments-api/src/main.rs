use axum::{Json, Router, routing::get};
use rand::seq::IndexedRandom;
use rand::rng;
use serde_json::{Value, json};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

async fn compliment() -> Json<Value> {
    let compliments = vec![
        "Can I follow you where you go? Because my parents always told me to follow my dreams.",
        "Are you a magician? Because whenever I look at you, everyone else disappears.",
        "Are you a camera? Because every time I look at you, I smile.",
        "Are you religious? Because you’re the answer to all my prayers.",
        "Are you a Wi-Fi signal? Because I’m really feeling a connection.",
        "Are you made of copper and tellurium? Because you’re Cu-Te.",
        "Are you a bank loan? Because you have my interest.",
        "Are you a cat? Because you’re purrrrrrfect.",
        "Are you a banana? Because I find you a-peeling.",
    ];

    let mut rng = rng();
    let message = compliments
        .choose(&mut rng)
        .unwrap_or(&"You're amazing! Sorry I have not a lot of inspiration today.");

    Json(json!({ "compliment": message }))
}

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    let app = Router::new()
    .route("/compliment", get(compliment))
    .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("listening on {}", addr);
    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}