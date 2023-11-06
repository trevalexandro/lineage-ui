import { useParams, useLocation, useNavigate } from "react-router";
import { useGitHubDispatch, useGitHubState } from "../context/github-context";
import LineageGraph from "../components/lineage-graph";
import { Center, Loader, Text, Title, Stack, Modal, Button, useMantineTheme, Notification } from "@mantine/core";
import '../css/pages/lineage.css';
import { useEffect, useState } from "react";
import { LINEAGE_YAML_FILE_NAME, NUM_NODES_PER_PAGE, REPO_FULL_NAME_PREFIX, WINDOW_OPEN_NEW_TAB_IDENTIFIER } from "../const";
import { getFile, isHealthy } from "../services/github-service";
import { HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, GITHUB_CONTEXT_REFRESH_ACTION_NAME } from "../const";
import CustomPagination, { getPaginatedResults } from "../components/custom-pagination";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";



const Lineage = () => {
    const theme = useMantineTheme();
    const state = useGitHubState();
    const params = useParams();
    const location = useLocation();
    const dispatch = useGitHubDispatch();
    const navigate = useNavigate();
    const [opened, handlers] = useDisclosure();
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(!state.dependencies && !location.state);
    const [pageNumber, setPageNumber] = useState(1);
    const [paginatedResults, setPaginatedResults] = useState([]);
    const [healthEndpoint, setHealthEndpoint] = useState(undefined);
    const [gitHubRepositoryLink, setGitHubRepositoryLink] = useState(undefined);
    const [nodeIsHealthy, setNodeIsHealthy] = useState(undefined);
    const [healthEndpointLoading, setHealthEndpointLoading] = useState(false);
    const [nodeName, setNodeName] = useState(undefined);
    
    const useEffectDependencies = [
        state, 
        params, 
        location, 
        dispatch, 
        navigate,
        opened,
        handlers, 
        showNotFoundMessage, 
        setShowNotFoundMessage, 
        isLoading, 
        setIsLoading, 
        pageNumber, 
        setPageNumber,
        paginatedResults,
        setPaginatedResults,
        healthEndpoint,
        setHealthEndpoint,
        gitHubRepositoryLink,
        setGitHubRepositoryLink,
        nodeIsHealthy,
        healthEndpointLoading,
        setHealthEndpointLoading,
        nodeName,
        setNodeName
    ];
    
    useEffect(() => {
        const asyncEffect = async () => {
            // new render
            if (healthEndpoint && healthEndpointLoading) {
                const result = await isHealthy(healthEndpoint);
                setNodeIsHealthy(result);
                setHealthEndpointLoading(false);
                return;
            }

            // state exists after the first render
            if (state.dependencies) {
                return;
            }

            // refresh after the first render
            if (location.state && !state.dependencies) {
                const {dependencies} = location.state;
                dispatch({
                    type: GITHUB_CONTEXT_REFRESH_ACTION_NAME,
                    dependencies
                });
                return;
            }

            // accessing the site externally or traversing from parent graph
            const dependencies = await getFile(`${params.owner}/${params.repoName}`, LINEAGE_YAML_FILE_NAME);
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

    const onNodeClick = async (node) => {
        // TODO: Fix required fields not throwing error
        // TODO: Generic error page
        // TODO: GitHub search
        if (node.data.attributes.githubRepositoryLink && !node.data.attributes.healthEndpoint) {
            const repoFullName = node.data.attributes.githubRepositoryLink.split(REPO_FULL_NAME_PREFIX)[1];
            window.open(`/lineage/${repoFullName}`, WINDOW_OPEN_NEW_TAB_IDENTIFIER);
            return;
        }

        if (node.data.attributes.healthEndpoint) {
            setGitHubRepositoryLink(node.data.attributes.githubRepositoryLink); // could be undefined
            setHealthEndpoint(node.data.attributes.healthEndpoint);
            setHealthEndpointLoading(node.data.attributes.healthEndpoint && !node.data.attributes.githubRepositoryLink);
            handlers.open();
        }
        setNodeName(node.data.name);
    };

    const getHealthCheckButtonColor = () => {
        if (nodeIsHealthy === undefined) {
            return theme.primaryColor;
        }

        return nodeIsHealthy ? 'green' : 'red';
    };

    const getHealthCheckButtonText = () => {
        if (nodeIsHealthy === undefined) {
            return 'Check health';
        }

        return nodeIsHealthy ? 'Healthy' : 'Not healthy';
    };

    const getModal = () => {
        return (
            <Modal opened={opened} onClose={handlers.close}>
                <Stack gap='md'>
                    <Button variant="light" rightSection={getHealthCheckButtonIcon()} color={getHealthCheckButtonColor()} loading={healthEndpointLoading} loaderProps={{type: 'bars'}} onClick={onHealthCheckButtonClick}>
                        {getHealthCheckButtonText()}
                    </Button>
                    {gitHubRepositoryLink &&
                        <Button variant="light" onClick={onDependenciesButtonClick}>
                            {`${nodeName} dependencies`}
                        </Button>
                    }
                </Stack>
            </Modal>
        );
    };

    const getNotification = () => {
        return !gitHubRepositoryLink && !healthEndpoint && nodeName && (
            <Notification icon={<IconAlertTriangle />} color="red">
                This dependency doesn't have a GitHub repository link or health endpoint defined!
            </Notification>
        );
    };

    const getHealthCheckButtonIcon = () => {
        if (nodeIsHealthy === undefined) {
            return;
        }

        return nodeIsHealthy ? <IconCheck /> : <IconAlertTriangle />;
    }

    const onHealthCheckButtonClick = () => {
        if (!healthEndpointLoading) {
            setHealthEndpointLoading(true);
        }
    };

    const onDependenciesButtonClick = () => {
        const repoFullName = gitHubRepositoryLink.split(REPO_FULL_NAME_PREFIX)[1];
        handlers.close();
        window.open(`/lineage/${repoFullName}`, WINDOW_OPEN_NEW_TAB_IDENTIFIER);
    };

    if (isLoading) {
        return (
            <Center>
                <Loader type="bars" />
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
                        That can happen when you follow a link to something that has since been deleted, or the configuration never existed.
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
            <>
                {getNotification()}
                {getModal()}
                <Stack gap='md'>
                    <LineageGraph dependencies={seed} repoName={params.repoName} onNodeClick={onNodeClick} />
                    <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={seed.length} pageCount={NUM_NODES_PER_PAGE} />
                </Stack>
            </>
        );
    }

    return (
        <>
            {getNotification()}
            {getModal()}
            <Stack gap='md'>
                <LineageGraph dependencies={paginatedResults} repoName={params.repoName} onNodeClick={onNodeClick} />
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={paginatedResults.length} pageCount={NUM_NODES_PER_PAGE} />
            </Stack>
        </>
    );
};

export default Lineage;