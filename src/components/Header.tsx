import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Button,
  IconButton,
  useColorScheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

type Props = {
  anchorEl: HTMLElement | null;
  onAvatarClick: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseMenu: () => void;
  onProfile: () => void;
  onLogout: () => void;
};

const Header: React.FC<Props> = ({
  anchorEl,
  onAvatarClick,
  onCloseMenu,
  onProfile,
  onLogout,
}) => {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { mode, setMode, systemMode } = useColorScheme();

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src="/logo192.png" alt="School logo" style={{ height: 32 }} />
            <Typography variant="h6" noWrap component="div">
              School Name
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={() => navigate("/timetable")}>
              Timetable
            </Button>
            <Button color="inherit" onClick={() => navigate("/groups")}>
              Groups
            </Button>
          </Box>
        </Box>

        <Box>
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => {
              const currentMode = mode === "system" ? systemMode : mode;
              setMode(currentMode === "dark" ? "light" : "dark");
            }}
            color="inherit"
          >
            {mode === "dark" || (mode === "system" && systemMode === "dark") ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={onAvatarClick}
            aria-controls={open ? "user-menu" : undefined}
            aria-haspopup="true"
          >
            <Avatar alt="User" src="/avatar.png">
              U
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={onCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={onLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
