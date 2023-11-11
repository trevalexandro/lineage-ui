import { TextInput, Button, Group } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

const Search = ({label, placeholder, onSearchClick}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const loaderProps = {
        type: 'bars'
    }

    const onChange = (event) => {
        setSearchQuery(event.currentTarget.value);
        setButtonDisabled(!event.target.value || event.target.value === '');
    };

    const onSearchButtonClick = async () => {
        setIsLoading(true);
        await onSearchClick(searchQuery);
        setIsLoading(false);
    }

    return (
        <Group gap="md" justify="center" align="flex-end">
            <TextInput value={searchQuery} onChange={(event) => onChange(event)}  label={label} placeholder={placeholder} />
            <Button disabled={buttonDisabled} rightSection={<IconSearch />} onClick={onSearchButtonClick} loading={isLoading} loaderProps={loaderProps}>
                Search
            </Button>
        </Group>
    );
};

export default Search;