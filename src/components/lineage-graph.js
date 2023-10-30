

const LineageGraph = ({dependencies, repoName, repoDescription = null}) => {
    const data = {
        name: repoName,
        repoDescription,
        children: dependencies
    }

    return (
        <h1>Hello World!</h1>
    );
};

export default LineageGraph;