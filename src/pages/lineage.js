import { useParams, useLocation, useNavigate } from "react-router";
import { useDependencyDispatch, useDependencyState } from "../context/dependency-context";
import LineageGraph from "../components/lineage-graph";
import { Stack, Modal, Button, useMantineTheme, Tooltip, Center, Loader, Title, Text } from "@mantine/core";
import '../css/pages/lineage.css';
import { useEffect, useState } from "react";
import { LINEAGE_YAML_FILE_NAME, NUM_NODES_PER_PAGE, REPO_FULL_NAME_PREFIX, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, HTTP_NOT_FOUND_RESPONSE_STATUS_CODE } from "../const";
import { getFile, isHealthy } from "../services/github-service";
import { DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME } from "../const";
import CustomPagination, { getPaginatedResults } from "../components/custom-pagination";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconBinaryTree2, IconCheck, IconHeartbeat } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import HamburgerMenu from "../components/hamburger-menu";
import { getPackages } from "../services/npm-service";

const Lineage = () => {
    const theme = useMantineTheme();
    const state = useDependencyState();
    const params = useParams();
    const location = useLocation();
    const dispatch = useDependencyDispatch();
    const navigate = useNavigate();
    const [opened, handlers] = useDisclosure();
    const [pageNumber, setPageNumber] = useState(1);
    const [paginatedResults, setPaginatedResults] = useState([]);
    const [healthEndpoint, setHealthEndpoint] = useState(undefined);
    const [gitHubRepositoryLink, setGitHubRepositoryLink] = useState(undefined);
    const [nodeIsHealthy, setNodeIsHealthy] = useState(undefined);
    const [healthEndpointLoading, setHealthEndpointLoading] = useState(false);
    const [nodeName, setNodeName] = useState(undefined);
    const [rootNodeName, setRootNodeName] = useState(undefined);
    const [gitHubRepositoryName, setGitHubRepositoryName] = useState(undefined);
    const [dependenciesLoading, setDependenciesLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);

    const graphStyling = {
        root: { 
            height: 'inherit' 
        } 
    };

    const loaderProps = {
        type: 'bars'
    };
    
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
                dispatch({
                    type: DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME,
                    dependencies: location.state
                });
                setPageNumber(1);
                setPaginatedResults(getPaginatedResults(1, NUM_NODES_PER_PAGE, location.state.dependencies));
                return;
            }
        };
        asyncEffect();
    }, [
        state.dependencies, 
        params.owner,
        params.repoName, 
        location.state, 
        dispatch, 
        navigate,
        opened,
        handlers, 
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
        setNodeName,
        rootNodeName,
        setRootNodeName,
        gitHubRepositoryName,
        setGitHubRepositoryName,
        dependenciesLoading,
        setDependenciesLoading,
        showErrorMessage,
        setShowErrorMessage,
        errorMessage,
        setErrorMessage
    ]);

    const onPaginationClick = (nextPage) => {
        const newPageNumber = nextPage ? pageNumber + 1 : pageNumber - 1;
        const newNodes = getPaginatedResults(newPageNumber, NUM_NODES_PER_PAGE, state.dependencies);
        
        setPageNumber(newPageNumber);
        setPaginatedResults(newNodes);
    };

    const getGitHubDependencies = async (node = undefined) => {
        setDependenciesLoading(true);
        const repoLink = node?.data?.githubRepositoryLink ?? gitHubRepositoryLink;
        const repoFullName = repoLink.split(REPO_FULL_NAME_PREFIX)[1];
        const repoName = node?.data?.name ?? gitHubRepositoryName;
        const dependencies = await getFile(repoFullName, LINEAGE_YAML_FILE_NAME);
            
        if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
            navigate('/');
            return;
        }
        if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
            setShowErrorMessage(true);
            setErrorMessage("This repo doesn't have a lineage.yaml file!");
            setDependenciesLoading(false);
            return;
        }

        dispatch({
            type: DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME,
            dependencies: dependencies
        });
        setRootNodeName(repoName);
        setDependenciesLoading(false);
        handlers.close();
    };

    const getNpmDependencies = async (node) => {
        setDependenciesLoading(true);
        const dependencies = await getPackages(node.data.fullName, node.data.version);
        const updatedState = {};
        
        if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
            navigate('/');
            return;
        }

        if (!dependencies.status && (dependencies.packages === null || dependencies.packages === undefined)) {
            notifications.show({
                title: "Node notification",
                message: "This NPM dependency doesn't have any child nodes."
            });
            setDependenciesLoading(false);
            return;
        }

        updatedState.dependencies = dependencies.packages;
        dispatch({
            type: DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME,
            dependencies: updatedState
        });

        setRootNodeName(node.data.fullName);
        setDependenciesLoading(false);
        setNodeName(node.data.name);
        setPageNumber(1);
        setPaginatedResults(getPaginatedResults(1, NUM_NODES_PER_PAGE, updatedState.dependencies));
    };

    const onNodeClick = async (node) => {
        if (node.data.parentNode) {
            return;
        }

        if (node.data.version) {
            await getNpmDependencies(node);
            return;
        }

        if (!node.data.githubRepositoryLink && !node.data.healthEndpoint) {
            notifications.show({
                title: "Node notification",
                message: "This dependency doesn't have a GitHub repository link or health endpoint defined!"
            });
        }

        if (node.data.githubRepositoryLink && !node.data.healthEndpoint) {
            await getGitHubDependencies(node);
            return;
        }

        if (node.data.healthEndpoint) {
            setGitHubRepositoryLink(node.data.githubRepositoryLink); // could this be undefined?
            setHealthEndpoint(node.data.healthEndpoint);
            setHealthEndpointLoading(node.data.healthEndpoint && !node.data.githubRepositoryLink);
            setGitHubRepositoryName(node.data.name);
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
                    <Tooltip label={healthEndpoint}>
                        <Button variant="light" rightSection={getHealthCheckButtonIcon()} color={getHealthCheckButtonColor()} loading={healthEndpointLoading} loaderProps={loaderProps} onClick={onHealthCheckButtonClick}>
                            {getHealthCheckButtonText()}
                        </Button>
                    </Tooltip>
                    {gitHubRepositoryLink && !showErrorMessage &&
                        <Tooltip label={gitHubRepositoryLink}>
                            <Button variant="light" onClick={onDependenciesButtonClick} rightSection={<IconBinaryTree2 />} loading={dependenciesLoading} loaderProps={loaderProps}>
                                {`${nodeName} dependencies`}
                            </Button>
                        </Tooltip>
                    }
                    {gitHubRepositoryLink && showErrorMessage &&
                        <Tooltip label={errorMessage}>
                            <Button variant="subtle" rightSection={<IconAlertTriangle />} color="red">
                                {`${nodeName} dependencies`}
                            </Button>
                        </Tooltip>
                    }
                </Stack>
            </Modal>
        );
    };

    const getHealthCheckButtonIcon = () => {
        if (nodeIsHealthy === undefined) {
            return <IconHeartbeat />;
        }

        return nodeIsHealthy ? <IconCheck /> : <IconAlertTriangle />;
    }

    const onHealthCheckButtonClick = () => {
        if (!healthEndpointLoading) {
            setHealthEndpointLoading(true);
        }
    };

    const onDependenciesButtonClick = async () => {
        await getGitHubDependencies();
    };

    if (!state.dependencies && !location.state) { // someone accessing the app externally
        const accessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
        if (accessToken && accessToken !== '') {
            navigate('/repos');
        } else {
            navigate('/');
        }
    }

    if (showErrorMessage) {
        return (
            <>
                <HamburgerMenu />
                <Center>
                    <Stack align="center" gap='md'>
                        <Title>
                            404
                        </Title>
                        <Text size="xl">
                            I'm afraid the YAML configuration for the specified repo doesn't exist.
                        </Text>
                        <Text size="xl">
                            Maybe your GitHub repo link is incorrect?
                        </Text>
                        <Text size='xl'>
                            Maybe your configuration somehow got deleted before navigating here? Assuming it already existed.
                        </Text>
                        <Text size="xl">
                            Regardless, sorry about that.
                        </Text>
                    </Stack>
                </Center>  
            </>
        );
    }

    if (paginatedResults.length === 0) {
        const dependencies = state.dependencies ?? location.state.dependencies;
        const seed = getPaginatedResults(pageNumber, NUM_NODES_PER_PAGE, dependencies);
        return (
            <>
                <HamburgerMenu />
                {getModal()}
                <Stack gap='md' styles={graphStyling}>
                    <LineageGraph dependencies={seed} rootName={rootNodeName ?? params.repoName} onNodeClick={onNodeClick} />
                    <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={dependencies.length} pageCount={NUM_NODES_PER_PAGE} />
                </Stack>
            </>
        );
    }

    if (dependenciesLoading && !opened) {
        return (
            <>
                <Center>
                    <Loader type="bars" />
                </Center>
            </>
        );
    }

    return (
        <>
            <HamburgerMenu />
            {getModal()}
            <Stack gap='md' styles={graphStyling}>
                <LineageGraph dependencies={paginatedResults} rootName={rootNodeName ?? params.repoName} onNodeClick={onNodeClick} />
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={state.dependencies.length} pageCount={NUM_NODES_PER_PAGE} />
            </Stack>
        </>
    );
};

export default Lineage;