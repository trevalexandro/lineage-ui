import { useState } from 'react';
import Tree from 'react-d3-tree';
import { NODE_TITLE_MAX_CHARS } from '../const';

const LineageGraph = ({dependencies, rootName, onNodeClick}) => {
    const [hoveringOverNode, setHoveringOverNode] = useState(false);
    const [nodeKey, setNodeKey] = useState(undefined);

    const placeNode = (nodeObj, tree) => {
        const aggregatePackage = tree.find(val => val.fullName === nodeObj.fullName || val.key === nodeObj.fullName);
        
        if (!aggregatePackage) {
            tree.push(nodeObj);
            return tree;
        }

        if (!aggregatePackage.children) {
            const parentNode = {
                name: aggregatePackage.name,
                key: aggregatePackage.fullName,
                parentNode: true
            };
            parentNode.children = [];
            parentNode.children.push(aggregatePackage);
            parentNode.children.push(nodeObj);
            tree.push(parentNode);
            return tree.filter(val => val?.fullName !== nodeObj.fullName);
        } 

        aggregatePackage.children.push(nodeObj);
        return tree;
    };

    const children = dependencies.reduce((prev, curr, currIndex) => {
        const newObj = {
            key: currIndex,
            attributes: {},
            fullName: curr.name,
            ...curr
        };

        if (newObj.name.length > NODE_TITLE_MAX_CHARS) {
            newObj.name = `${newObj.name.substring(0, NODE_TITLE_MAX_CHARS - 1)}...`;
        }

        if (!hoveringOverNode || nodeKey !== currIndex) {
            return placeNode(newObj, prev);
        }

        newObj.attributes.name = curr.name;
        const {dependencyType} = curr;
        newObj.attributes.dependencyType = dependencyType;
        if (curr.version && curr.version !== '') {
            newObj.attributes.version = curr.version;
        }
        return placeNode(newObj, prev);
    }, []);

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