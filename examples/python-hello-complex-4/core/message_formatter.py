"""
Message formatter module for Hello World application
"""
import textwrap
from datetime import datetime
from typing import Optional, Dict, Any
from config import Config
from utils.decorators import timer


class MessageFormatter:
    """Format messages in various styles"""
    
    def __init__(self, config: Config):
        self.config = config
        self.styles = self._initialize_styles()
    
    def _initialize_styles(self) -> Dict[str, Any]:
        """Initialize formatting styles"""
        return {
            "simple": self._format_simple,
            "fancy": self._format_fancy,
            "banner": self._format_banner,
            "ascii": self._format_ascii
        }
    
    @timer
    def format(self, message: str, style: str = None, 
               timestamp: Optional[datetime] = None,
               additional_info: Optional[Dict[str, Any]] = None) -> str:
        """Format a message in the specified style"""
        style = style or self.config.default_style
        
        if style not in self.styles:
            raise ValueError(
                f"Unsupported style: {style}. "
                f"Supported styles: {list(self.styles.keys())}"
            )
        
        # Apply color if enabled
        if self.config.enable_colors:
            message = self._apply_colors(message, style)
        
        # Format message
        formatted = self.styles[style](message, timestamp, additional_info)
        
        # Wrap text if needed
        if self.config.max_line_length > 0:
            lines = formatted.split('\n')
            wrapped_lines = []
            for line in lines:
                if len(line) > self.config.max_line_length:
                    wrapped = textwrap.fill(
                        line, 
                        width=self.config.max_line_length,
                        break_long_words=False
                    )
                    wrapped_lines.extend(wrapped.split('\n'))
                else:
                    wrapped_lines.append(line)
            formatted = '\n'.join(wrapped_lines)
        
        return formatted
    
    def _format_simple(self, message: str, timestamp: Optional[datetime], 
                      additional_info: Optional[Dict[str, Any]]) -> str:
        """Simple format: just the message"""
        return message
    
    def _format_fancy(self, message: str, timestamp: Optional[datetime], 
                     additional_info: Optional[Dict[str, Any]]) -> str:
        """Fancy format with decorations"""
        lines = []
        
        # Top border
        lines.append("╔" + "═" * (len(message) + 2) + "╗")
        
        # Message
        lines.append(f"║ {message} ║")
        
        # Timestamp if provided
        if timestamp:
            time_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
            lines.append("╠" + "═" * (len(message) + 2) + "╣")
            lines.append(f"║ {time_str.center(len(message))} ║")
        
        # Additional info if provided
        if additional_info:
            lines.append("╠" + "═" * (len(message) + 2) + "╣")
            for key, value in additional_info.items():
                info_line = f"{key}: {value}"
                lines.append(f"║ {info_line.center(len(message))} ║")
        
        # Bottom border
        lines.append("╚" + "═" * (len(message) + 2) + "╝")
        
        return "\n".join(lines)
    
    def _format_banner(self, message: str, timestamp: Optional[datetime], 
                      additional_info: Optional[Dict[str, Any]]) -> str:
        """Banner format with ASCII art"""
        banner_width = max(len(message) + 20, 60)
        lines = []
        
        # Top banner
        lines.append("*" * banner_width)
        lines.append("*" + " " * (banner_width - 2) + "*")
        
        # Message centered
        lines.append("*" + message.center(banner_width - 2) + "*")
        
        # Timestamp if provided
        if timestamp:
            lines.append("*" + " " * (banner_width - 2) + "*")
            time_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
            lines.append("*" + time_str.center(banner_width - 2) + "*")
        
        # Additional info if provided
        if additional_info:
            lines.append("*" + " " * (banner_width - 2) + "*")
            for key, value in additional_info.items():
                info_line = f"{key}: {value}"
                lines.append("*" + info_line.center(banner_width - 2) + "*")
        
        # Bottom banner
        lines.append("*" + " " * (banner_width - 2) + "*")
        lines.append("*" * banner_width)
        
        return "\n".join(lines)
    
    def _format_ascii(self, message: str, timestamp: Optional[datetime], 
                     additional_info: Optional[Dict[str, Any]]) -> str:
        """ASCII art format"""
        lines = []
        
        # ASCII art header
        lines.extend([
            "  _    _      _ _         __        __         _     _ _ ",
            " | |  | |    | | |        \\ \\      / /        | |   | | |",
            " | |__| | ___| | | ___     \\ \\    / /__  _ __| | __| | |",
            " |  __  |/ _ \\ | |/ _ \\     \\ \\  / / _ \\| '__| |/ _` | |",
            " | |  | |  __/ | | (_) |     \\ \\/ / (_) | |  | | (_| |_|",
            " |_|  |_|\\___|_|_|\\___/       \\__/ \\___/|_|  |_|\\__,_(_)",
            ""
        ])
        
        # Message
        lines.append(message.center(57))
        
        # Timestamp if provided
        if timestamp:
            lines.append("")
            time_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
            lines.append(time_str.center(57))
        
        # Additional info if provided
        if additional_info:
            lines.append("")
            for key, value in additional_info.items():
                info_line = f"{key}: {value}"
                lines.append(info_line.center(57))
        
        return "\n".join(lines)
    
    def _apply_colors(self, message: str, style: str) -> str:
        """Apply ANSI color codes to message"""
        color_map = {
            "simple": "\033[0m",      # Default
            "fancy": "\033[1;36m",    # Bold Cyan
            "banner": "\033[1;33m",   # Bold Yellow
            "ascii": "\033[1;35m"     # Bold Magenta
        }
        
        reset = "\033[0m"
        color = color_map.get(style, "\033[0m")
        
        return f"{color}{message}{reset}"
    
    def create_progress_bar(self, current: int, total: int, 
                           width: int = 50, fill_char: str = "█") -> str:
        """Create a progress bar"""
        if total == 0:
            return "[" + " " * width + "]"
        
        filled = int(width * current / total)
        empty = width - filled
        
        bar = "[" + fill_char * filled + " " * empty + "]"
        percentage = f" {current}/{total} ({100 * current / total:.1f}%)"
        
        return bar + percentage
    
    def create_table(self, headers: list, rows: list) -> str:
        """Create a simple ASCII table"""
        if not headers or not rows:
            return ""
        
        # Calculate column widths
        col_widths = [len(str(h)) for h in headers]
        for row in rows:
            for i, cell in enumerate(row):
                col_widths[i] = max(col_widths[i], len(str(cell)))
        
        # Create separator
        separator = "+" + "+".join(["-" * (w + 2) for w in col_widths]) + "+"
        
        # Format header
        header_row = "|" + "|".join([
            f" {str(h).ljust(w)} " for h, w in zip(headers, col_widths)
        ]) + "|"
        
        # Format rows
        data_rows = []
        for row in rows:
            data_row = "|" + "|".join([
                f" {str(cell).ljust(w)} " 
                for cell, w in zip(row, col_widths)
            ]) + "|"
            data_rows.append(data_row)
        
        # Combine all parts
        table_parts = [separator, header_row, separator]
        table_parts.extend(data_rows)
        table_parts.append(separator)
        
        return "\n".join(table_parts)