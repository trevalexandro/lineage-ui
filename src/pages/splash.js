import { Stack, Title, Text, AspectRatio, Overlay } from "@mantine/core";
import topSectionImage from '../images/DALL·E 2023-11-13 00.05.46 - connecting the dots and the colors are blue, white, and gray with a black background, digital art.png';

// dark hex #1a1b1e

const TopSection = () => {
    return (
        <Stack gap='lg'>
            <AspectRatio ratio={4 / 3}>
                <Stack style={{zIndex: 2}}>
                    <Title style={{fontSize: 75}}>
                        See it all at once
                    </Title>
                    <Text size='xl'>
                        A holistic view of your dependencies and their health.
                    </Text>
                </Stack>
                <img src={topSectionImage} />
                <Overlay fixed={true} gradient="linear-gradient(to right black, transparent)" opacity={0.99} />
            </AspectRatio>
        </Stack>
    );
};

const SplashPage = () => {
    return (
        <Stack gap='xl'>
            <TopSection />
            <Title>Test</Title>
        </Stack>
    );
};

export default SplashPage;