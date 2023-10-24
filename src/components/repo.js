import { Container, Divider, Space, Button, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { getFile } from "../services/github-service";
import { HTTP_NOT_FOUND_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE } from "../const";
import { useNavigate } from "react-router";

const Repo = ({repoData}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    useEffect(async () => {
        if (!isLoading) {
            return; // TODO: Can I return here?
        }
        const repoDetails = repoData.full_name.split('/');
        const dependencies = await getFile(repoDetails[0], repoDetails[1], 'lineage.yaml');
        if (dependencies.status && dependencies.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
            navigate('/');
        }
        
        if (dependencies.status && dependencies.status === HTTP_NOT_FOUND_RESPONSE_STATUS_CODE) {
            setShowNotFoundMessage(true);
        } else {
            navigate('/lineage', {
                state: dependencies
            });
        }
        // TODO: Finish effect
    })

    const onClick = async () => {
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    return (
        <Container>
            <Divider />
            <Button variant="subtle" loading={isLoading} onClick={onClick}>
                <Text size='xl'>{repoData.name}</Text>
                <Space h='md' />
            </Button>
        </Container>
    );
};

export default Repo;