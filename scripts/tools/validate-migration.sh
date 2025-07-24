#!/bin/bash

echo "🔍 Validating service migration to singularity-engine..."
echo ""

# Check if the services were moved successfully
echo "📦 Checking migrated services:"
for service in "bastion-engine-service" "fact-execution-service" "mcp-federation-service" "bpmn-workflow-service"; do
    if [ -d "/home/mhugo/code/singularity-engine/platform/$service" ]; then
        echo "  ✅ $service - Successfully migrated"
    else
        echo "  ❌ $service - Migration failed"
    fi
done

echo ""

# Check if symlinks exist
echo "🔗 Checking compatibility symlinks:"
for service in "bastion-rs" "FACT" "federated-mcp" "bpmn-engine"; do
    if [ -L "/home/mhugo/code/srv/$service" ]; then
        echo "  ✅ $service - Symlink exists"
        echo "    → $(readlink /home/mhugo/code/srv/$service)"
    else
        echo "  ❌ $service - Symlink missing"
    fi
done

echo ""

# Check if project.json files were created
echo "📋 Checking Nx project configurations:"
for service in "bastion-engine-service" "fact-execution-service" "mcp-federation-service" "bpmn-workflow-service"; do
    if [ -f "/home/mhugo/code/singularity-engine/platform/$service/project.json" ]; then
        echo "  ✅ $service - project.json exists"
    else
        echo "  ❌ $service - project.json missing"
    fi
done

echo ""

# Check if Nx workspace recognizes the services
echo "🔧 Testing Nx workspace integration:"
cd /home/mhugo/code/singularity-engine

if command -v npx >/dev/null 2>&1; then
    echo "  Running: npx nx show projects"
    PROJECTS=$(npx nx show projects 2>/dev/null | grep -E "(bastion-engine|fact-execution|mcp-federation|bpmn-workflow)" | wc -l)
    if [ "$PROJECTS" -eq 4 ]; then
        echo "  ✅ All 4 services recognized by Nx workspace"
        echo "  Services found:"
        npx nx show projects 2>/dev/null | grep -E "(bastion-engine|fact-execution|mcp-federation|bpmn-workflow)" | sed 's/^/    - /'
    else
        echo "  ⚠️  Only $PROJECTS out of 4 services recognized"
        echo "  You may need to clear Nx cache: npx nx reset"
    fi
else
    echo "  ⚠️  npx not available, skipping Nx integration test"
fi

echo ""
echo "✅ Migration validation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npx nx reset' in singularity-engine to clear Nx cache"
echo "2. Test building each service:"
echo "   - npx nx build bastion-engine-service"
echo "   - npx nx build fact-execution-service"
echo "   - npx nx build mcp-federation-service"
echo "3. Update any CI/CD configurations that reference the old paths"
echo "4. Update documentation to reflect the new service locations"