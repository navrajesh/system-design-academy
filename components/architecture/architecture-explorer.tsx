"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArchitectureGraph, GraphEdge, GraphNode, PathKind } from "@/lib/architecture-types";

type Props = { graph: ArchitectureGraph };

function nodeVisible(node: GraphNode, primary: "postgres" | "dynamodb", showOptional: boolean) {
  if (node.alternativeGroup === "primary-store") {
    if (primary === "postgres") return node.id !== "dynamodb";
    return node.id === "dynamodb" || (node.id !== "postgres-primary" && node.id !== "postgres-replica");
  }
  if (node.optional && !showOptional) return false;
  return node.defaultSelected || !node.optional;
}

export function ArchitectureExplorer({ graph }: Props) {
  const [primary, setPrimary] = useState<"postgres" | "dynamodb">("postgres");
  const [path, setPath] = useState<PathKind | "both">("both");
  const [showOptional, setShowOptional] = useState(true);
  const [selectedId, setSelectedId] = useState("postgres-primary");

  const visibleNodes = useMemo(
    () => graph.nodes.filter((node) => nodeVisible(node, primary, showOptional)),
    [graph.nodes, primary, showOptional],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const selected = visibleNodes.find((node) => node.id === selectedId) ?? visibleNodes[0];

  const visibleEdges = graph.edges.filter((edge) => {
    if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return false;
    if (path === "both") return true;
    return edge.paths.includes(path);
  });

  const layers = [...graph.layers].sort((a, b) => a.order - b.order);

  function isOnPath(node: GraphNode) {
    if (path === "both") return true;
    return node.paths.includes(path);
  }

  function onKeySelect(event: React.KeyboardEvent, nodes: GraphNode[], index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = nodes[Math.min(nodes.length - 1, index + 1)];
      if (next) setSelectedId(next.id);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = nodes[Math.max(0, index - 1)];
      if (prev) setSelectedId(prev.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <fieldset className="text-sm font-semibold text-slate-700">
          <legend className="mb-2">Primary store</legend>
          <div className="flex flex-col gap-2 font-normal">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="primary-store"
                checked={primary === "postgres"}
                onChange={() => {
                  setPrimary("postgres");
                  setSelectedId("postgres-primary");
                }}
              />
              PostgreSQL (default)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="primary-store"
                checked={primary === "dynamodb"}
                onChange={() => {
                  setPrimary("dynamodb");
                  setSelectedId("dynamodb");
                }}
              />
              DynamoDB (alternative)
            </label>
          </div>
        </fieldset>
        <fieldset className="text-sm font-semibold text-slate-700">
          <legend className="mb-2">Highlight path</legend>
          <div className="flex flex-col gap-2 font-normal">
            {(
              [
                ["both", "Read and write"],
                ["read", "Read path"],
                ["write", "Write path"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input type="radio" name="path-filter" checked={path === value} onChange={() => setPath(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={showOptional} onChange={(event) => setShowOptional(event.target.checked)} />
          Show optional hops (replica, outbox)
        </label>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600" aria-hidden="false">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1">
          <span className="h-0.5 w-6 bg-slate-700" /> solid + “sync”
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-500 bg-white px-3 py-1">
          <span className="h-px w-6 border-t border-dashed border-slate-700" /> dashed + “async”
        </span>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Authoritative vs derived is labeled on each node</span>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Optional / alternative badges use text, not color alone</span>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
        <ol className="space-y-3" aria-label="Layered production architecture">
          {layers.map((layer) => {
            const nodes = visibleNodes.filter((node) => node.layerId === layer.id);
            if (!nodes.length) return null;
            return (
              <li key={layer.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{layer.title}</p>
                <div className="flex flex-wrap gap-2" role="list">
                  {nodes.map((node, index) => (
                    <NodeButton
                      key={node.id}
                      node={node}
                      selected={selected?.id === node.id}
                      dimmed={!isOnPath(node)}
                      onSelect={() => setSelectedId(node.id)}
                      onKeyDown={(event) => onKeySelect(event, nodes, index)}
                    />
                  ))}
                </div>
                <EdgeLegend edges={visibleEdges.filter((edge) => nodes.some((node) => node.id === edge.from))} nodes={graph.nodes} />
              </li>
            );
          })}
        </ol>
        {selected && <DetailPanel node={selected} />}
      </div>

      <div className="lg:hidden">
        <MobileExplorer
          layers={layers}
          visibleNodes={visibleNodes}
          selected={selected}
          setSelectedId={setSelectedId}
          isOnPath={isOnPath}
          onKeySelect={onKeySelect}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <h3 className="font-semibold text-ink">Assumptions</h3>
        <ul className="mt-2 list-disc pl-5">
          {graph.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function NodeButton({
  node,
  selected,
  dimmed,
  onSelect,
  onKeyDown,
}: {
  node: GraphNode;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) {
  const badges = [
    node.ownership === "authoritative" ? "Authoritative" : "Derived",
    node.optional ? "Optional" : null,
    node.alternativeGroup && !node.defaultSelected ? "Alternative" : null,
  ].filter(Boolean) as string[];

  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-pressed={selected}
      aria-label={`${node.title}. ${badges.join(". ")}. ${node.summary}`}
      className={`min-w-[10.5rem] flex-1 rounded-xl border px-3 py-2 text-left transition ${
        selected ? "border-cobalt bg-blue-50 ring-2 ring-cobalt" : "border-slate-200 bg-slate-50 hover:border-slate-400"
      } ${dimmed ? "opacity-50" : ""}`}
    >
      <span className="block text-sm font-semibold text-ink">{node.title}</span>
      <span className="mt-1 block text-[11px] text-slate-500">{node.product}</span>
      <span className="mt-2 flex flex-wrap gap-1">
        {badges.map((badge) => (
          <span key={badge} className="rounded-full border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {badge}
          </span>
        ))}
      </span>
    </button>
  );
}

function EdgeLegend({ edges, nodes }: { edges: GraphEdge[]; nodes: GraphNode[] }) {
  if (!edges.length) return null;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <ul className="mt-3 space-y-1 text-[11px] text-slate-500">
      {edges.map((edge) => (
        <li key={edge.id} className="flex items-center gap-2">
          <span
            className={`inline-block w-8 ${edge.kind === "async" ? "border-t border-dashed border-slate-700" : "h-0.5 bg-slate-700"}`}
            aria-hidden="true"
          />
          <span>
            {byId.get(edge.from)?.title} → {byId.get(edge.to)?.title}: {edge.label} ({edge.kind})
          </span>
        </li>
      ))}
    </ul>
  );
}

function DetailPanel({ node }: { node: GraphNode }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cobalt">Selected hop</p>
      <h3 className="mt-1 font-display text-2xl font-semibold text-ink">{node.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{node.summary}</p>
      <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <div>
          <dt className="font-semibold text-ink">Consistency</dt>
          <dd>{node.detail.consistency}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Durability</dt>
          <dd>{node.detail.durability}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Failure</dt>
          <dd>{node.detail.failure}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Recovery</dt>
          <dd>{node.detail.recovery}</dd>
        </div>
      </dl>
      {node.href ? (
        <Link href={node.href} className="mt-4 inline-block text-sm font-semibold text-cobalt">
          Open reference for {node.product}
        </Link>
      ) : null}
    </aside>
  );
}

function MobileExplorer({
  layers,
  visibleNodes,
  selected,
  setSelectedId,
  isOnPath,
  onKeySelect,
}: {
  layers: ArchitectureGraph["layers"];
  visibleNodes: GraphNode[];
  selected?: GraphNode;
  setSelectedId: (id: string) => void;
  isOnPath: (node: GraphNode) => boolean;
  onKeySelect: (event: React.KeyboardEvent, nodes: GraphNode[], index: number) => void;
}) {
  const [step, setStep] = useState(0);
  const orderedLayers = layers.filter((layer) => visibleNodes.some((node) => node.layerId === layer.id));
  const current = orderedLayers[Math.min(step, orderedLayers.length - 1)];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Previous layer
        </button>
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          Step {step + 1} of {orderedLayers.length}
        </p>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
          disabled={step >= orderedLayers.length - 1}
          onClick={() => setStep((value) => Math.min(orderedLayers.length - 1, value + 1))}
        >
          Next layer
        </button>
      </div>
      {orderedLayers.map((layer) => (
        <details key={layer.id} open={layer.id === current?.id} className="rounded-2xl border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink">{layer.title}</summary>
          <div className="mt-3 space-y-2">
            {visibleNodes
              .filter((node) => node.layerId === layer.id)
              .map((node, index, list) => (
                <NodeButton
                  key={node.id}
                  node={node}
                  selected={selected?.id === node.id}
                  dimmed={!isOnPath(node)}
                  onSelect={() => setSelectedId(node.id)}
                  onKeyDown={(event) => onKeySelect(event, list, index)}
                />
              ))}
          </div>
        </details>
      ))}
      {selected && <DetailPanel node={selected} />}
    </div>
  );
}
