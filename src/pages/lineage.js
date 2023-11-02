import { useParams, useLocation, useNavigate } from "react-router";
import { useGitHubDispatch, useGitHubState } from "../context/github-context";
import LineageGraph from "../components/lineage-graph";
import { Center, Loader, Text, Title, Stack } from "@mantine/core";
import '../css/pages/lineage.css';
import { useEffect, useState } from "react";
import { LINEAGE_YAML_FILE_NAME, NUM_NODES_PER_PAGE } from "../const";
import { getFile } from "../services/github-service";
import { HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, GITHUB_CONTEXT_REFRESH_ACTION_NAME } from "../const";
import CustomPagination, { getPaginatedResults } from "../components/custom-pagination";



const Lineage = () => {
    const state = useGitHubState();
    const params = useParams();
    const location = useLocation();
    const dispatch = useGitHubDispatch();
    const navigate = useNavigate();
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(!state.dependencies && !location.state);
    const [pageNumber, setPageNumber] = useState(1);
    const [paginatedResults, setPaginatedResults] = useState([]);
    const [showModalMenu, setShowModalMenu] = useState(false);

    const useEffectDependencies = [
        state, 
        params, 
        location, 
        dispatch, 
        navigate, 
        showNotFoundMessage, 
        setShowNotFoundMessage, 
        isLoading, 
        setIsLoading, 
        pageNumber, 
        setPageNumber,
        paginatedResults,
        setPaginatedResults,
        showModalMenu,
        setShowModalMenu
    ];
    
    useEffect(() => {
        const asyncEffect = async () => {
            if (state.dependencies) {
                return;
            }

            if (location.state && !state.dependencies) {
                const {dependencies} = location.state;
                dispatch({
                    type: GITHUB_CONTEXT_REFRESH_ACTION_NAME,
                    dependencies
                });
                return;
            }

            const dependencies = await getFile(params.owner, params.repoName, LINEAGE_YAML_FILE_NAME);
            if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
                navigate('/');
            }

            if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
                setShowNotFoundMessage(true);
                setIsLoading(false);
            } else {
                dispatch({
                    type: GITHUB_CONTEXT_REFRESH_ACTION_NAME,
                    dependencies
                });
                window.history.replaceState(dependencies);
                setIsLoading(false);
            }
        };
        asyncEffect();
    }, useEffectDependencies);

    const onPaginationClick = (nextPage) => {
        const newPageNumber = nextPage ? pageNumber + 1 : pageNumber - 1;
        const newNodes = getPaginatedResults(newPageNumber, NUM_NODES_PER_PAGE, state.dependencies);
        
        setPageNumber(newPageNumber);
        setPaginatedResults(newNodes);
    };

    const onNodeClick = (node) => {
        // TODO: Define logic for showing modal.
        if (node.data.attributes.healthEndpoint) {
            setShowModalMenu(true);
            return;
        }
        // TODO: Read new file
    };

    if (isLoading) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

    if (showNotFoundMessage) {
        return (
            <Center>
                <Stack align="center" gap='md'>
                    <Title>
                        404
                    </Title>
                    <Text size="xl">
                        I'm afraid the YAML configuration for this repo doesn't exist.
                    </Text>
                    <Text size="xl">
                        That can happen when you follow a link to something that has since been deleted, or the link was incorrect to begin with.
                    </Text>
                    <Text size="xl">
                        Sorry about that.
                    </Text>
                </Stack>
            </Center>
        );
    }

    if (paginatedResults.length === 0) {
        const dependencies = state.dependencies ?? location.state.dependencies;
        const seed = getPaginatedResults(pageNumber, NUM_NODES_PER_PAGE, dependencies);
        return (
            <Stack gap='md'>
                <LineageGraph dependencies={seed} repoName={params.repoName} />
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={seed.length} pageCount={NUM_NODES_PER_PAGE} />
            </Stack>
        );
    }
    
    return (
        <Stack gap='md'>
            <LineageGraph dependencies={paginatedResults} repoName={params.repoName} onNodeClick={onNodeClick} showModalMenu={showModalMenu} />
            <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={paginatedResults.length} pageCount={NUM_NODES_PER_PAGE} />
        </Stack>
    );
};

export default Lineage;