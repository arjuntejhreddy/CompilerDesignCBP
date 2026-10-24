// Flowchart Builder: Converts CFG into React Flow layout nodes/edges and Mermaid.js syntax

export class FlowchartBuilder {
  static buildReactFlow(cfg) {
    if (!cfg || !cfg.nodes || cfg.nodes.length === 0) {
      return { nodes: [], edges: [], mermaid: '' };
    }

    const rawNodes = cfg.nodes;
    const rawEdges = cfg.edges;

    // Simple top-down hierarchical layout algorithm
    // Assign levels to nodes via BFS/DFS from start node
    const levels = {};
    const adj = {};
    const inDegree = {};

    for (const n of rawNodes) {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    }

    for (const e of rawEdges) {
      if (adj[e.source]) adj[e.source].push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }

    const startNode = rawNodes.find(n => n.type === 'start') || rawNodes[0];
    const queue = [{ id: startNode.id, level: 0 }];
    levels[startNode.id] = 0;
    const visited = new Set([startNode.id]);

    while (queue.length > 0) {
      const { id, level } = queue.shift();
      for (const nextId of adj[id] || []) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          levels[nextId] = level + 1;
          queue.push({ id: nextId, level: level + 1 });
        }
      }
    }

    // Any unvisited nodes get placed at the end
    let maxLevel = Math.max(...Object.values(levels), 0);
    for (const n of rawNodes) {
      if (levels[n.id] === undefined) {
        levels[n.id] = ++maxLevel;
      }
    }

    // Group nodes by level for horizontal positioning
    const levelGroups = {};
    for (const n of rawNodes) {
      const lvl = levels[n.id];
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n);
    }

    const HORIZONTAL_SPACING = 240;
    const VERTICAL_SPACING = 130;
    const CANVAS_CENTER_X = 400;

    const reactFlowNodes = [];
    for (const [lvlStr, group] of Object.entries(levelGroups)) {
      const lvl = parseInt(lvlStr, 10);
      const groupWidth = (group.length - 1) * HORIZONTAL_SPACING;
      const startX = CANVAS_CENTER_X - groupWidth / 2;

      group.forEach((node, idx) => {
        const x = startX + idx * HORIZONTAL_SPACING;
        const y = 50 + lvl * VERTICAL_SPACING;

        reactFlowNodes.push({
          id: node.id,
          type: node.shape === 'diamond' ? 'decision' : (node.shape === 'oval' ? 'terminal' : 'process'),
          position: { x, y },
          data: {
            id: node.id,
            label: node.label,
            code: node.code,
            shape: node.shape,
            nodeType: node.type
          }
        });
      });
    }

    // Style and configure edges
    const reactFlowEdges = rawEdges.map((e, idx) => {
      const isTrue = e.label === 'true';
      const isFalse = e.label === 'false';
      const isLoop = e.label === 'loop_back';

      let strokeColor = '#64748b'; // default slate
      if (isTrue) strokeColor = '#10b981'; // green
      if (isFalse) strokeColor = '#ef4444'; // red
      if (isLoop) strokeColor = '#3b82f6'; // blue

      return {
        id: e.id || `e${idx}`,
        source: e.source,
        target: e.target,
        label: isLoop ? 'loop back' : e.label,
        type: isLoop ? 'smoothstep' : 'default',
        animated: isLoop,
        style: {
          stroke: strokeColor,
          strokeWidth: 2
        },
        labelStyle: {
          fill: strokeColor,
          fontWeight: 600,
          fontSize: 12
        },
        markerEnd: {
          type: 'arrowclosed',
          color: strokeColor
        }
      };
    });

    // Generate Mermaid.js syntax
    let mermaid = 'flowchart TD\n';
    for (const n of rawNodes) {
      const cleanCode = (n.code || n.label || '').replace(/["\n\r]/g, ' ').trim();
      if (n.shape === 'oval') {
        mermaid += `  ${n.id}(["${cleanCode}"])\n`;
      } else if (n.shape === 'diamond') {
        mermaid += `  ${n.id}{"${cleanCode}"}\n`;
      } else if (n.shape === 'circle') {
        mermaid += `  ${n.id}(("${cleanCode || '•'}"))\n`;
      } else {
        mermaid += `  ${n.id}["${cleanCode}"]\n`;
      }
    }

    for (const e of rawEdges) {
      const lbl = e.label ? `|${e.label}|` : '';
      mermaid += `  ${e.source} -->${lbl} ${e.target}\n`;
    }

    return {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
      mermaid
    };
  }
}
