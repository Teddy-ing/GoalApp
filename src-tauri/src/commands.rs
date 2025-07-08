use serde::{Deserialize, Serialize};
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

// Data structures for the API
#[derive(Debug, Serialize, Deserialize)]
pub struct Goal {
    pub id: Option<i64>,
    pub title: String,
    pub description: Option<String>,
    pub target_value: i32,
    pub current_value: i32,
    pub goal_type: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub id: Option<i64>,
    pub goal_id: i64,
    pub title: String,
    pub is_completed: bool,
    pub order_index: i32,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LayoutItem {
    pub id: Option<i64>,
    pub goal_id: i64,
    pub x_position: f64,
    pub y_position: f64,
    pub width: f64,
    pub height: f64,
    pub section_type: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Note {
    pub id: Option<i64>,
    pub content: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// Goal Commands
#[tauri::command]
pub async fn add_goal(
    app: tauri::AppHandle,
    title: String,
    description: Option<String>,
    target_value: i32,
    goal_type: String,
) -> Result<i64, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let result = sqlx::query!(
        "INSERT INTO goals (title, description, target_value, current_value, goal_type, is_active) 
         VALUES (?, ?, ?, 0, ?, TRUE)",
        title,
        description,
        target_value,
        goal_type
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to insert goal: {}", e))?;

    Ok(result.last_insert_rowid())
}

#[tauri::command]
pub async fn get_goals(app: tauri::AppHandle) -> Result<Vec<Goal>, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let goals = sqlx::query_as!(
        Goal,
        "SELECT id, title, description, target_value, current_value, goal_type, 
         created_at, updated_at, is_active 
         FROM goals WHERE is_active = TRUE 
         ORDER BY created_at DESC"
    )
    .fetch_all(&db)
    .await
    .map_err(|e| format!("Failed to fetch goals: {}", e))?;

    Ok(goals)
}

#[tauri::command]
pub async fn increment_goal(app: tauri::AppHandle, goal_id: i64, amount: i32) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "UPDATE goals SET current_value = current_value + ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?",
        amount,
        goal_id
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to increment goal: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn update_goal(
    app: tauri::AppHandle,
    goal_id: i64,
    title: String,
    description: Option<String>,
    target_value: i32,
) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "UPDATE goals SET title = ?, description = ?, target_value = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?",
        title,
        description,
        target_value,
        goal_id
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to update goal: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_goal(app: tauri::AppHandle, goal_id: i64) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "UPDATE goals SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        goal_id
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to delete goal: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn reset_daily_goals(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "UPDATE goals SET current_value = 0, updated_at = CURRENT_TIMESTAMP 
         WHERE goal_type = 'daily'"
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to reset daily goals: {}", e))?;

    Ok(())
}

// Checklist Commands
#[tauri::command]
pub async fn add_checklist_item(
    app: tauri::AppHandle,
    goal_id: i64,
    title: String,
    order_index: i32,
) -> Result<i64, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let result = sqlx::query!(
        "INSERT INTO checklist_items (goal_id, title, is_completed, order_index) 
         VALUES (?, ?, FALSE, ?)",
        goal_id,
        title,
        order_index
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to insert checklist item: {}", e))?;

    Ok(result.last_insert_rowid())
}

#[tauri::command]
pub async fn get_checklist_items(app: tauri::AppHandle, goal_id: i64) -> Result<Vec<ChecklistItem>, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let items = sqlx::query_as!(
        ChecklistItem,
        "SELECT id, goal_id, title, is_completed, order_index, created_at 
         FROM checklist_items WHERE goal_id = ? 
         ORDER BY order_index ASC",
        goal_id
    )
    .fetch_all(&db)
    .await
    .map_err(|e| format!("Failed to fetch checklist items: {}", e))?;

    Ok(items)
}

#[tauri::command]
pub async fn toggle_checklist_item(
    app: tauri::AppHandle,
    item_id: i64,
    is_completed: bool,
) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "UPDATE checklist_items SET is_completed = ? WHERE id = ?",
        is_completed,
        item_id
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to toggle checklist item: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_checklist_item(app: tauri::AppHandle, item_id: i64) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!("DELETE FROM checklist_items WHERE id = ?", item_id)
        .execute(&db)
        .await
        .map_err(|e| format!("Failed to delete checklist item: {}", e))?;

    Ok(())
}

// Layout Commands
#[tauri::command]
pub async fn save_layout(
    app: tauri::AppHandle,
    goal_id: i64,
    x_position: f64,
    y_position: f64,
    width: f64,
    height: f64,
    section_type: String,
) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    sqlx::query!(
        "INSERT OR REPLACE INTO layout 
         (goal_id, x_position, y_position, width, height, section_type, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        goal_id,
        x_position,
        y_position,
        width,
        height,
        section_type
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to save layout: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_layout(app: tauri::AppHandle) -> Result<Vec<LayoutItem>, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let layouts = sqlx::query_as!(
        LayoutItem,
        "SELECT id, goal_id, x_position, y_position, width, height, section_type, 
         created_at, updated_at FROM layout ORDER BY goal_id"
    )
    .fetch_all(&db)
    .await
    .map_err(|e| format!("Failed to fetch layout: {}", e))?;

    Ok(layouts)
}

// Notes Commands
#[tauri::command]
pub async fn save_notes(app: tauri::AppHandle, content: String) -> Result<(), String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Delete existing notes and insert new one (simple single-note system)
    sqlx::query!("DELETE FROM notes")
        .execute(&db)
        .await
        .map_err(|e| format!("Failed to clear notes: {}", e))?;

    sqlx::query!(
        "INSERT INTO notes (content, updated_at) VALUES (?, CURRENT_TIMESTAMP)",
        content
    )
    .execute(&db)
    .await
    .map_err(|e| format!("Failed to save notes: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_notes(app: tauri::AppHandle) -> Result<Option<Note>, String> {
    use tauri_plugin_sql::SqlitePool;
    
    let db = SqlitePool::connect("sqlite:goals.db")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let note = sqlx::query_as!(
        Note,
        "SELECT id, content, created_at, updated_at FROM notes ORDER BY id DESC LIMIT 1"
    )
    .fetch_optional(&db)
    .await
    .map_err(|e| format!("Failed to fetch notes: {}", e))?;

    Ok(note)
} 