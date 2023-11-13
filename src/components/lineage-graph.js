import Tree from 'react-d3-tree';

const LineageGraph = ({dependencies, repoName, onNodeClick}) => {
    const children = dependencies.map(val => {
        const {dependencyType} = val;
        return {
            attributes: {
                dependencyType
            },
            ...val
        };
    });

    const data = {
        name: repoName,
        children
    }

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 3;

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
            orientation='vertical'
        />
    )
};

export default LineageGraph;