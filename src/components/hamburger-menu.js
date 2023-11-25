import { useDisclosure } from "@mantine/hooks";
import { Burger, Drawer, NavLink } from "@mantine/core";
import { IconBooks, IconBrandGithub, IconHome } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import {ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME} from '../const';
import { useMediaQuery } from "@mantine/hooks";

const HamburgerMenu = () => {
    const [opened, {open, close}] = useDisclosure(false);
    const location = useLocation();
    const navigate = useNavigate();
    const minSizeMedium = useMediaQuery('(min-width: 767px');
    const homeNavigationActive = location.pathname === '/repos';

    const burgerMenuProps =  {
        width: '5%', 
        height: '5%',
        zIndex: opened ? 0 : 197
    };

    if (!minSizeMedium) {
        burgerMenuProps.top = '10%';
        burgerMenuProps.width = '10%';
    }

    const onHomeClick = () => {
        if (homeNavigationActive) {
            return;
        }

        const accessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
        if (accessToken && accessToken !== '') {
            navigate('/repos');
        } else {
            navigate('/');
        }
    };

    const onDocsClick = () => window.open(`${process.env.REACT_APP_DOCUMENTATION_URL}`, '_blank');

    const onLoginClick = () => window.location = `${process.env.REACT_APP_OAUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=repo`;

    return (
        <>
            <Drawer size='xs' opened={opened} onClose={close} title="Lineage menu">
                {location.pathname !== '/' && <NavLink label="Home" leftSection={<IconHome />} active={homeNavigationActive} onClick={onHomeClick} />}
                {location.pathname === '/' && <NavLink label='Login' leftSection={<IconBrandGithub />} onClick={onLoginClick} />}
                <NavLink label='Docs' onClick={onDocsClick} leftSection={<IconBooks />} />
            </Drawer>
            <Burger onClick={open} aria-label="Toggle navigation" style={burgerMenuProps} />
        </>
    );
};

export default HamburgerMenu;