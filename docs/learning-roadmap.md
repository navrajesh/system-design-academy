# System Design Academy learning roadmap

The curriculum moves from data placement through scale, reliability, performance, networking, consistency, and full interview execution. Topics are ordered so later modules can reuse the mental models established earlier.

Status key: **Hardened** means the lesson meets the full learning standard, includes failure-oriented interaction, and passes automated content validation. **Planned** means the topic belongs to the defined curriculum and is ready for authoring under [content standards](./content-standards.md).

## Module 1 — Storage & Data

1. **Partitioning vs Sharding vs Aggregation** — logical routing, physical placement, local and global reduction, skew, resharding, and two-stage aggregation. **Hardened**
2. **Relational vs NoSQL Selection** — access patterns, constraints, joins, secondary indexes, scaling paths, and operational maturity. **Hardened**
3. **Data Modeling from Access Patterns** — entities, query-first schemas, denormalization, write amplification, and schema evolution. **Hardened**
4. **Indexes and Query Execution** — B-trees, LSM trees, composite and covering indexes, selectivity, and explain plans. **Hardened**
5. **Replication and Failover** — leader/follower, multi-leader, quorum replication, replica lag, fencing, and promotion. **Hardened**
6. **Time-Series and Append-Only Storage** — segment layout, compaction, retention, downsampling, and late data. **Hardened**
7. **Object Storage and Large Files** — multipart upload, metadata stores, checksums, lifecycle policy, and CDN delivery. **Hardened**
8. **Transactions Across Boundaries** — local transactions, optimistic concurrency, sagas, outbox/inbox, and compensation. **Hardened**
9. **Backup, Restore, and Disaster Recovery** — recovery point objective, recovery time objective, snapshots, logs, and restore testing. **Hardened**

## Module 2 — Scalability

1. **Scaling Read-Heavy Services** — stateless compute, cache-aside, read replicas, autoscaling, and bottleneck analysis. **Hardened**
2. **Load Balancing Deep Dive** — L4/L7, algorithms, health checks, connection draining, locality, and session affinity. **Planned**
3. **Caching Patterns and Invalidation** — CDN, application and database caches, eviction, TTL jitter, stampede protection, and coherence. **Planned**
4. **Write Scaling** — batching, partitioned ownership, asynchronous writes, write-behind, and contention. **Planned**
5. **Autoscaling and Capacity Planning** — leading signals, headroom, warm-up, bin packing, and seasonal capacity. **Planned**
6. **Fan-out Architectures** — fan-out on write/read, hybrid feeds, celebrity keys, ranking, and backfill. **Planned**
7. **Multi-Region Design** — active/passive, active/active, locality, data sovereignty, and traffic evacuation. **Planned**
8. **Migration at Scale** — shadow reads, dual writes, change-data capture, backfill, verification, and rollback. **Planned**

## Module 3 — Kafka & Fault Tolerance

1. **Kafka Delivery Semantics & Failure** — offsets, at-least-once, idempotency, outbox, poison records, and replay. **Hardened**
2. **Kafka Internals** — partitions, replicas, leaders, in-sync replicas, controller behavior, retention, and log segments. **Hardened**
3. **Consumer Groups and Rebalancing** — ownership, cooperative rebalance, lag, state restore, and parallelism limits. **Hardened**
4. **Ordering and Event Keys** — per-partition order, key choice, sequence numbers, causal order, and resequencing. **Hardened**
5. **Stream Processing and Windows** — event time, processing time, watermarks, late data, state stores, and changelogs. **Planned**
6. **Retries, Dead Letters, and Replay** — error taxonomy, retry topics, quarantine, replay controls, and operational ownership. **Planned**
7. **Failure Detection and Recovery** — heartbeats, leases, fencing tokens, split brain, failover, and repair. **Planned**
8. **Graceful Degradation** — bulkheads, circuit breakers, fallbacks, admission control, and dependency isolation. **Planned**
9. **Disaster Scenarios** — broker loss, regional loss, corrupt events, accidental deletion, and recovery exercises. **Planned**

## Module 4 — Performance

1. **Latency, Throughput & Queues** — Little's Law, utilization, tail latency, bounded queues, and load shedding. **Hardened**
2. **Performance Budgets and SLOs** — latency decomposition, error budgets, percentiles, burn rate, and ownership. **Planned**
3. **Concurrency Models** — threads, event loops, async I/O, CPU-bound work, and contention. **Planned**
4. **Batching and Compression** — amortization, latency cost, retry blast radius, codecs, and CPU/network trade-offs. **Planned**
5. **Database Performance** — connection pools, lock waits, query plans, N+1 access, caching, and read amplification. **Planned**
6. **Tail-Latency Control** — deadlines, cancellation, hedged requests, speculative execution, and partial results. **Planned**
7. **Backpressure and Overload** — push/pull flow control, bounded buffers, rate limits, priority, and fairness. **Planned**
8. **Profiling and Observability** — RED/USE methods, tracing, continuous profiling, cardinality, and regression detection. **Planned**
9. **Cost-Performance Engineering** — utilization, storage tiers, egress, reserved capacity, and cost per operation. **Planned**

