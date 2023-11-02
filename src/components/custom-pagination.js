import { Button, Group } from "@mantine/core";
import { IconArrowBadgeLeft, IconArrowBadgeRight } from "@tabler/icons-react";

const CustomPagination = ({pageNumber, onClick, totalCount = undefined, pageCount = undefined}) => {
    const disableNextButton = () => {
        if (!totalCount || !pageCount) {
            return false;
        }

        return pageNumber * pageCount >= totalCount;
    };

    return (
        <Group justify='space-between' gap='xl'>
            <Button disabled={pageNumber === 1} onClick={() => onClick(false)} leftSection={<IconArrowBadgeLeft />}>
                Previous
            </Button>
            <Button disabled={disableNextButton()} onClick={() => onClick(true)} rightSection={<IconArrowBadgeRight />}>
                Next
            </Button>
        </Group>
    );
};

export default CustomPagination;

export const getPaginatedResults = (pageNumber, pageCount, collection) => {
    const offset = pageCount * (pageNumber - 1);
    return collection.slice(offset, (pageCount + offset - 1));
};