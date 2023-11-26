import { Title, Center, Stack, Image } from "@mantine/core";
import image from '../images/error_image.png';
import HamburgerMenu from "./hamburger-menu";

const Error = () => {
    return (
        <>
            <HamburgerMenu />
            <Center>
                <Stack gap='md'>
                    <Title>
                        Something went wrong :(
                    </Title>
                    <Image src={image} w='auto' fit='contain' h='500' />
                </Stack>
            </Center>
        </>
    );
};

export default Error;