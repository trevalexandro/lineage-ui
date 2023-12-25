import { useState } from 'react';
import Tree from 'react-d3-tree';
import { NODE_TITLE_MAX_CHARS } from '../const';
// TODO: Fix error when clicking on NPM package node
// TODO: Address multiple versions in NPM API response
const LineageGraph = ({dependencies, rootName, onNodeClick}) => {
    const [hoveringOverNode, setHoveringOverNode] = useState(false);
    const [nodeKey, setNodeKey] = useState(undefined);

    const children = dependencies.map((val, index) => {
        const returnObj = {
            key: index,
            attributes: {},
            ...val
        };

        if (returnObj.name.length > NODE_TITLE_MAX_CHARS) {
            returnObj.name = `${returnObj.name.substring(0, NODE_TITLE_MAX_CHARS - 1)}...`;
        }

        if (!hoveringOverNode || nodeKey !== index) {
            return returnObj;
        }

        returnObj.attributes.name = val.name;
        const {dependencyType} = val;
        returnObj.attributes.dependencyType = dependencyType;
        if (val.version && val.version !== '') {
            returnObj.attributes.version = val.version;
        }
        return returnObj;
    });

    const data = {
        name: rootName,
        dataKey: rootName,
        children
    };

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 3;

    const toggleHoverState = (hovering, key) => {
        if (!hovering && (hoveringOverNode || nodeKey)) {
            setHoveringOverNode(false);
            setNodeKey(undefined);
            return;
        }

        if (hovering) {
            setHoveringOverNode(true);
            setNodeKey(key);
        }
    };

    return (
        <Tree 
            translate={{x, y}} 
            data={data} 
            collapsible={false}
            rootNodeClassName="node__root" 
            branchNodeClassName="node__branch" 
            leafNodeClassName="node__leaf" 
            pathClassFunc={() => 'link'}
            onNodeClick={(node) => onNodeClick(node)}
            onLinkMouseOut={(node) => toggleHoverState(false, node.data.key)}
            onLinkMouseOver={(node) => toggleHoverState(true, node.data.key)}
            onNodeMouseOut={(node) => toggleHoverState(false, node.data.key)}
            onNodeMouseOver={(node) => toggleHoverState(true, node.data.key)}
            orientation='vertical'
        />
    )
};

export default LineageGraph;