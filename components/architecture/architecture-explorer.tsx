"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArchitectureGraph, GraphEdge, GraphNode, GraphScenario, PathKind } from "@/lib/architecture-types";

type Props = { graph: ArchitectureGraph };
type AlternativeSelection = Record<string, string>;

function alternativeGroups(nodes: GraphNode[]): { id: string; members: GraphNode[] }[] {
  const map = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    if (!node.alternativeGroup) continue;
    const members = map.get(node.alternativeGroup) ?? [];
    members.push(node);
    map.set(node.alternativeGroup, members);
  }
  return [...map.entries()]
    .map(([id, members]) => ({ id, members }))
    .filter((group) => group.members.length > 1);
}

function initialAlternatives(graph: ArchitectureGraph): AlternativeSelection {
  const selected: AlternativeSelection = {};
  for (const node of graph.nodes) {
    if (!node.alternativeGroup) continue;
    const current = selected[node.alternativeGroup];
    if (!current || node.defaultSelected) selected[node.alternativeGroup] = node.id;
  }
  return selected;
}

function initialSelectedId(graph: ArchitectureGraph): string {
  const grouped = Object.values(initialAlternatives(graph))[0];
  if (grouped) return grouped;
  return graph.nodes.find((node) => node.defaultSelected)?.id ?? graph.nodes[0]?.id ?? "";
}

