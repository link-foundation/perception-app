import { Box, Button, useColorMode, useTheme, VStack } from "@chakra-ui/react";
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { createContext, forwardRef, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
// import COSEBilkent from 'cytoscape-cose-bilkent';
// import d3Force from 'cytoscape-d3-force';
// import deepd3Force from 'cytoscape-deep-d3-force';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
// import euler from 'cytoscape-euler';
// import elk from 'cytoscape-elk';
// import cxtmenu from 'cytoscape-cxtmenu';
// import cxtmenu from '@lsvih/cytoscape-cxtmenu/src/index';
import edgehandles from 'cytoscape-edgehandles';
// import cytoscapeLasso from 'cytoscape-lasso';
import dynamic from 'next/dynamic';
import { Planet } from 'react-planet';
import { IoInfiniteSharp } from "react-icons/io5";

import { Id, Link, useMinilinksApply, useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import { useChakraColor, getChakraVar as _getChakraVar, getChakraColor, getChakraVar } from "@deep-foundation/perception-imports/imports/hooks";
import { FocusContext, PathContext, GoContext } from "./orientation";
import {useDebounce, useDebounceCallback} from '@react-hook/debounce';

import { MdOutlineCenterFocusWeak } from "react-icons/md";
import { LuChevronLast, LuChevronFirst } from "react-icons/lu";
import { useResizeDetector } from "react-resize-detector";

import { TypedIcon } from './icons/typed';
import { DownIcon } from './icons/down';
import { UpIcon } from './icons/up';
import { TypeIcon } from './icons/type';
import { InIcon } from './icons/in';
import { OutIcon } from './icons/out';
import { FromIcon } from './icons/from';
import { ToIcon } from './icons/to';
import { GoContextI, useGoCore } from "@deep-foundation/perception-imports/imports/go";
import isEqual from 'lodash/isEqual';
import flatten from 'lodash/flatten';
import difference from 'lodash/difference';
import cloneDeep from 'lodash/cloneDeep';
import { useChakraVar } from "@deep-foundation/perception-imports/imports/hooks";
import { ReactHandlersContext } from "@deep-foundation/perception-imports/imports/react-handler";
import { useHandlersGo } from "@deep-foundation/perception-imports/imports/client-handler";

const dpl = '@deep-foundation/perception-links';

const CytoscapeComponent = dynamic<any>(
  // @ts-ignore
  () => import('react-cytoscapejs').then((m) => m.default),
  { ssr: false }
);

cytoscape.use(dagre);
// cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
// cytoscape.use(elk);
// cytoscape.use(euler);
// cytoscape.use(d3Force);
// cytoscape.use(deepd3Force);
cytoscape.use(fcose);
cytoscape.use(cola);

cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);

export function useCytoFocusMethods(cy) {
  const lockingRef = useRef<any>({});
  return {
    lockingRef,
    focus: async (elOrEl, position) => {
      // if (typeof(elOrEl) === 'number') {
      //   return await focus(elOrEl, position);
      // } else {
      //   const el = elOrEl;
      //   const id = el?.data('link')?.id;
      //   const locking = lockingRef.current;
      //   if (id) {
      //     // locking[id] = true;
      //     // el.lock();
      //     const focused = await focus(id, position);
      //     return focused;
      //   }
      // }
    },
    unfocus: async (elOrEl) => {
      // if (typeof(elOrEl) === 'number') {
      //   return await unfocus(elOrEl);
      // } else {
      //   const el = elOrEl;
      //   const locking = lockingRef.current;
      //   const id = el?.data('link')?.id;
      //   if (id) {
      //     // el.unlock();
      //     // locking[id] = false;
      //     const focused = await unfocus(id);
      //     return focused;
      //   }
      // }
    }
  };
}

const keys = ['type','to','from'];
export const GraphLink = memo(function GraphLink({
  link, cy, relayout, linksRef
}: {
  link: Link<Id>;
  cy?: any;
  relayout?: any;
  linksRef?: any;
}) {
  const newElements = useCallback((l) => {
    const elements: any = [
      {
        id: `${l.id}`,
        data: {
          id: `${l.id}`, link: l,
          label: `${l.name || l.id}

  ${l.symbol}`,
        },
        classes: ['link-node'].join(' '),
      },
    ];
    for (let k in keys) {
      const key = keys[k];
      if (l[`${key}_id`]) {
        const rid = cy.$id(l[`${key}_id`]).id()
        const gid = cy.$id(`${l[`${key}_id`]}-ghost`).id();
        const _id = rid || gid || `${l[`${key}_id`]}-ghost`;
        if (!rid && !gid) elements.push({
          id: _id,
          data: { id: _id, link: l, },
          classes: ['link-ghost',`link-ghost`].join(' '),
        })
        elements.push({
          data: {
            relation: key,
            id: `${l.id}-${key}`, link: l,
            source: `${l.id}`, target: _id,
          },
          classes: [`link-${key}`,`link-edge`].join(' '),
        });
      }
    }
    return elements;
  }, []);
  const apply = useCallback((link) => {
    const el: any = newElements(link);
    if (cy.$id(`${link.id}`).length) {
      cy.$id(`${link.id}`).data(el.data);
    } else {
      cy.add(el);
    }
    if (cy.$id(`${link.id}-ghost`).length) {
      const g = cy.$id(`${link.id}-ghost`);
      if (g.id()) cy.$(`.link-edge[target="${g.id()}"]`).forEach(e => {
        const d = e.data();
        e.remove();
        cy.add({
          data: { ...d, target: `${link.id}` },
          classes: [`link-edge`, `link-${d.key}`].join(' '),
        });
      });
      g.remove();
    }
  }, []);
  const unapply = useCallback((link) => {
    cy.$(`.link-edge[target="${link.id}"]`).remove();
    cy.$(`.link-edge[source="${link.id}"]`).remove();
    cy.remove(`${link.id}`);
  }, []);
  useEffect(() => {
    return () => {
      unapply(link);
      relayout();
    };
  }, []);
  useEffect(() => {
    apply(link);
    relayout();
  });
  return null;
}, (p, n) => isEqual(p.link.toPlain(), n.link.toPlain()))

export const Graph = memo(function Graph({
  onLoaded: _onLoaded,
  children = null,
}: {
  onLoaded?: (cy) => void;
  children?: any;
}){
  // console.log('https://github.com/deep-foundation/deepcase-app/issues/236', 'CytoGraph', 'links', links);
  const deep = useDeep();
  const go = useGoCore();

  const [_cy, setCy] = useState<any>();
  const cyRef = useRef<any>(); cyRef.current = _cy;
  const layoutRef = useRef<any>();
  const overlayRef = useRef<any>();
  const bgRef = useRef<any>();
  const rootRef = useRef<any>();
  const { width, height } = useResizeDetector({ targetRef: rootRef });
  const [viewport, setViewport] = useState<{ zoom: number; pan: { x: number; y: number; }}>({ zoom: 1, pan: { x: width / 2, y: height / 2 } });
  const { colorMode, toggleColorMode } = useColorMode();

  const getChakraVar = useChakraVar();

  const line = useChakraColor('deepLine');

  const active = useCallback((id, __cy) => {
    const cy = __cy || _cy;
    const pos = cy.$(`#${id}`).position();
    const pan = cy.pan();
    const zoom = cy.zoom();
    if (cy && id) {
      // cy.$('.link-node-active').not(cy.$(`#${id}`)).removeClass('link-node-active').unlock();
      // cy.$(`#${id}`).addClass('link-node-active').lock();
    }
    // if (pos) {
    //   planetRef.current.style['left'] = `${pos.x}px`;
    //   planetRef.current.style['top'] = `${pos.y}px`;
    //   planetRef.current.style['display'] = `block`;
    // }
    // go({
    //   itemIndex: pathItemIndex, index: resultIndex,
    //   linkId: id, position: 'next',
    // });
  }, [_cy]);
  const activeRef = useRef(active);
  activeRef.current = active;

  const onLoaded = useCallback((cy) => {
    console.log('Graph onLoaded', cy);
    if (_cy) return;
    setCy(cy); cyRef.current = cy;
    if (go?.data) go.data.cy = cy;

    const active = activeRef.current;

    const viewport = (event) => {
      const pan = cy.pan();
      const zoom = cy.zoom();
      setViewport({ pan, zoom });
      bgRef.current.style['background-size'] = `${zoom * 3}em ${zoom * 3}em`;
      bgRef.current.style['background-position'] = `${pan.x}px ${pan.y}px`;
      overlayRef.current.style['transform'] = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    };

    const mouseover = (event) => {
      const linkId = +(event?.target?.id ? event?.target.id() : 0);
      active(linkId, cy);
    };

    const mouseout = (event) => {
      const linkId = +(event?.target?.id ? event?.target.id() : 0);
    };

    const click = (e) => {
      const d = e.target.data();
      if (d.linkId) {
        go().do('click', { id: d.linkId, cytoscapeEvent: e });
      }
    };
    const position = (e) => {
      const d = e.target.data();
      if (d.linkId) {
        go().do('position', { id: d.linkId, cytoscapeEvent: e });
        if (go(d.linkId)?.ref?.current) {
          const p = e.target.position();
          go(d.linkId).ref.current.style['transform'] = `translate(${p.x}px,${p.y}px)`;
        }
      }
    };

    cy.on('viewport', viewport);
    cy.on('mouseover', mouseover);
    cy.on('mouseout', mouseout);

    const nodes = cy.nodes();
    const edges = cy.edges();
    cy.on('click', click);
    cy.on('position', position);

    relayout();

    _onLoaded && _onLoaded(cy);

    return () => {
      cy.removeListener('viewport', viewport);
      cy.removeListener('mouseover', mouseover);
      cy.removeListener('mouseout', mouseout);

      cy.removeListener('click', click);
      cy.removeListener('position', position);
    };
  }, [_cy]);

  const [styles, setStyles] = useState({});
  const stylesRef = useRef<any>(styles);
  stylesRef.current = styles;
  const style = useCallback((i: number, style?: any) => {
    const styles = { ...stylesRef.current };

    if (!style) delete styles[i];
    else {
      styles[i] = style;
    }
    setStyles(styles);
  }, []);

  const newStylesheets = useCallback(() => {
    const e = bgRef.current;
    const stylesheets = [
      ...(flatten(Object.values(styles)))
    ];
    const _stylesheets: any = cloneDeep(stylesheets);
    for (let s in _stylesheets) {
      const st = _stylesheets[s].style;
      if (st['color']) st['color'] = getChakraVar(st['color']);
      if (st['background-color']) st['background-color'] = getChakraVar(st['background-color']);
      if (st['border-color']) st['border-color'] = getChakraVar(st['border-color']);
      if (st['text-background-color']) st['text-background-color'] = getChakraVar(st['text-background-color']);
      if (st['text-border-color']) st['text-border-color'] = getChakraVar(st['text-border-color']);
      if (st['overlay-color']) st['overlay-color'] = getChakraVar(st['overlay-color']);
      if (st['underlay-color']) st['underlay-color'] = getChakraVar(st['underlay-color']);
      if (st['active-bg-color']) st['active-bg-color'] = getChakraVar(st['active-bg-color']);
      if (st['selection-box-color']) st['selection-box-color'] = getChakraVar(st['selection-box-color']);
      if (st['selection-box-border-color']) st['selection-box-border-color'] = getChakraVar(st['selection-box-border-color']);
      if (st['outside-texture-bg-color']) st['outside-texture-bg-color'] = getChakraVar(st['outside-texture-bg-color']);
    }
    return _stylesheets;
  }, [styles, colorMode]);

  const elements = useMemo(() => [], []);

  const layout = useMemo(() => ({
    name: 'cola',
    // animate: false, // whether to show the layout as it's running
    refresh: 10, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 100, // max length in ms to run the layout
    // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: false, // on every layout reposition of nodes, fit the viewport
    // // padding: 30, // padding around the simulation
    // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  
    // // layout event callbacks
    // ready: function(){}, // on layoutready
    // stop: function(){}, // on layoutstop
  
    // // positioning options
    // randomize: false, // use random node positions at beginning of layout
    // avoidOverlap: false, // if true, prevents overlap of node bounding boxes
    // handleDisconnected: false, // if true, avoids disconnected components from overlapping
    // convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    // nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
    // flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    // alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    // gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
    // centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)
  
    // // different methods of specifying edge length
    // // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: function( edge ) {
      const baseLength = 100; // base edge length
      const extraLength = 10; // additional length of the edge to take into account the density of connections
      const sourceNode = edge.source();
      const targetNode = edge.target();
  
      // Calculate the number of connected edges for source nodes and target nodes
      const sourceConnectedEdges = sourceNode.connectedEdges().length;
      const targetConnectedEdges = targetNode.connectedEdges().length;
  
      // Increase edge length based on the number of connected edges
      return baseLength + (sourceConnectedEdges + targetConnectedEdges) * extraLength;
    },
    // edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    // edgeJaccardLength: undefined, // jaccard edge length in simulation
  
    // // iterations of cola algorithm; uses default values on undefined
    // unconstrIter: undefined, // unconstrained initial layout iterations
    // userConstIter: undefined, // initial layout iterations with user-specified constraints
    // allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    
    // deep: () => deep,
    // name: 'deep-d3-force',
    // animate: true, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
    // maxIterations: 0, // max iterations before the layout will bail out
    // maxSimulationTime: 0, // max length in ms to run the layout
    // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    // fixedAfterDragging: false, // fixed node after dragging
    // fit: false, // on every layout reposition of nodes, fit the viewport
    // padding: 30, // padding around the simulation
    // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    // /**d3-force API**/
    // alpha: 0.8, // sets the current alpha to the specified number in the range [0,1]
    // alphaMin: 0.001, // sets the minimum alpha to the specified number in the range [0,1]
    // alphaDecay: 0.5, // sets the alpha decay rate to the specified number in the range [0,1]
    // alphaTarget: 0.1, // sets the current target alpha to the specified number in the range [0,1]
    // velocityDecay: 0.6, // sets the velocity decay factor to the specified number in the range [0,1]
    // // collideRadius: 1, // sets the radius accessor to the specified number or function
    // // collideStrength: 0.7, // sets the force strength to the specified number in the range [0,1]
    // // collideIterations: 1, // sets the number of iterations per application to the specified number
    // linkId: function id(d) {
    //   return d.id;
    // }, // sets the node id accessor to the specified function
    // linkDistance: 100, // sets the distance accessor to the specified number or function
    // // linkStrength: function strength(link) {
    // //   const sourceNode = cy.getElementById(link.source.id);
    // //   const targetNode = cy.getElementById(link.target.id);
    // //   return 1 / Math.min(sourceNode.degree(), targetNode.degree());
    // // }, // sets the strength accessor to the specified number or function
    // // linkIterations: 1, // sets the number of iterations per application to the specified number
    // manyBodyStrength: -2000, // sets the strength accessor to the specified number or function
    // // manyBodyTheta: 0.9, // sets the Barnes–Hut approximation criterion to the specified number
    // // manyBodyDistanceMin: 1, // sets the minimum distance between nodes over which this force is considered
    // // manyBodyDistanceMax: Infinity, // sets the maximum distance between nodes over which this force is considered
    // xStrength: 0.09, // sets the strength accessor to the specified number or function
    // xX: 0, // sets the x-coordinate accessor to the specified number or function
    // yStrength: 0.09, // sets the strength accessor to the specified number or function
    // yY: 0, // sets the y-coordinate accessor to the specified number or function
    // // radialStrength: 0.05, // sets the strength accessor to the specified number or function
    // // radialRadius: [40],// sets the circle radius to the specified number or function
    // // radialX: 0, // sets the x-coordinate of the circle center to the specified number
    // // radialY: 0, // sets the y-coordinate of the circle center to the specified number
    // // layout event callbacks
    // ready: function(){}, // on layoutready
    // stop: function(){}, // on layoutstop
    // tick: function(progress) {}, // on every iteration
    // // positioning options
    // randomize: false, // use random node positions at beginning of layout
    // // infinite layout options
    // infinite: true // overrides all other options for a forces-all-the-time mode
  }), []);

  const relayout = useDebounceCallback((callback?: () => any) => {
    if (!cyRef.current) return;
    let lay = layoutRef.current;
    if (lay) {
      lay.stop && lay.stop();
      lay.destroy && lay.destroy();
    }
    layoutRef.current = lay = cyRef.current.elements().layout(layout);
    lay.run();
    callback && callback();
  }, 300);

  const [cytoscape, setCytoscape] = useState<any>(null);
  useEffect(() => {
    if (!!rootRef.current) setCytoscape(<CytoscapeComponent
      cy={onLoaded}
      elements={elements}
      layout={layout}
      stylesheet={newStylesheets()}
      panningEnabled={true}
      pan={viewport?.pan}
      zoom={viewport?.zoom}
      style={{ width: '100%', height: '100%' }}
    />);
  }, [onLoaded, newStylesheets]);

  // useEffect(() => {
  //   if (!_cy) return;
  //   // const isActive = _cy.$(`#${f.linkId}`).hasClass('link-node-active');
  //   // if (!isActive && !!f.linkId) {
  //   //   go({ position: 'current', linkId: f.linkId, });
  //   // }
  // }, [f.linkId]);

  const center = useCallback(() => {
    if (!_cy) return;
    // _cy.pan({ x: width / 2, y: height / 2 });
    _cy.pan({ x: 0, y: 0 });
    _cy.zoom(1);
    relayout();
  }, [_cy, width, height]);
  const centeredRef = useRef(false);
  useEffect(() => {
    if (!!_cy && !centeredRef.current) {
      center();
      centeredRef.current = true;
    }
  }, [_cy]);

  const returning = (<>
    <Box position='absolute' left='0' top='0' right='0' bottom='0' ref={rootRef}>
      <Box ref={bgRef}
        position='absolute' left='0' top='0' right='0' bottom='0'
        backgroundImage={`linear-gradient(${line} .1em, transparent .1em), linear-gradient(90deg, ${line} .1em, transparent .1em)`}
        backgroundSize={`3em 3em`}
        backgroundPosition={`0px 0px`}
      ></Box>
      {cytoscape}
      {/* <Box ref={contentRef}
        position='absolute' left='0' top='0'
        transformOrigin='top left'
        pointerEvents='none'
        > */}
        {/* {planet} */}
      {/* </Box> */}
      <VStack
        position='absolute' right='1em' top='1em'
      >
        <Button
          w='3em' h='3em' onClick={() => relayout()}
        >🩼</Button>
        <Button
          w='3em' h='3em' onClick={center}
        ><MdOutlineCenterFocusWeak/></Button>
      </VStack>
    </Box>
  </>);

  const classesRef = useRef<{ [id: string]: { [className: string]: number } }>({});

  return <GraphContext.Provider value={{ cyRef, layout, layoutRef, relayout, style, cy: _cy, classesRef }}>
    {returning}
    {!!_cy && <Box
      ref={overlayRef}
      position='absolute' left='0' top='0'
      transformOrigin='top left'
      pointerEvents='none'
    >{children}</Box>}
  </GraphContext.Provider>
});

