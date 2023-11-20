import { Stack, Title, Text, AspectRatio, Overlay, Space, Button } from "@mantine/core";
import topSectionImage from '../images/DALL·E 2023-11-13 00.05.46 - connecting the dots and the colors are blue, white, and gray with a black background, digital art.png';
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconBrandGithubFilled } from "@tabler/icons-react";

// dark hex #1a1b1e

const TopSection = () => {
    // TODO: Burger menu?
    const [opened, {toggle}] = useDisclosure();
    const mediaQueryMatches = useMediaQuery('(min-width: 767px)');

    const onButtonClick = () => window.location = `${process.env.REACT_APP_OAUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=repo`;

    return (
        // TODO: Does this aspect ratio work for small screenn sizes?
        <AspectRatio ratio={mediaQueryMatches ? 4 / 3 : 3 / 4}>
            <Stack style={{zIndex: 201}}>
                <Title style={{fontSize: 75, color: 'white'}}>
                    See it all at once
                </Title>
                <Text size='xl' style={{color: 'white'}}>
                    A holistic view of your dependencies and their health.
                </Text>
                <Button onClick={onButtonClick} rightSection={<IconBrandGithubFilled />}>
                    Get started with GitHub
                </Button>
            </Stack>
            <img src={topSectionImage} />
            <Overlay fixed={true} gradient="linear-gradient(to right black, transparent)" opacity={0.99} />
        </AspectRatio>
    );
};

const MidSection = () => {
    return (
        <Stack gap='lg'>
            <Text size='xl' style={{color: 'white'}}>
                Visual
            </Text>
            <Title style={{fontSize: 25, color: 'lime'}}>
                Instead of digging through code & configurations, our simple UI allows you to see the whole picture instantly.
            </Title>
        </Stack>
    );
}

const SplashPage = () => {
    return (
        <Stack>
            <TopSection />
            <Space h='xl' />
            <Space h='xl' />
            <MidSection />
        </Stack>
    );
};

export default SplashPage;