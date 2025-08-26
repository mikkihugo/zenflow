use ratatui::{
    Frame,
    layout::Rect,
    widgets::Widget,
};

use crate::theme::Theme;

/// Renderer wrapper for consistent styling and theme application
pub struct Renderer {
    theme: Box<dyn Theme + Send + Sync>,
}

impl Renderer {
    /// Create a new renderer
    pub fn new(theme: Box<dyn Theme + Send + Sync>) -> Self {
        Self { theme }
    }
    
    /// Get the current theme
    pub fn theme(&self) -> &dyn Theme {
        self.theme.as_ref()
    }
    
    /// Render a widget in the specified area
    pub fn render_widget<W: Widget>(&mut self, frame: &mut Frame, widget: W, area: Rect) {
        frame.render_widget(widget, area);
    }
    
    /// Render a stateful widget
    pub fn render_stateful_widget<W: ratatui::widgets::StatefulWidget>(
        &mut self, 
        frame: &mut Frame, 
        widget: W, 
        area: Rect, 
        state: &mut W::State
    ) {
        frame.render_stateful_widget(widget, area, state);
    }
    
    /// Get the terminal area
    pub fn area(&self, frame: &Frame) -> Rect {
        frame.area()
    }
}