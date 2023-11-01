import Tree from 'react-d3-tree';

const LineageGraph = ({dependencies, repoName}) => {
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
    // TODO: Pagination
    // TODO: Make node green if health check endpoint present & successful, make node red if health check endpoint present & fail (tooltip)
    return (
        <Tree 
            translate={{x, y}} 
            data={data} 
            rootNodeClassName="node__root" 
            branchNodeClassName="node__branch" 
            leafNodeClassName="node__leaf" 
            pathClassFunc={() => 'link'}/>
    )
};

export default LineageGraph;