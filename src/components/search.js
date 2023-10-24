import { TextInput, Button, Group, Space } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

const Search = ({label, placeholder, onClick}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const onChange = (event) => {
        setSearchQuery(event.currentTarget.value);
        setButtonDisabled(!event.target.value || event.target.value === '');
    };

    return (
        <Group gap="md" justify="center" align="flex-end">
            <TextInput value={searchQuery} onChange={(event) => onChange(event)}  label={label} placeholder={placeholder} />
            <Button disabled={buttonDisabled} rightSection={<IconSearch />} onClick={() => onClick(searchQuery)}>Search</Button>
        </Group>
    );
};

export default Search;