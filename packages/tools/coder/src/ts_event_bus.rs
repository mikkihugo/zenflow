use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "/ts/event-bus.ts")]
extern "C" {
    pub type EventBus;

    #[wasm_bindgen(static_method_of = EventBus)]
    pub fn publish(event_name: &str, event_data: &JsValue);

    #[wasm_bindgen(static_method_of = EventBus)]
    pub fn subscribe(event_name: &str, callback: &js_sys::Function);
}
