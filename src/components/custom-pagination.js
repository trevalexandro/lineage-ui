import { Button, Group } from "@mantine/core";
import { IconArrowBadgeLeft, IconArrowBadgeRight } from "@tabler/icons-react";

const CustomPagination = ({pageNumber, onClick}) => {
    return (
        <Group justify='space-between' gap='xl'>
            <Button disabled={pageNumber === 1} onClick={() => onClick(false)} leftSection={<IconArrowBadgeLeft />}>Previous</Button>
            <Button onClick={() => onClick(true)} rightSection={<IconArrowBadgeRight />}>Next</Button>
        </Group>
    );
};

export default CustomPagination;