export const PlanetButton = memo(({
  isActive,
  icon,
  ...props
}: {
  isActive: boolean;
  icon: any;
  [key:string]: any;
}) => {
  return <Button
    variant={isActive ? 'planetActive' : 'planet'}
    pointerEvents='all' {...props}
  >{icon}</Button>
}, () => true)

export const GraphContext = createContext<any>(null);
export function useGraph() {
  return useContext(GraphContext);
}

export const GraphElementsContext = createContext(undefined);
GraphElementsContext.displayName = 'GraphElementsContext';

const toArray = (classes) => typeof(classes) === 'string' ? classes.split(' ') : (typeof(classes) === 'object' && Array.isArray(classes) ? classes : []);


// Node
let nodesIterator = 1;
export const GraphNode = memo(forwardRef(function GraphNode({
  element,
  ghost = false,
  children = null,
  ...props
}: {
  element?: {
    id: string;
    data: {
      id?: string;
      parent?: string;
      [key: string]: any
    };
    position?: { x?: number; y?: number; };
    classes?: string[];
    locked?: boolean;
    grabbable?: boolean;
  };
  ghost?: boolean;
  children?: any;
  [key: string]: any
}, _ref: any = {}) {
  const ref = _ref || {};
  const { cy, layout, layoutRef, relayout, classesRef } = useContext(GraphContext);
  const go = useGoCore();
  const hgo = useHandlersGo();
  const focused = useContext(ReactHandlersContext);
  const i = useMemo(() => nodesIterator++, []);
  const cls = useMemo(() => `ni-${i}${ghost ? '-ghost' : ''}`, []);
  const parent = useContext(GraphElementsContext);
  
  const id = `${element?.id || element?.data?.id}`;
  if (!id) throw new Error(`GraphNode !props.element.id && !props.element.data.id`);

  // onMount onUnmount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    props?.onMount && props?.onMount(element);
    return () => props?.onUnmount && props?.onUnmount(element);
  }, []);

  // define
  const el = ref.current = useMemo(() => {
    const el = cy.$id(id);
    if (!el.length) {
      const el = cy.add({ group: 'nodes', data: { linkId: go.linkId, id, label: id, parent: (parent && parent.id()) || undefined }, id, classes: [cls] });
      if (ghost) el.emit('ghost');
      relayout();
      console.log('GraphNode define new', i, id, { ghost, el });

      const onClick = (e) => {
        console.log('GraphNode onClick', i, id, e);
        props.onClick && props.onClick(e);
      };
      el.on('click', onClick);
      const onGhost = (e) => {
        console.log('GraphNode onGhost', i, id, e);
        if (e.shiftKey) {
          focused.current.focus(hgo.linkId, hgo, go);
        } else props.onGhost && props.onGhost(e);
      };
      el.on('ghost', onGhost);
      const onUnghost = (e) => {
        console.log('GraphNode onUnghost', i, id, e);
        props.onUnghost && props.onUnghost(e);
      };
      el.on('unghost', onUnghost);

      return el;
    }
    else {
      el.addClass(cls);
      if (!ghost) {
        const classes = el.classes();
        const hasGhost = classes.find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) === 'ghost');
        if (hasGhost) el.emit('unghost');
        console.log('GraphNode define old', i, id, { ghost, hasGhost, el });
      }
      return el;
    }
  }, []);

  // undefine
  useEffect(() => {
    return () => {
      const el = cy.$id(id);
      if (el.length) {
        el.removeClass(cls);
        const classes = el.classes();
        if (!classes.find(c => !!~c.indexOf('ni-'))) {
          el.remove();
          relayout();
          console.log('GraphNode undefine', i, id, { el });
        } else {
          // ghost if not last real
          if (!ghost) {
            const hasGhost = classes.find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) === 'ghost');
            if (hasGhost) {
              el.emit('ghost');
              console.log('GraphNode undefine ghost', i, id, { el, ghost, hasGhost });
            }
          }
        }
      }
    };
  }, []);
  
  // parents
  useEffect(() => {
    if (parent) {
      const el = cy.$id(id);
      el.addClass(`p-${parent.id()}`);
      if (!el.data().parent) el.data({ ...el.data(), parent: parent.id() })
    }
    return () => {
      if (parent) {
        const el = cy.$id(id);
        if (el.length) {
          el.removeClass(`p-${parent.id()}`);
          if (el.data().parent === parent.id()) {
            const other = el.classes().find(c => c.slice(0, 2) === 'p-')
            if (other) el.move(other.slice(2));
          }
        }
      }
    };
  }, []);

  // classes
  const prevClassesRef = useRef([]);
  useEffect(() => {
    const el = cy.$id(id);
    const classes = classesRef.current;
    const prev = prevClassesRef.current;
    const next = element.classes;
    const hasNotGhost = el.classes().find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) !== 'ghost');
    if ((!ghost || (ghost && !hasNotGhost)) && !isEqual(prev, next)) {
      const removed = difference(prev, next);
      const added = difference(next, prev);
      classes[id] = classes[id] || {};
      const toRemove = [];
      const toAdd = [];
      for (let r in removed) {
        classes[id][removed[r]] = (classes[id]?.[removed[r]] || 1) - 1
        if (!classes[id][removed[r]]) toRemove.push(removed[r]);
      }
      for (let a in added) {
        classes[id][added[a]] = (classes[id]?.[added[a]] || 0) + 1;
        if (classes[id][added[a]] === 1) toAdd.push(added[a]);
      }
      console.log('GraphNode classes', i, id, {classes, prev, next, added, removed, toAdd, toRemove});
      if (toRemove.length) el.removeClass(toRemove);
      if (toAdd.length) el.addClass(toAdd);
      prevClassesRef.current = element.classes || [];
    }

    return () => {
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      for (let c in prev) {
        classes[id][prev[c]] = (classes[id][prev[c]] || 1) - 1;
        if (!classes[id][prev[c]]) delete classes[id][prev[c]];
      }
      console.log('GraphNode unclasses', i, id, {classes, prev});
    };
  }, [element.classes]);

  // position
  useEffect(() => {
    const el = cy.$id(id);
    const prev = el.position();
    if (!!element.position && !isEqual(prev, element.position)) {
      el.position(element.position);
      relayout();
      console.log('GraphNode position', i, id, { prev, next: element.position });
    }
  }, [element.position]);

  // locked
  useEffect(() => {
    if (typeof(element.locked) === 'boolean') {
      const el = cy.$id(id);
      const locked = el.locked();
      if (locked != element.locked) el[element.locked ? 'lock' : 'unlock']();
    }
  }, [element.locked]);

  // grabbable
  useEffect(() => {
    if (typeof(element.grabbable) === 'boolean') {
      const el = cy.$id(id);
      const grabbable = el.grabbable();
      if (grabbable != element.grabbable) el[element.grabbable ? 'grabify' : 'ungrabify']();
    }
  }, [element.grabbable]);

  // data
  const prevDataRef = useRef<any>();
  useEffect(() => {
    const prev = prevDataRef.current;
    const next = element.data;
    if (!isEqual(prev, next)) {
      const el = cy.$id(id);
      const hasNotGhost = el.classes().find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) !== 'ghost');
      if (!ghost || (ghost && !hasNotGhost)) {
        console.log('GraphNode data', i, id, { prev, next, now: el.data(), ghost, hasNotGhost });
        el.data(next);
      }
    }
    prevDataRef.current = element.data
  }, [element.data]);

  return <>
    <GraphElementsContext.Provider value={el}>
      {<Box w='0' h='0' position={'absolute'} top={0} left={0} pointerEvents='all'>{<>
        {!!isMounted && children}
      </>}</Box>}
    </GraphElementsContext.Provider>
  </>;
}), (p, n) => isEqual(p, n));


