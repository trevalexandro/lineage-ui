import { useParams, useLocation, useNavigate } from "react-router";
import { useGitHubDispatch, useGitHubState } from "../context/github-context";
import LineageGraph from "../components/lineage-graph";
import { Center, Loader, Text, Title, Stack, Modal, Button, useMantineTheme, Tooltip, Anchor } from "@mantine/core";
import '../css/pages/lineage.css';
import { useEffect, useState } from "react";
import { HTTP_BAD_REQUEST_STATUS_CODE, LINEAGE_YAML_FILE_NAME, NUM_NODES_PER_PAGE, REPO_FULL_NAME_PREFIX } from "../const";
import { getFile, isHealthy } from "../services/github-service";
import { HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, GITHUB_CONTEXT_REFRESH_ACTION_NAME } from "../const";
import CustomPagination, { getPaginatedResults } from "../components/custom-pagination";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconBinaryTree2, IconCheck, IconHeartbeat } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import HamburgerMenu from "../components/hamburger-menu";



const Lineage = () => {
    const theme = useMantineTheme();
    const state = useGitHubState();
    const params = useParams();
    const location = useLocation();
    const dispatch = useGitHubDispatch();
    const navigate = useNavigate();
    const [opened, handlers] = useDisclosure();
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const [showBadRequestMessage, setShowBadRequestMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(!state.dependencies && !location.state);
    const [pageNumber, setPageNumber] = useState(1);
    const [paginatedResults, setPaginatedResults] = useState([]);
    const [healthEndpoint, setHealthEndpoint] = useState(undefined);
    const [gitHubRepositoryLink, setGitHubRepositoryLink] = useState(undefined);
    const [nodeIsHealthy, setNodeIsHealthy] = useState(undefined);
    const [healthEndpointLoading, setHealthEndpointLoading] = useState(false);
    const [nodeName, setNodeName] = useState(undefined);

    const graphStyling = {
        root: { 
            height: 'inherit' 
        } 
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
                return;
            }

            if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
                setShowNotFoundMessage(true);
                setIsLoading(false);
                return;
            }

            if (dependencies.status && dependencies.status === HTTP_BAD_REQUEST_STATUS_CODE) {
                setShowBadRequestMessage(true);
                setIsLoading(false);
                return;
            }

            dispatch({
                type: GITHUB_CONTEXT_REFRESH_ACTION_NAME,
                dependencies
            });
            window.history.replaceState(dependencies);
            setIsLoading(false);
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
        showNotFoundMessage, 
        setShowNotFoundMessage,
        showBadRequestMessage,
        setShowBadRequestMessage, 
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
    ]);

    const onPaginationClick = (nextPage) => {
        const newPageNumber = nextPage ? pageNumber + 1 : pageNumber - 1;
        const newNodes = getPaginatedResults(newPageNumber, NUM_NODES_PER_PAGE, state.dependencies);
        
        setPageNumber(newPageNumber);
        setPaginatedResults(newNodes);
    };

    const onNodeClick = async (node) => {
        // TODO: Documentation
        if (!node.data.githubRepositoryLink && !node.data.healthEndpoint) {
            notifications.show({
                title: "Node notification",
                message: "This dependency doesn't have a GitHub repository link or health endpoint defined!"
            });
        }

        if (node.data.githubRepositoryLink && !node.data.healthEndpoint) {
            const repoFullName = node.data.githubRepositoryLink.split(REPO_FULL_NAME_PREFIX)[1];
            window.open(`/lineage/${repoFullName}`, '_blank');
            return;
        }

        if (node.data.healthEndpoint) {
            setGitHubRepositoryLink(node.data.githubRepositoryLink); // could be undefined
            setHealthEndpoint(node.data.healthEndpoint);
            setHealthEndpointLoading(node.data.healthEndpoint && !node.data.githubRepositoryLink);
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
                        <Button variant="light" rightSection={getHealthCheckButtonIcon()} color={getHealthCheckButtonColor()} loading={healthEndpointLoading} loaderProps={{type: 'bars'}} onClick={onHealthCheckButtonClick}>
                            {getHealthCheckButtonText()}
                        </Button>
                    </Tooltip>
                    {gitHubRepositoryLink &&
                        <Tooltip label={gitHubRepositoryLink}>
                            <Button variant="light" onClick={onDependenciesButtonClick} rightSection={<IconBinaryTree2 />}>
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

    const onDependenciesButtonClick = () => {
        const repoFullName = gitHubRepositoryLink.split(REPO_FULL_NAME_PREFIX)[1];
        handlers.close();
        window.open(`/lineage/${repoFullName}`, '_blank');
    };

    if (isLoading) {
        return (
            <Center>
                <Loader type="bars" />
            </Center>
        );
    }

    if (showBadRequestMessage) {
        return (
            <>
                <HamburgerMenu />
                <Center>
                    <Stack align='center' gap='md'>
                        <Title>
                            400
                        </Title>
                        <Text size='xl'>
                            I'm afraid the YAML configuration for this repo doesn't contain the right structure.
                        </Text>
                        <Text size='xl'>
                            That can happen when the configuration is empty, or the "Dependencies" field is misspelled.
                        </Text>
                        <Text size='xl'>
                            You can find more documentation on the structure with the link below.
                        </Text>
                        <Anchor href={process.env.REACT_APP_DOCUMENTATION_URL} target="_blank">
                            Lineage GitHub
                        </Anchor>
                    </Stack>
                </Center>
            </>
        );
    }

    if (showNotFoundMessage) {
        return (
            <>
                <HamburgerMenu />
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
                    <LineageGraph dependencies={seed} repoName={params.repoName} onNodeClick={onNodeClick} />
                    <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={dependencies.length} pageCount={NUM_NODES_PER_PAGE} />
                </Stack>
            </>
        );
    }

    return (
        <>
            <HamburgerMenu />
            {getModal()}
            <Stack gap='md' styles={graphStyling}>
                <LineageGraph dependencies={paginatedResults} repoName={params.repoName} onNodeClick={onNodeClick} />
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} totalCount={state.dependencies.length} pageCount={NUM_NODES_PER_PAGE} />
            </Stack>
        </>
    );
};

export default Lineage;