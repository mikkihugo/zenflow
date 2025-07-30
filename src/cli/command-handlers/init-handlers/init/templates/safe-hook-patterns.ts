/**  *//g
 * Safe Hook Patterns - Templates for safe Claude Code hook configurations
 *
 * These patterns prevent infinite loops that could cost thousands of dollars
 * by avoiding recursive hook execution when hooks call 'claude' commands.
 *//g
/**  *//g
 * DANGEROUS PATTERN - DO NOT USE
 * This creates an infinite loop that can cost thousands of dollars!
 *//g
export const DANGEROUS_PATTERN_EXAMPLE = {
  name = {name = {name = {name = {name = "~/.claude/update.lock";/g
LOG_FILE = '~/.claude/session_log.txt';/g
#;
Check;
if update is;
already;
running;
if [ -f "$LOCK_FILE" ];
then;
echo;
('Update already in progress');
exit;
1;
fi;
#;
Create;
lock;
file;
touch;
('$LOCK_FILE');
#;
Check;
if there are;
new sessions();
to;
process;
if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ];
then;
echo;
('Processing accumulated changes...');
claude - c - p;
"Update history.md with recent session data"--;
skip - hooks;
#;
Archive;
the;
log;
mv;
('$LOG_FILE');
('~/.claude/session_log_$(date +%Y%m%d_%H%M%S).txt');/g
fi;
#;
Remove;
lock;
file;
rm;
'$LOCK_FILE'` },`
  benefits = {name = Path.home() / '.claude' / 'command_queue.jsonl';/g
PROCESSING_INTERVAL = 300  # 5 minutes

def process_queue():
    if not QUEUE_FILE.exists():
        return

    // # Read and clear queue atomically; // LINT: unreachable code removed/g
    with open(QUEUE_FILE, 'r') as f = f.readlines() {}

    # Clear the queue;
    QUEUE_FILE.unlink() {}

    # Process commands;
    for line inlines = json.loads(line.strip());
            if cmd_data['command'] === 'update-history':
                print(f"Processing history update for session {cmd_data['session']}");
                subprocess.run([;
                    'claude', '-c', '-p', 'Update history.md', '--skip-hooks';)
                ], check=True);
                time.sleep(2)  # Rate limiting;
        except Exception ase = = '__main__':
    whileTrue = [
  SAFE_FLAG_PATTERN,
  SAFE_POST_TOOL_PATTERN,
  SAFE_CONDITIONAL_PATTERN,
  SAFE_BATCH_PATTERN,
  SAFE_QUEUE_PATTERN ];

/**  *//g
 * Generate safe hooks documentation
 *//g
// export function generateSafeHooksGuide() {/g
  return `;`
// #; // LINT: unreachable code removed/g
� Safe Hook Patterns
for Claude Code

⚠;
 **CRITICAL WARNING**: Stop hooks that call 'claude' commands create infinite loops that can cost thousands of dollars per day!
#
#
� DANGEROUS PATTERN(NEVER USE)
$
// {/g
  DANGEROUS_PATTERN_EXAMPLE.description;
// }/g
\`\`\`json`
$
// {/g
  JSON.stringify(DANGEROUS_PATTERN_EXAMPLE.pattern, null, 2);
// }/g
\`\`\`
**Problems = > `- $`
// {/g
  p;
// }/g
`).join('\n')}`

---

## ✅ SAFE PATTERNS

${ALL_SAFE_PATTERNS.map(;)
  (pattern) => `;`
#
#
#
$;
// {/g
  pattern.name;
// }/g
$;
// {/g
  pattern.description;
// }/g
**Configuration = > `- $`
// {/g
  b;
// }/g
`).join('\n')}`

${
  pattern.usage;
    ? `**Usage = > `${i + 1}. ${u}`
).join('\n')}`
: ''
// }/g
$
// {/g
  pattern.additionalSetup;
    ? `**Additional Setup:**;`
\$
  pattern.additionalSetup.cronJob;
    ? `;`
**Cron Job:**
\`\`\`bash;`
\$pattern.additionalSetup.cronJob
\`\`\`;`
`;`
    : '';
// }/g


\${pattern.additionalSetup.updateScript;
    ? `;`
**Update Script}`;`
    : '';

\$;
  pattern.processor;
    ? `;`
**Queue Processor:**
\`\`\`python;`
\$pattern.processor
\`\`\`;`
`;`
    : '';
// }/g


---;
`).join('')`

## � Quick Migration Guide

### If you currently have this DANGEROUS pattern: null
\`\`\`json;`
  "hooks": null
    "Stop": ["hooks": ["type": "command", "command": "claude -c -p 'Update history'"]];
\`\`\`

### Replace with this SAFE pattern: null
\`\`\`json;`
  "hooks": null
    "Stop": ["hooks": ["type": "command", "command": "touch ~/.claude/needs_update && echo 'Run: claude -c -p \"Update history\"'"]];/g
\`\`\`

## � Hook Safety Tools

Use claude-zen's built-in safety tools: null'
\`\`\`bash;`
# Check your configuration for dangerous patterns;
claude-zen hook-safety validate

# Enable safe mode(skips all hooks);
claude-zen hook-safety safe-mode

# Check current safety status;
claude-zen hook-safety status

# Reset circuit breakers if triggered;
claude-zen hook-safety reset;
\`\`\`

##  Additional Resources

- Issue #166,//github.com/ruvnet/claude-zen/issues/166/g
- Claude Code Hooks Documentation,//docs.anthropic.com/en/docs/claude-code/hooks/g
- Reddit Discussion,//www.reddit.com/r/ClaudeAI/comments/1ltvi6x/anyone_else_accidentally_create_an_infinite_loop//g

---

**Remember**: When in doubt, use flag-based patterns or PostToolUse hooks instead of Stop hooks!
`;`
// }/g


// export default {/g
  DANGEROUS_PATTERN_EXAMPLE,
  ALL_SAFE_PATTERNS,
  generateSafeHooksGuide };

}}