// Edge
let edgesIterator = 1;
export const GraphEdge = memo(function GraphEdge({
  element,
  children = null,
  ...props
}: {
  element?: any;
  children?: any;
  [key: string]: any
}) {
  const { cy, layout, layoutRef, relayout, classesRef } = useContext(GraphContext);
  const go = useGoCore();
  const i = useMemo(() => edgesIterator++, []);
  const cls = useMemo(() => `ei-${i}`, []);
  
  const id = `${element?.id || element?.data?.id}`;
  if (!id) throw new Error(`GraphEdge !props.element.id && !props.element.data.id`);

  // onMount onUnmount
  const [isMounted, setIsMounted] = useState(false);
  const mount = useCallback(() => {
    setIsMounted(true);
  }, []);

  const add = useCallback(() => {
    if (!isMounted) return;
    const elements = [];
    const sourceId = element.data.source;
    const targetId = element.data.target;
    const exists = cy.$(`[source="${sourceId}"][target="${targetId}"]`);
    if (!exists.length) {
      const source = cy.$id(`${sourceId}`);
      const target = cy.$id(`${targetId}`);
      const toAdd = [...elements, { group: 'edges', data: { linkId: go.linkId, source: `${sourceId}`, target: `${targetId}` }, classes: [cls, ...(element.classes || [])] }];
      const el = cy.add(toAdd);

      const onClick = (e) => {
        console.log('GraphEdge onClick', i, id, e);
        props.onClick && props.onClick(e);
      };
      el.on('click', onClick);
    }
  }, [isMounted]);

  // undefine
  useEffect(() => () => {
    const el = cy.$id(`${element.data.id}`);
    console.log('GraphEdge remove', i, id, { element, el });
    cy.remove(`#${element.data.id}`);
  }, []);

  // define redefine
  useEffect(() => {
    const el = cy.$id(`${element.data.id}`);
    if (!!isMounted && (!el.length || (el.data.source != element?.data?.source || el.data.target != element?.data?.target))) {
      if (el.length) {
        cy.remove(`#${element.data.id}`);
        console.log('GraphEdge update', i, id, { element });
      } else {
        console.log('GraphEdge add', i, id, { element });
      }
      add();
      relayout();
    }
  }, [element, isMounted]);

  // classes
  const prevClassesRef = useRef([]);
  useEffect(() => {
    if (!!isMounted) {
      const el = cy.$id(id);
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      const next = element.classes;
      if (!isEqual(prev, next)) {
        const removed = difference(prev, next);
        const added = difference(next, prev);
        classes[id] = classes[id] || {};
        const toRemove = [];
        const toAdd = [];
        for (let r in removed) {
          classes[id][removed[r]] = (classes[id]?.[removed[r]] || 1) - 1
          if (!classes[id][removed[r]]) toRemove.push(removed[r]);
        }
        for (let a in added) {
          classes[id][added[a]] = (classes[id]?.[added[a]] || 0) + 1;
          if (classes[id][added[a]] === 1) toAdd.push(added[a]);
        }
        console.log('GraphEdge classes', i, id, {classes, prev, next, added, removed, toAdd, toRemove});
        if (toRemove.length) el.removeClass(toRemove);
        if (toAdd.length) el.addClass(toAdd);
        prevClassesRef.current = element.classes || [];
      }
    }

    return () => {
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      for (let c in prev) {
        classes[id][prev[c]] = (classes[id][prev[c]] || 1) - 1;
        if (!classes[id][prev[c]]) delete classes[id][prev[c]];
      }
      console.log('GraphEdge unclasses', i, id, {classes, prev});
    };
  }, [element.classes, isMounted]);

  const ghostsRef = useRef(0);
  const ghostMounted = useCallback(() => {
    ghostsRef.current++;
    if (ghostsRef.current == 2) mount();
  }, []);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (isMounted && !mountedRef.current) {
      props?.onMount && props?.onMount(element);
    }
    return () => props?.onUnmount && props?.onUnmount(element);
  }, [isMounted]);


  return <>
    <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.source} onMount={ghostMounted}/>
    <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.target} onMount={ghostMounted}/>
  </>;
}, (p, n) => isEqual(p, n));

