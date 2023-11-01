import { Container, Divider, Space, Button, Text, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { getFile } from "../services/github-service";
import { GITHUB_CONTEXT_REFRESH_ACTION_NAME, HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, LINEAGE_YAML_FILE_NAME } from "../const";
import { useNavigate } from "react-router";
import { useGitHubDispatch } from "../context/github-context";
import { IconAlertTriangle } from "@tabler/icons-react";

const Repo = ({repoData}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const dispatch = useGitHubDispatch();

    useEffect(() => {
        const asyncEffect = async () => {
            if (!isLoading) {
                return;
            }
            const repoDetails = repoData.full_name.split('/');
            const dependencies = await getFile(repoDetails[0], repoDetails[1], LINEAGE_YAML_FILE_NAME);
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
                navigate(`/lineage/${repoDetails[0]}/${repoDetails[1]}`, {
                    state: dependencies
                });
            }
        }
        asyncEffect();
    }, [isLoading, repoData, navigate, setShowNotFoundMessage, setIsLoading, dispatch, showNotFoundMessage]);

    const onClick = () => {
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    const getDefaultButton = () => {
        return (
            <Button variant="subtle" loading={isLoading} onClick={onClick}>
                <Text size='xl'>{repoData.name}</Text>
                <Space h='md' />
            </Button>
        );
    };

    if (showNotFoundMessage) {
        return (
            <Container>
                <Divider />
                <Tooltip label="This repo doesn't have a lineage.yaml file!">
                    <Button variant="subtle" rightSection={<IconAlertTriangle />} onClick={(event) => event.preventDefault()} data-disabled>
                        <Text size='xl'>{repoData.name}</Text>
                        <Space h='md' />
                    </Button>
                </Tooltip>
            </Container>
        );
    }

    if (repoData.description && repoData.description !== '') {
        return (
            <Container>
                <Divider />
                <Tooltip label={repoData.description}>
                    {getDefaultButton()}
                </Tooltip>
            </Container>
        );
    }

    return (
        <Container>
            <Divider />
            {getDefaultButton()}
        </Container>
    );
};

export default Repo;