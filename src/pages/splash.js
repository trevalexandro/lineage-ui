import { Stack, Title, Text, AspectRatio, Overlay, Space, Button, Paper } from "@mantine/core";
import topSectionImage from '../images/DALL·E 2023-11-13 00.05.46 - connecting the dots and the colors are blue, white, and gray with a black background, digital art.png';
import dependencyScreenshot from '../images/dependencies_screenshot.png';
import modalScreenshot from '../images/modal_screenshot.png';
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconBrandGithubFilled } from "@tabler/icons-react";

// dark hex #1a1b1e

const TopSection = ({showLargeScreenOverlayImage, onButtonClick}) => {
    // TODO: Burger menu?
    const [opened, {toggle}] = useDisclosure();

    return (
        // TODO: Does this aspect ratio work for small screenn sizes?
        <AspectRatio ratio={showLargeScreenOverlayImage ? 4 / 3 : 3 / 4}>
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

const MidSection = ({minSizeMedium, showLargeMidSectionElements}) => {
    let fontSize = 15;
    if (minSizeMedium) {
        fontSize = 25;
    }
    if (showLargeMidSectionElements) {
        fontSize = 35;
    }

    let imageAspectRatio = 517 / 200;
    if (minSizeMedium) {
        imageAspectRatio = 517 / 130;
    }
    if (showLargeMidSectionElements) {
        imageAspectRatio = 517 / 70;
    }

    return (
        <Stack gap='lg'>
            <Stack gap='lg' align="center">
                <Text size='xl' style={{color: 'white'}}>
                    Visual
                </Text>
                <Title style={{fontSize, color: '#3fb950'}}>
                    Instead of digging through code & configurations
                </Title>
                <Title style={{fontSize, color: '#3fb950'}}>
                    Lineage's simple UI allows you to see the whole picture
                </Title>
            </Stack>
            <Paper shadow="md" withBorder style={{borderColor: 'gray'}}>
                <AspectRatio ratio={1690 / 323}>
                    <img style={{objectFit: 'scale-down'}} src={dependencyScreenshot} />
                </AspectRatio>
            </Paper>
            <Stack gap='lg' align="center">
                <Text size='xl' style={{color: 'white'}}>
                    Transverse
                </Text>
                <Title style={{fontSize, color: '#3fb950'}}>
                    If your dependency uses Lineage
                </Title>
                <Title style={{fontSize, color: '#3fb950'}}>
                    You can easily navigate to its dependencies
                </Title>
                <Text size='xl' style={{color: 'white'}}>
                    Insight
                </Text>
                <Title style={{fontSize, color: '#3fb950'}}>
                    View your dependency's health in real-time
                </Title>
            </Stack>
            <Paper shadow="md" withBorder style={{borderColor: 'gray'}}>
                <AspectRatio ratio={imageAspectRatio}>
                    <img style={{objectFit: 'scale-down'}} src={modalScreenshot} />
                </AspectRatio>
            </Paper>
        </Stack>
    );
}

const BottomSection = ({onButtonClick}) => {
    return (
        <Stack gap='lg' align="center">
            <Button onClick={onButtonClick} rightSection={<IconBrandGithubFilled />}>
                Get started with GitHub
            </Button>
        </Stack>
    );
};

const SplashPage = () => {
    const showLargeMidSectionElements = useMediaQuery('(min-width: 821px)');
    const minSizeMedium = useMediaQuery('(min-width: 767px');

    const onButtonClick = () => window.location = `${process.env.REACT_APP_OAUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=repo`;

    return (
        <Stack>
            <TopSection showLargeScreenOverlayImage={minSizeMedium} onButtonClick={onButtonClick} />
            <Space h='xl' />
            <Space h='xl' />
            <MidSection minSizeMedium={minSizeMedium} showLargeMidSectionElements={showLargeMidSectionElements} />
            <Space h='xl' />
            <Space h='xl' />
            <BottomSection onButtonClick={onButtonClick} />
        </Stack>
    );
};

export default SplashPage;