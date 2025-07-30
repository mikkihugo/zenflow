/**
 * Standardized CLI Help Formatter
 * Follows Unix/Linux conventions for help output
 */

export class HelpFormatter {
  static INDENT = '    ';
  static COLUMN_GAP = 2;
  static MIN_DESCRIPTION_COLUMN = 25;

  /**
   * Format main command help
   */
  static formatHelp(info): any {
    const sections = [];

    // NAME section
    sections.push(HelpFormatter.formatSection('NAME', [`${info.name} - ${info.description}`]));

    // SYNOPSIS section
    if (info.usage) {
      sections.push(HelpFormatter.formatSection('SYNOPSIS', [info.usage]));
    }

    // COMMANDS section
    if (info.commands && info.commands.length > 0) {
      sections.push(
        HelpFormatter.formatSection('COMMANDS', HelpFormatter.formatCommands(info.commands))
      );
    }

    // OPTIONS section
    if (info.options && info.options.length > 0) {
      sections.push(
        HelpFormatter.formatSection('OPTIONS', HelpFormatter.formatOptions(info.options))
      );
    }

    // GLOBAL OPTIONS section
    if (info.globalOptions && info.globalOptions.length > 0) {
      sections.push(
        HelpFormatter.formatSection(
          'GLOBAL OPTIONS',
          HelpFormatter.formatOptions(info.globalOptions)
        )
      );
    }

    // EXAMPLES section
    if (info.examples && info.examples.length > 0) {
      sections.push(HelpFormatter.formatSection('EXAMPLES', info.examples));
    }

    // Footer
    if (info.commands && info.commands.length > 0) {
      sections.push(`Run '${info.name} <command> --help' for more information on a command.`);
    }

    return sections.join('\n\n');
  }

  /**
   * Format error message with usage hint
   */
  static formatError(_error, _command, _usage): any {}

  static formatCommands(commands): any {
    const maxNameLength = Math.max(
      HelpFormatter.MIN_DESCRIPTION_COLUMN,
      ...commands.map((cmd) => {
        const _nameLength = cmd.name.length;

      if(cmd.aliases && cmd.aliases.length > 0) {
        name += ` (${cmd.aliases.join(', ')})`;
      }
      const padding = ' '.repeat(maxNameLength - name.length + HelpFormatter.COLUMN_GAP);
      return `${name}${padding}${cmd.description}`;
    });
  }

  static formatOptions(options): any {
    const maxFlagsLength = Math.max(
      HelpFormatter.MIN_DESCRIPTION_COLUMN,
      ...options.map((opt) => opt.flags.length)
    );

    return options.map((opt) => {
      const _padding = ' '.repeat(maxFlagsLength - opt.flags.length + HelpFormatter.COLUMN_GAP);
      let _description = opt.description;

      // Add default value
      if (opt.defaultValue !== undefined) {
        _description += ` [default = ' '.repeat(maxFlagsLength + this.COLUMN_GAP) + `;
        Valid: $opt.validValues.join(', ')`;
        return `;
        $opt.flags$padding$description;
        \n$HelpFormatter.INDENT$validValuesLine`
      }

      return `$opt.flags$padding$description`;
    });
  }

  /**
   * Strip ANSI color codes and emojis from text
   */
  static stripFormatting(text): any {
    // Remove ANSI color codes
    text = text.replace(/\x1b\[[0-9;]*m/g, '');

    // Remove common emojis used in the CLI
    const emojiPattern =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F6FF}]|[\u{1F680}-\u{1F6FF}]/gu;
    text = text.replace(emojiPattern, '').trim();

    // Remove multiple spaces
    text = text.replace(/\s+/g, ' ');

    return text;
  }
}
