import { Stack, Title, Text, AspectRatio, Overlay, Space, Button, Paper, ThemeIcon } from "@mantine/core";
import topSectionImage from '../images/DALL·E 2023-11-13 00.05.46 - connecting the dots and the colors are blue, white, and gray with a black background, digital art.png';
import { useMediaQuery } from "@mantine/hooks";
import { IconBinaryTree2, IconBrandGithubFilled, IconEye, IconHeartbeat } from "@tabler/icons-react";
import HamburgerMenu from "../components/hamburger-menu";

// dark hex #1a1b1e

const TopSection = ({showLargeScreenOverlayImage, onButtonClick}) => {
    // TODO: Logo in the bottom section
    
    return (
        <AspectRatio ratio={showLargeScreenOverlayImage ? 4 / 3 : 3 / 4}>
            <HamburgerMenu />
            <Stack style={{zIndex: 196}}>
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
            <Overlay zIndex={195} fixed={true} gradient="linear-gradient(to right black, transparent)" opacity={0.99} />
        </AspectRatio>
    );
};

const MidSection = ({minSizeMedium, showLargeMidSectionElements}) => {
    let fontSize = 15;
    let iconSize = '63px';

    if (minSizeMedium) {
        fontSize = 25;
        iconSize = '125px';
    }
    if (showLargeMidSectionElements) {
        fontSize = 35;
        iconSize = '250px';
    }

    return (
        <Stack gap='lg' align="center">
            <Text size='xl' style={{color: 'white'}}>
                Visual
            </Text>
            <ThemeIcon variant='outline' style={{height: iconSize, width: iconSize, border: 'none'}}>
                <IconEye style={{width: '80%', height: '80%'}} />
            </ThemeIcon>
            <Title style={{fontSize, color: 'white'}}>
                Instead of digging through code & configurations
            </Title>
            <Title style={{fontSize, color: 'white'}}>
                Lineage's simple UI allows you to see the whole picture
            </Title>
            <Space h='xl' />
            <Text size='xl' style={{color: 'white'}}>
                Traverse
            </Text>
            <ThemeIcon variant='outline' style={{height: iconSize, width: iconSize, border: 'none'}}>
                <IconBinaryTree2 style={{width: '80%', height: '80%'}} />
            </ThemeIcon>
            <Title style={{fontSize, color: 'white'}}>
                If your dependency uses Lineage
            </Title>
            <Title style={{fontSize, color: 'white'}}>
                You can easily navigate to its dependencies
            </Title>
            <Space h='xl' />
            <Text size='xl' style={{color: 'white'}}>
                Insight
            </Text>
            <ThemeIcon variant='outline' style={{height: iconSize, width: iconSize, border: 'none'}}>
                <IconHeartbeat style={{width: '80%', height: '80%'}} />
            </ThemeIcon>
            <Title style={{fontSize, color: 'white'}}>
                View your dependency's health in real-time
            </Title>
        </Stack>
    );
}

const BottomSection = ({onButtonClick}) => {
    return (
        <Stack gap='lg' align="center">
            <Button onClick={onButtonClick} rightSection={<IconBrandGithubFilled />}>
                Get started with GitHub
            </Button>
            <Space h='xl' />
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