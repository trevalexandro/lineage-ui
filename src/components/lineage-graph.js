import { useState } from 'react';
import Tree from 'react-d3-tree';

const LineageGraph = ({dependencies, repoName, onNodeClick}) => {
    const [hoveringOverNode, setHoveringOverNode] = useState(false);
    const [nodeKey, setNodeKey] = useState(undefined);

    const children = dependencies.map((val, index) => {
        const attributes = {};
        if (hoveringOverNode && nodeKey === index) {
            const {dependencyType} = val;
            attributes.dependencyType = dependencyType;
        }
        return {
            key: index,
            attributes,
            ...val
        };
    });

    const data = {
        name: repoName,
        children
    }

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