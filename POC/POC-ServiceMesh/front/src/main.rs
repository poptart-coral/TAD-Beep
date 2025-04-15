use gloo_net::http::Request;
use serde::Deserialize;
use web_sys::{js_sys::{self, Reflect}, wasm_bindgen::JsValue, window};
use yew::prelude::*;

#[derive(Deserialize, Debug)]
struct Compliment {
    compliment: String,
}

fn get_api_url() -> String {
    Reflect::get(&window().unwrap(), &JsValue::from_str("API_URL"))
        .ok()
        .and_then(|v| v.as_string())
        .unwrap_or_else(|| "http://localhost:3000".to_string())
}

#[function_component(App)]
fn app() -> Html {
    let compliment = use_state(|| None::<String>);

    {
        let compliment = compliment.clone();
        use_effect_with((), move |_| {
            wasm_bindgen_futures::spawn_local(async move {
                let url = format!("{}/compliment", get_api_url());
                let fetched_compliment: Compliment = Request::get(&url)
                    .send()
                    .await
                    .unwrap()
                    .json()
                    .await
                    .unwrap();
                compliment.set(Some(fetched_compliment.compliment));
            });
            || ()
        });
    }

    html! {
        <div style="text-align:center; padding: 2rem; font-family: sans-serif;">
            <h1>{"Compliment of the day"}</h1>
            <p style="font-size:1.5rem;">
                { compliment.as_deref().unwrap_or("Loading...") }
            </p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
