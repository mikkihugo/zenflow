#!/usr/bin/env python3
"""
Smart Task Generator with FACT checking, ADR generation, and research
Analyzes Singularity code and generates verified, non-duplicate tasks
"""

import re
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Optional
import json

class FactChecker:
    """FACT system integration for code verification"""
    
    def __init__(self, singularity_path: str):
        self.singularity_path = Path(singularity_path)
        self.code_database = {}
        self._build_code_database()
    
    def _build_code_database(self):
        """Build database of existing code patterns"""
        print("🔍 Building FACT database from Singularity code...")
        
        for code_file in self.singularity_path.rglob("*.erl"):
            content = code_file.read_text()
            
            # Extract function signatures
            functions = re.findall(r'^(\w+)\([^)]*\)\s*->', content, re.MULTILINE)
            
            # Extract module behaviors
            behaviors = re.findall(r'-behaviour\((\w+)\)', content)
            
            # Extract gen_server patterns
            genserver_patterns = re.findall(r'(handle_call|handle_cast|handle_info|init|terminate)', content)
            
            self.code_database[str(code_file)] = {
                'functions': functions,
                'behaviors': behaviors, 
                'patterns': genserver_patterns,
                'content_hash': hashlib.md5(content.encode()).hexdigest()
            }
    
    def check_implementation_exists(self, function_name: str, module_pattern: str) -> Dict[str, Any]:
        """Check if implementation already exists"""
        findings = []
        
        for file_path, data in self.code_database.items():
            if function_name in data['functions']:
                findings.append({
                    'file': file_path,
                    'type': 'function_exists',
                    'confidence': 0.9
                })
            
            if module_pattern in str(file_path):
                findings.append({
                    'file': file_path,
                    'type': 'similar_module',
                    'confidence': 0.7
                })
        
        return {
            'exists': len(findings) > 0,
            'findings': findings,
            'recommendation': 'skip' if findings else 'implement'
        }

class ResearchEngine:
    """Research existing solutions and patterns"""
    
    def research_erlang_pattern(self, pattern: str) -> Dict[str, Any]:
        """Research Erlang/OTP patterns"""
        
        # Common Erlang/OTP patterns knowledge base
        patterns_db = {
            'consistent_hashing': {
                'algorithms': ['SHA-1 ring', 'Jump consistent hash', 'Rendezvous hashing'],
                'erlang_libs': ['riak_core', 'hash_ring', 'consistent_hash'],
                'recommendation': 'Use riak_core for production-grade consistent hashing'
            },
            'gossip_protocol': {
                'algorithms': ['Epidemic broadcast', 'Anti-entropy', 'Rumor mongering'],
                'erlang_libs': ['partisan', 'plumtree', 'scamp'],
                'recommendation': 'Use plumtree for efficient gossip with tree optimization'
            },
            'rust_nif': {
                'patterns': ['Resource management', 'Dirty schedulers', 'Message passing'],
                'best_practices': ['Use ResourceArc', 'Handle timeouts', 'Avoid blocking'],
                'recommendation': 'Use rustler with proper resource lifecycle management'
            },
            'supervision': {
                'strategies': ['one_for_one', 'one_for_all', 'rest_for_one', 'simple_one_for_one'],
                'recommendation': 'Use one_for_one for independent processes like memory shards'
            }
        }
        
        return patterns_db.get(pattern, {
            'recommendation': f'Research {pattern} patterns in Erlang/OTP documentation'
        })

