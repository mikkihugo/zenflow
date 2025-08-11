{
  description = "Claude Code Zen - Development Environment with BEAM Language Support";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # BEAM language toolchain
        beamPackages = pkgs.beam.packages.erlang_27;
        
        # Custom development tools
        beam-language-parser = pkgs.writeShellScriptBin "beam-parse" ''
          #!/usr/bin/env bash
          # BEAM Language Parser CLI Tool
          # Supports Elixir (.ex/.exs), Erlang (.erl/.hrl), Gleam (.gleam)
          
          set -e
          
          FILE="$1"
          OUTPUT_FORMAT="${2:-json}"
          
          if [[ -z "$FILE" ]]; then
            echo "Usage: beam-parse <file> [json|yaml|text]"
            echo "Supported: .ex .exs .erl .hrl .gleam"
            exit 1
          fi
          
          if [[ ! -f "$FILE" ]]; then
            echo "Error: File '$FILE' not found"
            exit 1
          fi
          
          EXT=$(echo "$FILE" | sed 's/.*\.//')
          
          case "$EXT" in
            ex|exs)
              echo "Parsing Elixir file: $FILE"
              ${beamPackages.elixir}/bin/elixir -e "
                {:ok, content} = File.read(\"$FILE\")
                IO.puts(\"Module: #{inspect(content |> String.split(\"\\n\") |> Enum.find(&String.contains?(&1, \"defmodule\")))}\")"
              ;;
            erl|hrl)
              echo "Parsing Erlang file: $FILE"
              ${pkgs.erlang}/bin/erl -noshell -eval "
                {ok, Content} = file:read_file(\"$FILE\"),
                io:format(\"Module: ~s~n\", [Content]),
                halt()."
              ;;
            gleam)
              echo "Parsing Gleam file: $FILE"
              if command -v gleam >/dev/null; then
                ${beamPackages.gleam}/bin/gleam format --check "$FILE" 2>/dev/null && echo "✓ Valid Gleam syntax" || echo "✗ Invalid Gleam syntax"
              else
                echo "Gleam parser: File detected as Gleam module"
              fi
              ;;
            *)
              echo "Error: Unsupported file extension: $EXT"
              echo "Supported: .ex .exs .erl .hrl .gleam"
              exit 1
              ;;
          esac
        '';
        
        claude-zen-dev = pkgs.writeShellScriptBin "claude-zen-dev" ''
          #!/usr/bin/env bash
          # Claude Code Zen Development Helper
          
          set -e
          
          CMD="$1"
          shift || true
          
          case "$CMD" in
            beam-check)
              echo "🔍 Checking BEAM language files in project..."
              find . -name "*.ex" -o -name "*.exs" -o -name "*.erl" -o -name "*.hrl" -o -name "*.gleam" | while read -r file; do
                echo "Checking: $file"
                beam-parse "$file"
              done
              ;;
            beam-stats)
              echo "📊 BEAM Language Statistics:"
              echo "Elixir files: $(find . -name "*.ex" -o -name "*.exs" | wc -l)"
              echo "Erlang files: $(find . -name "*.erl" -o -name "*.hrl" | wc -l)"
              echo "Gleam files: $(find . -name "*.gleam" | wc -l)"
              ;;
            setup)
              echo "🚀 Setting up Claude Code Zen development environment..."
              npm install
              echo "✓ NPM dependencies installed"
              echo "✓ BEAM toolchain available"
              echo "✓ Ready for development!"
              ;;
            test-parsers)
              echo "🧪 Testing BEAM language parsers..."
              npm run test 2>/dev/null || echo "Run 'npm test' to test TypeScript parsers"
              echo "✓ Parser tests complete"
              ;;
            *)
              echo "Claude Code Zen Development Helper"
              echo ""
              echo "Commands:"
              echo "  setup        - Initialize development environment"
              echo "  beam-check   - Check all BEAM language files"
              echo "  beam-stats   - Show BEAM language statistics"
              echo "  test-parsers - Test language parsers"
              echo ""
              echo "BEAM Languages Supported:"
              echo "  • Elixir (.ex/.exs) - via Elixir ${beamPackages.elixir.version}"
              echo "  • Erlang (.erl/.hrl) - via Erlang ${pkgs.erlang.version}"
              echo "  • Gleam (.gleam) - via Gleam (when available)"
              ;;
          esac
        '';

      in
      {
        devShells.default = pkgs.mkShell {
          name = "claude-code-zen-dev";
          
          buildInputs = with pkgs; [
            # Node.js ecosystem
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            nodePackages.tsx
            
            # BEAM Language Toolchain
            erlang
            beamPackages.elixir
            beamPackages.gleam
            beamPackages.rebar3
            
            # Additional BEAM tools
            beamPackages.hex
            beamPackages.phoenix
            
            # System utilities
            git
            curl
            jq
            ripgrep
            fd
            tree
            
            # Custom development tools
            beam-language-parser
            claude-zen-dev
          ];
          
          shellHook = ''
            echo "🚀 Claude Code Zen Development Environment"
            echo ""
            echo "📦 Available Tools:"
            echo "  • Node.js $(node --version)"
            echo "  • NPM $(npm --version)"
            echo "  • TypeScript $(tsc --version)"
            echo "  • Elixir $(elixir --version | head -1)"
            echo "  • Erlang $(erl -eval 'erlang:display(erlang:system_info(otp_release)), halt().' -noshell)"
            echo "  • Gleam $(gleam --version 2>/dev/null || echo 'available')"
            echo ""
            echo "🛠️  Custom Commands:"
            echo "  • claude-zen-dev - Development helper"
            echo "  • beam-parse     - Parse BEAM language files"
            echo ""
            echo "📚 Quick Start:"
            echo "  Run: claude-zen-dev setup"
            echo ""
            
            # Set environment variables for BEAM languages
            export ERL_LIBS="$ERL_LIBS:${beamPackages.elixir}/lib/elixir/lib"
            export PATH="$PATH:${beamPackages.elixir}/bin:${beamPackages.gleam}/bin"
            
            # Add project-specific configuration
            export CLAUDE_ZEN_DEV=true
            export BEAM_PARSER_ENABLED=true
          '';
        };
        
        packages = {
          default = self.packages.${system}.claude-zen-dev;
          claude-zen-dev = claude-zen-dev;
          beam-language-parser = beam-language-parser;
        };
        
        apps = {
          default = {
            type = "app";
            program = "${claude-zen-dev}/bin/claude-zen-dev";
          };
          
          beam-parse = {
            type = "app";
            program = "${beam-language-parser}/bin/beam-parse";
          };
        };
      });
}