// export const GraphNode = memo(function GraphNode({
//   element,
//   children = null,
//   ...props
// }: {
//   element?: any;
//   children?: any;
//   [key: string]: any
// }) {
//   const { cyRef, layout, layoutRef, relayout } = useContext(GraphContext);
//   console.log('GraphNode', element, cyRef.current);
//   const go = useGoCore();
//   const deepLinkNodeBg = useChakraColor('deepLinkNodeBg');
//   const parentElement = useContext(GraphElementsContext);
//   const parentId = typeof(element?.data?.parent) !== 'undefined' ? parentElement?.data?.id : element?.data?.parent;

//   const [isMounted, setIsMounted] = useState(false);
//   useEffect(() => {
//     setIsMounted(true);
//     props?.onMount && props?.onMount(element);
//     return () => {
//       props?.onUnmount && props?.onUnmount(element);
//     };
//   }, []);

//   useMemo(() => {
//     const cy = cyRef.current;
//     const exists = cy.$id(`${element?.data?.id}`);
//     console.log('XXXXXXXX node mount', { element, exists: exists.json() });
//     if (exists.length) {
//       if (!toArray(element?.classes)?.find(c => c === 'link-ghost')) {
//         exists.data(element?.data);
//         if (element.position) exists.position(element.position);
//         if (typeof(element.lock) === 'boolean' && exists.locked() != element.lock) exists[element.lock ? 'lock' : 'unlock']();
//         if (parentId) {
//           if (!exists.hasClass(`link-child-of-${parentId}`)) exists.addClass(`link-child-of-${parentId}`);
//         }
//       }
//     } else {
//       cy.add({
//         group: 'nodes',
//         ...element,
//         data: {
//           linkId: go.linkId,
//           parent: parentId,
//           ...(element.data || {}),
//           id: `${element?.data?.id}`
//         },
//         classes: [
//           ...(toArray(element.classes)),
//           ...(parentId ? [`link-child-of-${parentId}`] : [])
//         ],
//       });
//       if (cy.$id(`${element.data.id}-ghost`).length) {
//         const g = cy.$id(`${element.data.id}-ghost`);
//         if (g.id()) cy.$(`edge[target="${g.id()}"]`).forEach(e => {
//           e.remove();
//           cy.add({ group: 'edges', data: { ...e.data(), target: `${element.data.id}` }, classes: e.classes().join(' ') });
//         });
//         if (g.id()) cy.$(`edge[source="${g.id()}"]`).forEach(e => {
//           e.remove();
//           cy.add({ group: 'edges', data: { ...e.data(), source: `${element.data.id}` }, classes: e.classes().join(' ') });
//         });
//         g.remove();
//       }
//     }
//   }, []);
//   useEffect(() => {
//     const cy = cyRef.current;
//     console.log('XXXXXXXX node update', { element });
//     if (cy.$id(`${element.data.id}`).length) {
//       cy.$id(`${element.data.id}`).data({ linkId: go.linkId, ...element.data });
//       relayout();
//     }
//   }, [element]);
//   useEffect(() => {
//     return () => {
//       const cy = cyRef.current;
//       const targets = cy.$(`edge[target="${element.data.id}"]`);
//       const sources = cy.$(`edge[source="${element.data.id}"]`);
//       console.log('XXXXXXXX node unmount', { element });
//       if (targets.length || sources.length) {
//         const exists = cy.$id(`${element.data.id}`);
//         exists.removeClass(`link-child-of-${parentId}`);
//         if (exists.classes()?.find(c => !!~c.indexOf('link-child-of'))) exists.emit('ghost');
//       } else {
//         cy.remove(`#${element.data.id}`);
//       }
//     };
//   }, []);
//   useEffect(() => {
//     const cy = cyRef.current;
//     const el = cy.$id(element?.data?.id);
//     if (el.length) {
//       const onClick = (e) => props.onClick && props.onClick(e);
//       cy.on('click', onClick);
//       const onGhost = (e) => props.onGhost && props.onGhost(e);
//       cy.on('ghost', onGhost);
//       const onUnghost = (e) => props.onUnghost && props.onUnghost(e);
//       cy.on('unghost', onUnghost);
//       return () => {
//         const cy = cyRef.current;
//         const el = cy.$id(element?.data?.id);
//         if (el.length) {
//           cy.removeListener('click', onClick);
//           cy.removeListener('ghost', onGhost);
//           cy.removeListener('unghost', onUnghost);
//         }
//       };
//     }
//   }, []);

