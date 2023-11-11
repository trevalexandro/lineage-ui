import { Container, Divider, Space, Button, Text, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { getFile } from "../services/github-service";
import { GITHUB_CONTEXT_REFRESH_ACTION_NAME, HTTP_BAD_REQUEST_STATUS_CODE, HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, LINEAGE_YAML_FILE_NAME } from "../const";
import { useNavigate } from "react-router";
import { useGitHubDispatch } from "../context/github-context";
import { IconAlertTriangle } from "@tabler/icons-react";

const Repo = ({repoData}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const dispatch = useGitHubDispatch();

    const loaderProps = {
        type: 'bars'
    };

    const useEffectDependencies = [
        isLoading, 
        repoData, 
        navigate, 
        setShowErrorMessage, 
        setIsLoading, 
        dispatch, 
        showErrorMessage, 
        errorMessage, 
        setErrorMessage, 
        loaderProps
    ];

    useEffect(() => {
        const asyncEffect = async () => {
            if (!isLoading) {
                return;
            }
            const dependencies = await getFile(repoData.full_name, LINEAGE_YAML_FILE_NAME);
            if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
                navigate('/');
                return;
            }

            if (dependencies.status && dependencies.status === HTTP_BAD_REQUEST_STATUS_CODE) {
                console.log('bad request');
                return setErrorState("The lineage.yaml file for this repo doesn't have a \"Dependencies\" field!");
            }            
            
            if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
                return setErrorState("This repo doesn't have a lineage.yaml file!");
            }

            dispatch({
                type: GITHUB_CONTEXT_REFRESH_ACTION_NAME,
                dependencies
            });
            navigate(`/lineage/${repoData.full_name}`, {
                state: dependencies
            });
        }
        asyncEffect();
    }, useEffectDependencies);

    const setErrorState = (errorMessage) => {
        setShowErrorMessage(true);
        setErrorMessage(errorMessage);
        setIsLoading(false);
        return;
    }
    
    const onClick = () => {
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    const getDefaultButton = () => {
        return (
            <Button variant="subtle" loading={isLoading} onClick={onClick} loaderProps={loaderProps}>
                <Text size='xl'>{repoData.full_name}</Text>
                <Space h='md' />
            </Button>
        );
    };

    if (showErrorMessage) {
        return (
            <Container>
                <Divider />
                <Tooltip label={errorMessage}>
                    <Button variant="subtle" rightSection={<IconAlertTriangle />} onClick={(event) => event.preventDefault()} data-disabled>
                        <Text size='xl'>{repoData.full_name}</Text>
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