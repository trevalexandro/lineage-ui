import { useDependencies } from "../context/github-context";


const LineageDiagram = () => {
    const dependencies = useDependencies();

    return (
        <h1>Hello World!</h1>
    );
};

export default LineageDiagram;