//   const [open, setOpen] = useState(false);
//   return <>
//     <GraphElementsContext.Provider value={element}>
//       {<Box w='0' h='0' position={'absolute'} ref={go.ref} top={0} left={0} pointerEvents='all'>{<>
//         {!!isMounted && children}
//       </>}</Box>}
//     </GraphElementsContext.Provider>
//   </>;

//   return <Box w='0' h='0' position={'absolute'} ref={go.ref} top={0} left={0}>
//     <Planet
//       open={open}
//       orbitRadius={120}
//       mass={3}
//       tension={500}
//       friction={19}
//       centerContent={<Planet
//         open={open}
//         orbitRadius={70}
//         mass={1}
//         tension={500}
//         friction={19}
//         centerContent={
//           <Box position='relative' top='-15px' left='-15px' w='0' h='0'>
//             <Button
//               variant='planet'
//               position='absolute' top='0' left='0'
//               height='30px' width='30px'
//               minWidth={0} p={0}
//               border='1px solid white' borderRadius='50%'
//               bg='transparent'
//               pointerEvents='all'
//               borderColor={deepLinkNodeBg}
//               onClick={() => setOpen(!open)}
//             ></Button>
//           </Box>
//         }
//       >
//         <PlanetButton isActive={!'up'} icon={<UpIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'up', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'in'} icon={<OutIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'out', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'from'} icon={<FromIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'from', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'type'} icon={<TypeIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'type', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'typed'} icon={<TypedIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'typed', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'to'} icon={<ToIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'to', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'out'} icon={<InIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'in', active: !p[fi]?.active }) */}}/>
//         <PlanetButton isActive={!'down'} icon={<DownIcon/>} onClick={() => {/* go({ itemIndex: fi, position: 'down', active: !p[fi]?.active }) */}}/>
//       </Planet>}
//     >
//       {['type', 'typed', 'from', 'out', 'to', 'in', 'up', 'down'].includes('abc') ? [
//         <Button variant='planet' pointerEvents='all'>+31<LuChevronFirst/></Button>,
//         <Button variant='planet' pointerEvents='all'>+8<LuChevronFirst/></Button>,
//         <Button variant='planet' pointerEvents='all'>1<LuChevronFirst/></Button>,
//         <Button variant='planet' pointerEvents='all'><LuChevronLast/>1</Button>,
//         <Button variant='planet' pointerEvents='all'><LuChevronLast/>-8</Button>,
//         <Button variant='planet' pointerEvents='all'><LuChevronLast/>-31</Button>,
//         <Button variant='planet' pointerEvents='all'><IoInfiniteSharp/></Button>,
//       ] : [
//         <Button variant='planet' pointerEvents='all'>🗂️</Button>,
//         <Button variant='planet' pointerEvents='all'>🪬</Button>,
//         <Button variant='planet' pointerEvents='all'>❌</Button>,
//         <Button variant='planet' pointerEvents='all'>👁️</Button>,
//         <Button variant='planet' pointerEvents='all'>🎄</Button>,
//       ]}
//     </Planet>
//   </Box>;
// }, (p, n) => isEqual(p, n));

