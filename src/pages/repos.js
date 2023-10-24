import {useLoaderData, useNavigate} from 'react-router-dom';
import { getRepos, searchRepos } from '../services/github-service';
import { Text, Center, Stack } from '@mantine/core';
import Search from '../components/search';
import { useState } from 'react';
import Repo from '../components/repo';
import CustomPagination from '../components/custom-pagination';
import { HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE, NUM_REPOS_PER_PAGE } from '../const';


const Repos = () => {
    const initialRepos = useLoaderData();
    const navigate = useNavigate();
    const [currentRepos, setCurrentRepos] = useState(initialRepos);
    const [pageNumber, setPageNumber] = useState(1);

    const checkResult = (repos) => {
        if (repos.status && repos.status === HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE) {
            navigate('/');
        }
    }

    const onSearchClick = async (searchTerm) => {
        /*const searchResults = await searchRepos(1, searchTerm);
        setCurrentRepos(async () => searchResults.items);*/
    };

    const onPaginationClick = async (nextPage) => {
        const newPageNumber = nextPage ? pageNumber + 1 : pageNumber - 1;
        const newRepos = await getRepos(newPageNumber, NUM_REPOS_PER_PAGE);
        
        setPageNumber(newPageNumber);
        setCurrentRepos(newRepos);
    };

    const getRepoComponents = () => {
        return currentRepos.map(repo => <Repo key={repo.id} repoData={repo} />);
    };

    checkResult(currentRepos);

    if (currentRepos.length === 0) {
        return (
            <Stack gap='xl'>
                <Search label='Search all of GitHub' placeholder='foobar in:name' onClick={onSearchClick} />
                <Stack gap='md' align='center'>
                    <Text size='xl'>No repos found</Text>
                    <Text size='md'>- Make sure there's at least one repo that you're a user of OR</Text>
                    <Text size='md'>- Make sure your search criteria would solicit a result OR</Text>
                    <Text size='md'>- Make sure you haven't gone past the last page of results</Text>
                </Stack>
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} />
            </Stack>
        );
    }    

    return (
        <Stack gap='xl'>
            <Search label='Search all of GitHub' placeholder='foobar in:name' onClick={onSearchClick} />
            <Stack gap='md'>
                <Stack gap='sm'>
                    {getRepoComponents()}
                </Stack>
                <CustomPagination pageNumber={pageNumber} onClick={onPaginationClick} />
            </Stack>
        </Stack>
    );
};

export default Repos;