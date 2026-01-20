import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

// const drawerWidth = 240;

const LandingPage: React.FC = () => {
  // const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // const handleDrawerToggle = () => {
  //   setMobileOpen(!mobileOpen);
  // };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleCloseMenu();
    navigate("/profile");
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header
        anchorEl={anchorEl}
        onAvatarClick={handleAvatarClick}
        onCloseMenu={handleCloseMenu}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: "100%" }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default LandingPage;
