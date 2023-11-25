import { Title, Center, Stack, Image } from "@mantine/core";
import image from '../images/DALL·E 2023-11-08 14.58.21 - 3D render of a computer screen with a sad face, digital art.png';
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