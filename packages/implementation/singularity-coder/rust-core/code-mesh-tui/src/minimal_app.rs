use anyhow::Result;
use ratatui::{backend::CrosstermBackend, Terminal, Frame};
use std::io;

use crate::{
    config::Config,
    theme::ThemeManager,
};

/// Minimal working application
pub struct MinimalApp {
    theme_manager: ThemeManager,
}

impl MinimalApp {
    pub async fn new(_config: &Config) -> Result<Self> {
        let theme_manager = ThemeManager::default();
        
        Ok(Self {
            theme_manager,
        })
    }
    
    pub async fn run(&mut self) -> Result<()> {
        let mut terminal = Terminal::new(CrosstermBackend::new(io::stdout()))?;
        
        // Just render once for now (in a real app, you'd have an event loop)
        terminal.draw(|frame| self.render(frame))?;
        
        Ok(())
    }
    
    fn render(&mut self, frame: &mut Frame) {
        use ratatui::widgets::{Block, Borders, Paragraph};
        use ratatui::style::Style;
        
        let theme = self.theme_manager.current_theme();
        let content = Paragraph::new("Code Mesh TUI - Minimal Working Version")
            .block(Block::default()
                .title("Code Mesh")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme.border())));
        
        frame.render_widget(content, frame.area());
    }
}