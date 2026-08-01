import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from '@mui/icons-material/Apartment';
import { logout } from "../features/auth/authSlice";

const DRAWER_WIDTH = 220;

const menuItems = [
  {
    label: 'My Profile',
    icon: <AccountCircleIcon fontSize="small" />,
    path: '/secretary/dashboard/profile',
  },
  {
    label: 'Registrations',
    icon: <HowToRegIcon fontSize="small" />,
    path: '/secretary/dashboard/registrations',
  },
  {
    label: 'Caretakers',
    icon: <EngineeringIcon fontSize="small" />,
    path: '/secretary/dashboard/caretakers',
  },
  // ADD THIS
  {
    label: 'Property',
    icon: <ApartmentIcon fontSize="small" />,
    path: '/secretary/dashboard/property',
  },
  {
    label: 'Payments',
    icon: <PaymentIcon fontSize="small" />,
    path: '/secretary/dashboard/payments',
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "white",
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #e0f2fe",
          mt: "56px",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          SECRETARY PANEL
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1, pt: 1, flexGrow: 1 }} disablePadding>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                onMouseDown={(e) => e.preventDefault()}
                sx={{
                  borderRadius: 1.5,
                  py: 0.8,
                  px: 1.5,
                  bgcolor: isActive ? "#e0f2fe" : "transparent",
                  color: isActive ? "#0891b2" : "#475569",
                  "&:hover": {
                    bgcolor: isActive ? "#e0f2fe" : "#f8fafc",
                    color: "#0891b2",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive ? "#0891b2" : "#94a3b8",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 700 : 500,
                    },
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      bgcolor: "#0891b2",
                      borderRadius: 4,
                      ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Divider sx={{ borderColor: "#e0f2fe" }} />
      <List sx={{ px: 1, py: 1 }} disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              borderRadius: 1.5,
              py: 0.8,
              px: 1.5,
              color: "#dc2626",
              "&:hover": { bgcolor: "#fef2f2" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#dc2626" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{ primary: { fontSize: "0.85rem", fontWeight: 500 } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            border: "none",
            boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            border: "none",
            borderRight: "1px solid #e0f2fe",
            boxShadow: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
