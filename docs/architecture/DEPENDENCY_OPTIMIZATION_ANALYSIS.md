# Dependency Optimization: Replace with Partisan + Horde

## 🚨 Current Redundant Dependencies

Looking at the swarm-service mix.exs, we can remove several deps and use Partisan+Horde instead:

### **Can Remove:**
```elixir
# ❌ REMOVE - Partisan handles clustering
{:libcluster, "~> 3.4"},  # Already commented out ✅

# ❌ REMOVE - Horde handles distributed caching via CRDT registry  
{:nebulex, "~> 2.6"},     # Distributed caching - Horde does this

# ❌ REMOVE - Partisan handles pub/sub via channels
{:phoenix_pubsub, "~> 2.1"},  # Use Partisan channels instead

# ❌ REMOVE - Horde handles process pooling
{:poolboy, "~> 1.5"},     # Use Horde.DynamicSupervisor instead

# ❌ REMOVE - Can use GenServer + Horde supervision
{:gen_state_machine, "~> 3.0"},  # GenServer is sufficient with Horde
```

### **Keep for Specific Purposes:**
```elixir
# ✅ KEEP - Local caching is still useful
{:cachex, "~> 3.6"},      # Fast local cache (complement to Horde)

# ✅ KEEP - Consensus where strong consistency needed  
{:ra, "~> 2.6"},          # Raft for critical consensus

# ✅ KEEP - Core distributed stack
{:partisan, "~> 5.0"},    # Advanced clustering
{:horde, "~> 0.9.0"},     # CRDT registry/supervisor
```

## 🚀 How to Use Partisan + Horde Instead

### 1. **Replace Phoenix PubSub with Partisan Channels**

```elixir
# OLD: Phoenix PubSub
Phoenix.PubSub.broadcast(MyApp.PubSub, "topic", message)

# NEW: Partisan Channels  
:partisan.broadcast(
  {:swarm_events, [:reliable]},
  message,
  :partisan.membership()
)
```

### 2. **Replace Nebulex with Horde Registry**

```elixir
# OLD: Nebulex distributed cache
Nebulex.put(:my_cache, key, value)
Nebulex.get(:my_cache, key)

# NEW: Horde Registry as distributed cache
Horde.Registry.register(MyApp.DistributedRegistry, key, value)
Horde.Registry.lookup(MyApp.DistributedRegistry, key)
```

### 3. **Replace Poolboy with Horde DynamicSupervisor**

```elixir
# OLD: Poolboy for worker processes
:poolboy.checkout(:worker_pool)

# NEW: Horde DynamicSupervisor
Horde.DynamicSupervisor.start_child(
  MyApp.DistributedSupervisor,
  {WorkerProcess, args}
)
```

### 4. **Use Partisan for Service Discovery**

```elixir
# OLD: libcluster for node discovery
Node.list()

# NEW: Partisan membership
:partisan.membership()
:partisan.manager_active_view()
```

## 📋 Optimized Dependencies List

```elixir
defp deps do
  [
    # Core language support
    {:mix_gleam, "~> 0.6.2"},
    {:gleam_stdlib, "~> 0.62"},
    {:jason, "~> 1.4"},
    
    # HTTP server
    {:bandit, "~> 1.7"},
    {:cors_plug, "~> 3.0.3"},
    
    # Distributed core (replaces libcluster, phoenix_pubsub, nebulex, poolboy)
    {:partisan, "~> 5.0"},        # Advanced clustering + pub/sub
    {:horde, "~> 0.9.0"},         # CRDT registry + distributed supervision
    {:ra, "~> 2.6"},              # Raft consensus for critical operations
    
    # Storage and caching
    {:mnesia_rocksdb, "~> 0.1.1"}, # Persistent distributed storage
    {:cachex, "~> 3.6"},           # Fast local caching (complement to Horde)
    
    # Observability
    {:telemetry, "~> 1.3"},
    {:telemetry_metrics, "~> 1.1"},
    {:telemetry_poller, "~> 1.3"},
    
    # RuvSwarm integration (if still needed)
    {:rustler, "~> 0.35"},
    
    # Security
    {:guardian, "~> 2.3"},
    
    # Development and testing
    {:gleeunit, "~> 1.6", only: [:dev, :test], runtime: false},
    {:credo, "~> 1.7.12", only: [:dev, :test], runtime: false},
    {:ex_doc, "~> 0.38", only: :dev, runtime: false},
    {:excoveralls, "~> 0.18", only: :test},
    {:bypass, "~> 2.1", only: :test},
    {:ex_machina, "~> 2.7", only: :test},
    {:stream_data, "~> 1.1", only: [:test]},
    {:mox, "~> 1.2", only: :test},
    {:local_cluster, "~> 2.0", only: [:test]},
    {:benchee, "~> 1.3", only: :dev},
    {:benchee_html, "~> 1.0", only: :dev},
    {:sobelow, "~> 0.13", only: [:dev, :test], runtime: false}
  ]
end
```

## 🎯 Benefits of This Optimization

### **Removed Dependencies**: 5 libraries
- No phoenix_pubsub (replaced by Partisan channels)
- No nebulex (replaced by Horde registry)  
- No poolboy (replaced by Horde supervisor)
- No gen_state_machine (GenServer + Horde is sufficient)
- No libcluster (already using Partisan)

### **Performance Gains**:
- **Fewer dependencies** = faster compilation
- **Native BEAM communication** = microsecond latency
- **CRDT-based coordination** = partition tolerance
- **Unified architecture** = simpler debugging

### **Functionality Preserved**:
- Distributed caching via Horde Registry
- Pub/sub via Partisan channels
- Process supervision via Horde DynamicSupervisor
- Service discovery via Partisan membership
- Consensus via Ra (where needed)

## 🚀 About NATS/Kafka Later

**Recommendation**: Don't add them now. The Partisan+Horde stack already provides:
- **Internal messaging** (Partisan channels)
- **Service discovery** (Horde registry)  
- **Event streaming** (Partisan broadcasts)

Add NATS/Kafka only when you need:
- **External system integration** (non-BEAM services)
- **Persistent event sourcing** (audit trails)
- **Cross-language pub/sub** (Java, Go, Python services)

For now, Partisan+Horde gives you everything you need for swarm coordination!