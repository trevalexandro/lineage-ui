import { useDisclosure } from "@mantine/hooks";
import { Burger, Drawer, NavLink } from "@mantine/core";
import { IconBooks, IconHome } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";

const HamburgerMenu = () => {
    const [opened, {open, close}] = useDisclosure(false);
    const location = useLocation();
    const navigate = useNavigate();
    const homeNavigationActive = !location || location.pathname === '' || location.pathname === 'repos';

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

    const onDocsClick = () => {
        window.open(`${process.env.REACT_APP_DOCUMENTATION_URL}`, '_blank');
    };

    return (
        <>
            <Drawer size='xs' opened={opened} onClose={close} title="Lineage menu">
                <NavLink label="Home" leftSection={<IconHome />} active={homeNavigationActive} onClick={onHomeClick} />
                <NavLink label='Docs' onClick={onDocsClick} leftSection={<IconBooks />} />
            </Drawer>
            <Burger opened={opened} onClick={open} aria-label="Toggle navigation" />;
        </>
    );
};

export default HamburgerMenu;