// export const GraphEdge = memo(function GraphEdge({
//   element,
//   children = null,
// }: {
//   element?: any;
//   children?: any;
// }) {
//   const { cyRef, layout, layoutRef, relayout } = useContext(GraphContext);
//   console.log('GraphEdge', element, cyRef.current);
//   const go = useGoCore();
//   const parentElement = useContext(GraphElementsContext);
//   const parentId = parentElement?.data?.id;

//   const [ghosts, setGhosts] = useState(0);

//   const add = useCallback(() => {
//     if (ghosts >= 2) {
//       const elements = [];
//       const cy = cyRef.current;
//       const sourceId = element.data.source;
//       const targetId = element.data.target;
//       const source = cy.$id(`${sourceId}`);
//       const target = cy.$id(`${targetId}`);
//       console.log('XXXXXXXX edge 1', { sourceId, source, targetId, target });
//       const toAdd = [...elements, { group: 'edges', ...element, data: { linkId: go.linkId, ...(element?.data || {}), source: `${sourceId}`, target: `${targetId}` } }];
//       console.log('XXXXXXXX edge 4', toAdd);
//       cy.add(toAdd);
//     }
//   }, []);
//   useEffect(() => () => {
//     const cy = cyRef.current;
//     console.log('XXXXXXXX edge unmount', { element });
//     cy.remove(`#${element.data.id}`);
//   }, []);
//   useEffect(() => {
//     if (ghosts >= 2) {
//       const cy = cyRef.current;
//       console.log('XXXXXXXX edge update', { element });
//       if (cy.$id(`${element.data.id}`).length) {
//         cy.remove(`#${element.data.id}`);
//       }
//       add();
//       relayout();
//     }
//   }, [element, ghosts]);
  
//   return <>
//     <GraphElementsContext.Provider value={element}>
//       {<>
//         <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.source} onMount={() => setGhosts(g => g+1)}/>
//         <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.target} onMount={() => setGhosts(g => g+1)}/>
//         {children}
//       </>}
//     </GraphElementsContext.Provider>
//   </>;
// }, (p, n) => isEqual(p, n));

let stylesIterator = 1;
export const GraphStyle = memo(function GraphStyle({
  stylesheet,
}: {
  stylesheet?: any;
}) {
  const i = useMemo(() => stylesIterator++, []);
  const { cyRef, layout, layoutRef, relayout, style } = useContext(GraphContext);

  useMemo(() => {
    style(i, stylesheet);
  }, []);
  useEffect(() => () => {
    style(i);
  }, []);
  useEffect(() => {
    style(i, stylesheet);
  }, [stylesheet]);
  return null;
}, (p, n) => isEqual(p, n));