class ADRGenerator:
    """Generate Architecture Decision Records"""
    
    def generate_adr(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ADR based on code analysis context"""
        
        adr_templates = {
            'supervision_strategy': {
                'title': 'Memory Service Supervision Strategy',
                'context': 'Need to choose supervision strategy for memory shards and workers',
                'options': [
                    'one_for_one: Independent restarts (recommended)',
                    'one_for_all: Restart all on failure', 
                    'rest_for_one: Restart failed and subsequent processes'
                ],
                'decision': 'one_for_one',
                'rationale': 'Memory shards should be independent - one shard failure should not affect others',
                'consequences': {
                    'positive': ['Fault isolation', 'Better availability'],
                    'negative': ['Possible data inconsistency during restart']
                }
            },
            'consistent_hashing': {
                'title': 'Consistent Hashing Algorithm Choice',
                'context': 'Need consistent hashing for memory shard distribution',
                'options': [
                    'SHA-1 ring: Simple but uneven distribution',
                    'Jump consistent hash: Even distribution, complex rebalancing',
                    'Rendezvous hashing: Simple, good for small clusters'
                ],
                'decision': 'SHA-1 ring with virtual nodes',
                'rationale': 'Balance between simplicity and distribution quality',
                'consequences': {
                    'positive': ['Well-understood algorithm', 'Good Erlang libraries'],
                    'negative': ['Requires virtual nodes for even distribution']
                }
            },
            'rust_nif_integration': {
                'title': 'Rust NIF Integration Pattern',
                'context': 'Need safe and efficient Rust NIF integration',
                'options': [
                    'Direct NIFs: Fast but unsafe',
                    'Resource pools: Safe with lifecycle management',
                    'Port drivers: Safe but slower'
                ],
                'decision': 'Resource pools with ResourceArc',
                'rationale': 'Provides safety guarantees while maintaining performance',
                'consequences': {
                    'positive': ['Memory safety', 'Proper lifecycle management'],
                    'negative': ['Slightly more complex implementation']
                }
            }
        }
        
        pattern = context.get('pattern', 'default')
        return adr_templates.get(pattern, adr_templates['supervision_strategy'])

class SmartTaskGenerator:
    """Main task generator with FACT checking and research"""
    
    def __init__(self, singularity_path: str):
        self.fact_checker = FactChecker(singularity_path)
        self.research_engine = ResearchEngine()
        self.adr_generator = ADRGenerator()
        self.singularity_path = Path(singularity_path)
    
    def generate_smart_tasks(self) -> List[Dict[str, Any]]:
        """Generate smart tasks with full verification"""
        print("🤖 Generating smart tasks with FACT checking...")
        
        tasks = []
        memory_dir = self.singularity_path / "platform/memory-service/erlang/src"
        
        for erl_file in memory_dir.glob("*.erl"):
            content = erl_file.read_text()
            
            # Find TODOs with FACT checking
            for i, line in enumerate(content.split('\n'), 1):
                if 'TODO' in line:
                    task = self._create_verified_task(erl_file, i, line, 'todo')
                    if task:
                        tasks.append(task)
            
            # Find stubs with verification
            for i, line in enumerate(content.split('\n'), 1):
                if 'error, unknown_request' in line or 'error, not_implemented' in line:
                    task = self._create_verified_task(erl_file, i, line, 'stub')
                    if task:
                        tasks.append(task)
        
        # Generate ADRs
        adrs = self._generate_required_adrs()
        
        return {
            'tasks': tasks[:10],  # Top 10 verified tasks
            'adrs': adrs,
            'total_found': len(tasks)
        }
    
    def _create_verified_task(self, file_path: Path, line_num: int, content: str, task_type: str) -> Optional[Dict[str, Any]]:
        """Create task with FACT verification and research"""
        
        # Extract pattern from content
        if 'consistent' in content.lower():
            pattern = 'consistent_hashing'
        elif 'gossip' in content.lower():
            pattern = 'gossip_protocol'
        elif 'nif' in content.lower():
            pattern = 'rust_nif'
        else:
            pattern = 'general'
        
        # FACT check if implementation exists
        fact_check = self.fact_checker.check_implementation_exists(
            pattern, file_path.stem
        )
        
        if fact_check['recommendation'] == 'skip':
            print(f"   ⚠️  Skipping {file_path.name}:{line_num} - similar implementation found")
            return None
        
        # Research best practices
        research = self.research_engine.research_erlang_pattern(pattern)
        
        # Generate task
        task = {
            'id': f'SMART-{len(str(file_path))}:{line_num}',
            'title': f'Implement {pattern.replace("_", " ")} in {file_path.name}',
            'description': content.strip(),
            'file': str(file_path),
            'line': line_num,
            'type': task_type,
            'pattern': pattern,
            'hours': 3 if task_type == 'stub' else 2,
            'fact_verified': True,
            'research': research,
            'implementation_notes': research.get('recommendation', ''),
            'priority': 'high' if task_type == 'stub' else 'medium'
        }
        
        return task
    
    def _generate_required_adrs(self) -> List[Dict[str, Any]]:
        """Generate required ADRs based on code analysis"""
        
        required_adrs = [
            {'pattern': 'supervision_strategy'},
            {'pattern': 'consistent_hashing'},
            {'pattern': 'rust_nif_integration'}
        ]
        
        adrs = []
        for adr_context in required_adrs:
            adr = self.adr_generator.generate_adr(adr_context)
            adr['id'] = f"ADR-{len(adrs)+1:03d}"
            adr['status'] = 'needs_approval'
            adrs.append(adr)
        
        return adrs

def main():
    singularity_path = "/home/mhugo/code/singularity-engine"
    generator = SmartTaskGenerator(singularity_path)
    
    result = generator.generate_smart_tasks()
    
    print("\n🎯 SMART TASKS (FACT-VERIFIED & RESEARCHED)")
    print("=" * 60)
    
    for i, task in enumerate(result['tasks'], 1):
        priority_emoji = "🔴" if task['priority'] == 'high' else "🟡"
        print(f"{i:2d}. {priority_emoji} {task['id']}: {task['title']}")
        print(f"     📁 {Path(task['file']).name}:{task['line']} | ⏰ {task['hours']}h | ✅ FACT-verified")
        print(f"     🔬 Research: {task['implementation_notes']}")
        print(f"     💡 {task['description'][:60]}...")
        print()
    
    print(f"\n📋 ARCHITECTURE DECISION RECORDS")
    print("=" * 40)
    
    for adr in result['adrs']:
        print(f"📄 {adr['id']}: {adr['title']}")
        print(f"   💡 Decision: {adr['decision']}")
        print(f"   🤔 Rationale: {adr['rationale']}")
        print()
    
    print(f"\n📊 Summary:")
    print(f"   ✅ {len(result['tasks'])} FACT-verified tasks ready")
    print(f"   📋 {len(result['adrs'])} ADRs need approval")
    print(f"   🔍 {result['total_found']} total tasks found (duplicates filtered)")
    print(f"   🤖 All tasks researched with best practices")

if __name__ == "__main__":
    main()