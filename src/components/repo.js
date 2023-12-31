import { Container, Divider, Space, Button, Text, Tooltip, Modal, Stack } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { getFile } from "../services/github-service";
import { DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME, HTTP_BAD_REQUEST_STATUS_CODE, HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, LINEAGE_YAML_FILE_NAME, PACKAGE_JSON_FILE_NAME } from "../const";
import { useNavigate } from "react-router";
import { useDependencyDispatch } from "../context/dependency-context";
import { IconAlertTriangle, IconBinaryTree2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const Repo = ({repoData}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [opened, handlers] = useDisclosure();
    const dispatch = useDependencyDispatch();

    const loaderProps = {
        type: 'bars'
    };

    const navigateToLineagePage = useCallback((dependencies) => {
        const newState = {};
        newState.dependencies = dependencies.packages ?? dependencies.dependencies;

        dispatch({
            type: DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME,
            dependencies: newState
        });
        navigate(`/lineage/${repoData.full_name}`, {
            state: newState
        });
    }, [repoData.full_name, dispatch, navigate]);

    useEffect(() => {
        const asyncEffect = async () => {
            let fileShouldExist = false;

            if (!isLoading) {
                return;
            }
            const lineageYamlDependencies = await getFile(repoData.full_name, LINEAGE_YAML_FILE_NAME);
            if (lineageYamlDependencies.status && lineageYamlDependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
                navigate('/');
                return;
            }

            if (lineageYamlDependencies.status && lineageYamlDependencies.status === HTTP_BAD_REQUEST_STATUS_CODE) {
                return setErrorState("The lineage.yaml file for this repo doesn't have a \"Dependencies\" field!");
            }            
            
            const packageJsonDependencies = await getFile(repoData.full_name, PACKAGE_JSON_FILE_NAME, !lineageYamlDependencies.status);
            if (packageJsonDependencies?.status && packageJsonDependencies?.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
                navigate('/');
                return;
            }

            if (!lineageYamlDependencies.status || lineageYamlDependencies.status !== HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
                fileShouldExist = true;
            }

            if (!packageJsonDependencies?.status || packageJsonDependencies?.status !== HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
                fileShouldExist = true;
            }

            if (!fileShouldExist) {
                return setErrorState("This repo doesn't have a lineage.yaml or package.json file!");
            }

            if (!lineageYamlDependencies.status && !packageJsonDependencies?.status) {
                return handlers.open();
            }

            const finalDependencies = lineageYamlDependencies.status ? packageJsonDependencies : lineageYamlDependencies;
            navigateToLineagePage(finalDependencies);
        }
        asyncEffect();
    }, [
        isLoading, 
        repoData.full_name, 
        navigate, 
        setShowErrorMessage, 
        setIsLoading, 
        dispatch, 
        showErrorMessage, 
        errorMessage, 
        setErrorMessage,
        opened,
        handlers,
        navigateToLineagePage
    ]);

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

    const onModalButtonClick = async (fileName) => {
        const dependencies = await getFile(repoData.full_name, fileName);

        if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
            navigate('/');
            return;
        }
        if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
            handlers.close();
            setErrorState("This file doesn't exist anymore! Did you just delete it?");
            return;
        }

        navigateToLineagePage(dependencies);
    };

    const onModalClose = () => {
        setIsLoading(false);
        handlers.close();
    };

    const getModal = () => {
        return (
            <Modal opened={opened} onClose={onModalClose}>
                <Stack gap='md'>
                    <Tooltip label={LINEAGE_YAML_FILE_NAME}>
                        <Button variant="light" rightSection={<IconBinaryTree2 />} onClick={() => onModalButtonClick(LINEAGE_YAML_FILE_NAME)}>
                            Custom dependencies
                        </Button>
                    </Tooltip>
                    <Tooltip label={PACKAGE_JSON_FILE_NAME}>
                        <Button variant="light" onClick={() => onModalButtonClick(PACKAGE_JSON_FILE_NAME)} rightSection={<IconBinaryTree2 />}>
                            NPM dependencies
                        </Button>
                    </Tooltip>
                </Stack>
            </Modal>
        );
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
                {getModal()}
                <Divider />
                <Tooltip label={repoData.description}>
                    {getDefaultButton()}
                </Tooltip>
            </Container>
        );
    }

    return (
        <Container>
            {getModal()}
            <Divider />
            {getDefaultButton()}
        </Container>
    );
};

export default Repo;