## Module 5 — Networking

1. **Networking for System Design** — DNS, TCP/TLS, HTTP, load balancing, connection pools, timeouts, and retries. **Hardened**
2. **DNS and Service Discovery** — resolution, TTL, caching, registration, health, and failover behavior. **Planned**
3. **TCP, QUIC, and Connection Lifecycle** — handshakes, congestion, head-of-line blocking, reuse, and keepalive. **Planned**
4. **HTTP APIs and Protocol Choice** — REST, gRPC, streaming, payload evolution, compression, and error contracts. **Planned**
5. **CDNs and Edge Architecture** — points of presence, cache keys, purge, origin shielding, and edge compute. **Planned**
6. **Service Mesh and Proxies** — sidecars, mTLS, policy, retries, observability, and operational cost. **Planned**
7. **Rate Limiting** — token bucket, leaky bucket, sliding windows, distributed counters, and fairness. **Planned**
8. **Network Security Boundaries** — TLS identity, zero trust, segmentation, denial-of-service defense, and secret rotation. **Planned**
9. **Real-Time Connections** — WebSockets, server-sent events, long polling, presence, reconnect, and fan-out. **Planned**

## Module 6 — CAP & Consistency

1. **CAP & Practical Consistency** — partition behavior, linearizability, quorum assumptions, and invariant-driven choices. **Hardened**
2. **Consistency Models** — strong, eventual, causal, session guarantees, bounded staleness, and monotonicity. **Hardened**
3. **Consensus and Leader Election** — terms, quorums, replicated logs, safety, liveness, and membership. **Hardened**
4. **Distributed Transactions** — two-phase commit, sagas, escrow, reservations, compensation, and failure recovery. **Hardened**
5. **Conflict Resolution** — version vectors, last-write-wins, merge functions, conflict-free replicated data types, and user-visible repair. **Hardened**
6. **Distributed Locks and Leases** — expiry, renewal, fencing tokens, clock assumptions, and failure cases. **Hardened**
7. **Time and Ordering** — logical clocks, hybrid clocks, causal order, total order, and clock skew. **Hardened**
8. **Idempotency and Deduplication** — keys, retention windows, atomic records, request replay, and response caching. **Hardened**
9. **Consistency Testing** — histories, invariants, fault injection, linearizability checking, and Jepsen-style reasoning. **Hardened**

## Module 7 — Architecture & Mock Interviews

1. **Driving a System Design Interview** — scope, estimation, high-level path, deep dives, failure analysis, and communication. **Hardened**
2. **Design a URL Shortener** — identifiers, collision control, redirect latency, cache, abuse prevention, and analytics. **Planned**
3. **Design a News Feed** — fan-out, ranking, celebrity traffic, privacy changes, pagination, and freshness. **Planned**
4. **Design a Chat System** — conversation ordering, presence, delivery receipts, offline sync, media, and encryption boundaries. **Planned**
5. **Design a Rate Limiter** — algorithms, distributed counters, configuration, fairness, failure behavior, and enforcement points. **Planned**
6. **Design a Metrics Platform** — ingestion, dimensionality, aggregation, retention, query, alerting, and cost. **Planned**
7. **Design a File Storage Service** — upload protocol, chunks, metadata, deduplication, sharing, sync, and recovery. **Planned**
8. **Design an Ad Click Aggregator** — ingestion, deduplication, windows, hot campaigns, replay, serving, and audit. **Planned**
9. **Design TokenX** — ledger, balances, idempotency, double-spend prevention, settlement, audit, and analytics. **Planned**
10. **Architecture Review Practice** — requirement changes, bottleneck discovery, failure drills, migrations, and cost review. **Planned**
11. **Behavioral Architecture Communication** — decision records, incident learning, influence, disagreement, and technical strategy. **Planned**

## Recommended learning path

Complete the hardened foundation lesson in each module once to establish breadth. Modules 1 and 6 are now complete, providing the storage and distributed-correctness spine. Continue with Module 3 for event-driven reliability, Modules 2, 4, and 5 for operating behavior, then Module 7 for repeated timed practice. Every mock interview should produce a short gap list that points back to a specific curriculum topic.

## Delivery phases

- **Phase 0 — Complete:** the seven foundation lessons have corrected technical boundaries, explicit failure and recovery paths, challenging scenario checks, and reusable interactive learning components. Content validation covers frontmatter, section order, quiz counts, and Mermaid syntax.
- **Phase 1A — Complete:** all nine Storage & Data lessons and all nine CAP & Consistency lessons are hardened, cross-linked, interactive, and validated.
- **Phase 1B — In progress:** Module 3 now has four hardened lessons (delivery, internals, consumer groups, ordering). The academy contains 26 of 64 planned lessons. Continue with stream processing, retries, and disaster scenarios, then Modules 2, 4, 5, and 7.
- **Phase 2 — Future, not implemented:** add an Architecture Reference Library of reusable patterns, decision guides, failure modes, and canonical diagrams cross-linked to lessons and mock interviews.
