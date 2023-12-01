#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use log::info;
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_positioner::{Position, WindowExt};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

fn main() {
    let system_tray_menu = SystemTrayMenu::new();
    tauri::Builder::default()
        .setup(|app| Ok(app.set_activation_policy(tauri::ActivationPolicy::Accessory)))
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);

            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    open_menu(app);
                }
                SystemTrayEvent::RightClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    open_menu(app);
                }
                SystemTrayEvent::DoubleClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    open_menu(app);
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Focused(is_focused) => {
                // detect click outside of the focused window and hide the app
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![update_menu_title, fetch_timezones])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn open_menu(app: &tauri::AppHandle) {
    let window = app.get_window("main").unwrap();
    let _ = window.move_window(Position::TrayCenter);

    #[cfg(target_os = "macos")]
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
        .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

    if window.is_visible().unwrap() {
        window.hide().unwrap();
    } else {
        window.show().unwrap();
        window.set_focus().unwrap();
    }
}

#[tauri::command]
async fn fetch_timezones(query: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://savvytime.com/api/search/timezone?query={}", query);

    match client.get(&url).send().await {
        Ok(response) => match response.text().await {
            Ok(text) => {
                info!("Response from {}: {}", url, text); // Print the response
                Ok(text)
            }
            Err(e) => {
                info!("Failed to read response text: {:?}", e); // Print the error
                Err("Failed to read response text".into())
            }
        },
        Err(e) => {
            println!("Request to {} failed: {:?}", url, e); // Print the error
            Err("Request failed".into())
        }
    }
}

#[tauri::command]
fn update_menu_title(app: tauri::AppHandle, title: &str) {
    app.tray_handle()
        .set_icon(tauri::Icon::Raw(
            include_bytes!("../resources/empty.png").to_vec(),
        ))
        .unwrap();
    app.tray_handle().set_title(title).unwrap();
}
