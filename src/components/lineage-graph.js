import Tree from 'react-d3-tree';

const LineageGraph = ({dependencies, repoName, onNodeClick}) => {
    const children = dependencies.map(val => {
        const {name} = val;
        const copy = structuredClone(val);
        delete copy.name;
        return {
            name,
            attributes: copy
        };
    });

    const data = {
        name: repoName,
        children
    }

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

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
        />
    )
};

export default LineageGraph;