function humanizeGroup(id: string) {
  const spaced = id.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function neighborIds(nodeId: string, edges: GraphEdge[]): Set<string> {
  const ids = new Set<string>();
  for (const edge of edges) {
    if (edge.from === nodeId) ids.add(edge.to);
    if (edge.to === nodeId) ids.add(edge.from);
  }
  return ids;
}

function nodeVisible(node: GraphNode, graph: ArchitectureGraph, alternatives: AlternativeSelection, showOptional: boolean) {
  if (node.alternativeGroup && alternatives[node.alternativeGroup] !== node.id) return false;
  if (node.optional && !showOptional) return false;
  if (node.optional && !node.alternativeGroup) {
    const neighbors = neighborIds(node.id, graph.edges);
    for (const [group, selectedId] of Object.entries(alternatives)) {
      const members = graph.nodes.filter((item) => item.alternativeGroup === group);
      const touchesUnselected = members.some((item) => item.id !== selectedId && neighbors.has(item.id));
      const touchesSelected = neighbors.has(selectedId);
      if (touchesUnselected && !touchesSelected) return false;
    }
  }
  if (node.alternativeGroup) return true;
  return node.defaultSelected || !node.optional;
}

function hasOptionalNodes(nodes: GraphNode[]) {
  return nodes.some((node) => node.optional);
}

export function ArchitectureExplorer({ graph }: Props) {
  const groups = useMemo(() => alternativeGroups(graph.nodes), [graph.nodes]);
  const [alternatives, setAlternatives] = useState<AlternativeSelection>(() => initialAlternatives(graph));
  const [path, setPath] = useState<PathKind | "both">("both");
  const [showOptional, setShowOptional] = useState(true);
  const [selectedId, setSelectedId] = useState(() => initialSelectedId(graph));
  const scenarios = graph.scenarios ?? [];
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const showOptionalControl = hasOptionalNodes(graph.nodes);

  const visibleNodes = useMemo(
    () => graph.nodes.filter((node) => nodeVisible(node, graph, alternatives, showOptional)),
    [graph, alternatives, showOptional],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const selected =
    visibleNodes.find((node) => node.id === selectedId) ??
    visibleNodes.find((node) => node.ownership === "authoritative") ??
    visibleNodes[0];

  const visibleEdges = graph.edges.filter((edge) => {
    if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return false;
    if (path === "both") return true;
    return edge.paths.includes(path);
  });

  const layers = [...graph.layers].sort((a, b) => a.order - b.order);
  const activeScenario = scenarios.find((scenario) => scenario.id === scenarioId);
  const highlightedIds = new Set(activeScenario?.highlightedNodeIds ?? []);
  const dimmedIds = new Set(activeScenario?.dimmedNodeIds ?? []);

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

  function selectAlternative(groupId: string, nodeId: string) {
    setAlternatives((current) => ({ ...current, [groupId]: nodeId }));
    setSelectedId(nodeId);
  }

  const controlCols = 1 + (groups.length ? 1 : 0) + (showOptionalControl ? 1 : 0);

  return (
    <div className="space-y-6">
      <div
        className={`grid scroll-mt-20 gap-3 rounded-2xl border border-slate-200 bg-white p-4 ${
          controlCols >= 3 ? "sm:grid-cols-3" : controlCols === 2 ? "sm:grid-cols-2" : ""
        }`}
      >
        {groups.map((group) => (
          <fieldset key={group.id} className="text-sm font-semibold text-slate-700">
            <legend className="mb-2">{humanizeGroup(group.id)}</legend>
            <div className="flex flex-col gap-2 font-normal">
              {group.members.map((node) => (
                <label key={node.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`alternative-${group.id}`}
                    className="accent-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
                    checked={alternatives[group.id] === node.id}
                    onChange={() => selectAlternative(group.id, node.id)}
                  />
                  {node.product}
                  {node.defaultSelected ? " (default)" : " (alternative)"}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
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
                <input
                  type="radio"
                  name="path-filter"
                  className="accent-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
                  checked={path === value}
                  onChange={() => setPath(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {showOptionalControl ? (
          <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              className="accent-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
              checked={showOptional}
              onChange={(event) => setShowOptional(event.target.checked)}
            />
            Show optional hops
          </label>
        ) : null}
      </div>

      {scenarios.length > 0 ? (
        <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <legend className="px-1 font-semibold text-slate-700">Scenarios</legend>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Graph scenarios">
            {scenarios.map((scenario) => (
              <label key={scenario.id} className="flex items-start gap-2 font-normal text-slate-700">
                <input
                  type="radio"
                  name="graph-scenario"
                  className="mt-1 accent-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
                  checked={scenarioId === scenario.id}
                  onChange={() => setScenarioId(scenario.id)}
                />
                <span>
                  <span className="font-semibold text-ink">{scenario.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">{scenario.summary}</span>
                </span>
              </label>
            ))}
          </div>
          {activeScenario ? <ScenarioCallout scenario={activeScenario} /> : null}
        </fieldset>
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs text-slate-600" aria-hidden="false">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1">
          <span className="h-0.5 w-6 bg-slate-700" /> solid + “sync”
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-500 bg-white px-3 py-1">
          <span className="h-px w-6 border-t border-dashed border-slate-700" /> dashed + “async”
        </span>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Authoritative vs derived is labeled on each node</span>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Optional / alternative badges use text, not color alone</span>
        {scenarios.length > 0 ? (
          <span className="rounded-full border border-slate-300 bg-white px-3 py-1">
            Scenario focus uses a “Highlighted” label; de-emphasized hops are marked in the node name
          </span>
        ) : null}
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
                      dimmed={!isOnPath(node) || dimmedIds.has(node.id)}
                      highlighted={highlightedIds.has(node.id)}
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
          highlightedIds={highlightedIds}
          dimmedIds={dimmedIds}
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

function ScenarioCallout({ scenario }: { scenario: GraphScenario }) {
  return (
    <aside className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700" aria-live="polite">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Scenario callout</p>
      <p className="mt-1">{scenario.callout}</p>
    </aside>
  );
}

function NodeButton({
  node,
  selected,
  dimmed,
  highlighted,
  onSelect,
  onKeyDown,
}: {
  node: GraphNode;
  selected: boolean;
  dimmed: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) {
  const badges = [
    node.ownership === "authoritative" ? "Authoritative" : "Derived",
    node.optional ? "Optional" : null,
    node.alternativeGroup && !node.defaultSelected ? "Alternative" : null,
    highlighted ? "Highlighted" : null,
    dimmed && !highlighted ? "De-emphasized" : null,
  ].filter(Boolean) as string[];

  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-pressed={selected}
      aria-label={`${node.title}. ${badges.join(". ")}. ${node.summary}`}
      className={`min-w-[10.5rem] flex-1 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 ${
        selected ? "border-cobalt bg-blue-50 ring-2 ring-cobalt" : "border-slate-200 bg-slate-50 hover:border-slate-400"
      } ${highlighted && !selected ? "border-ink ring-1 ring-ink" : ""} ${dimmed && !highlighted ? "opacity-50" : ""}`}
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
        <Link href={node.href} className="mt-4 inline-block text-sm font-semibold text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2">
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
  highlightedIds,
  dimmedIds,
  onKeySelect,
}: {
  layers: ArchitectureGraph["layers"];
  visibleNodes: GraphNode[];
  selected?: GraphNode;
  setSelectedId: (id: string) => void;
  isOnPath: (node: GraphNode) => boolean;
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt disabled:opacity-40"
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt disabled:opacity-40"
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
                  dimmed={!isOnPath(node) || dimmedIds.has(node.id)}
                  highlighted={highlightedIds.has(node.id)}
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
