use yew::prelude::*;
use serde::Deserialize;
use gloo_net::http::Request;

#[derive(Deserialize, Debug)]
struct Compliment {
    compliment: String,
}

#[function_component(App)]
fn app() -> Html {
    let compliment = use_state(|| None::<String>);

    {
        let compliment = compliment.clone();
        use_effect_with((), move |_| {
            wasm_bindgen_futures::spawn_local(async move {
                let fetched_compliment: Compliment = Request::get("http://localhost:3000/compliment")
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
