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
  Collapse,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { logout } from "../features/auth/authSlice";

const DRAWER_WIDTH = 220;

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    path: "/secretary/dashboard/home",
  },
  {
    label: "My Profile",
    icon: <AccountCircleIcon fontSize="small" />,
    path: "/secretary/dashboard/profile",
  },
  {
    label: "Registrations",
    icon: <HowToRegIcon fontSize="small" />,
    path: "/secretary/dashboard/registrations",
  },
  {
    label: "Caretakers",
    icon: <EngineeringIcon fontSize="small" />,
    path: "/secretary/dashboard/caretakers",
  },
  {
    label: "Property",
    icon: <ApartmentIcon fontSize="small" />,
    path: "/secretary/dashboard/property",
  },
  {
    label: "Maintenance",
    icon: <ReceiptIcon fontSize="small" />,
    path: "/secretary/dashboard/maintenance",
  },
  {
    label: "Payments",
    icon: <PaymentIcon fontSize="small" />,
    path: "/secretary/dashboard/payments",
  },
  {
    label: "Complaints",
    icon: <ReportProblemIcon fontSize="small" />,
    path: "/secretary/dashboard/complaints",
  },
  {
    label: "Permissions",
    icon: <LockOpenIcon fontSize="small" />,
    path: "/secretary/dashboard/permissions",
  },
  {
    label: "Announcements",
    icon: <CampaignIcon fontSize="small" />,
    path: "/secretary/dashboard/announcements",
  },
  {
    label: "Scheduler",
    icon: <ScheduleIcon fontSize="small" />,
    path: "/secretary/dashboard/scheduler",
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
      {/* Logo Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
          minHeight: 80,
        }}
      >
        <Box
          component="img"
          src="/urbansync-logo.svg"
          sx={{ width: 42, height: 42, borderRadius: 2 }}
        />
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "white",
              letterSpacing: 0.3,
            }}
          >
            UrbanSync
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              mt: 0.2,
            }}
          >
            Secretary Panel
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List
        sx={{
          px: 1,
          pt: 1,
          flexGrow: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#e0f2fe",
            borderRadius: "99px",
          },
        }}
        disablePadding
      >
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
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#e0f2fe" : "#f8fafc",
                    color: "#0891b2",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 32, color: isActive ? "#0891b2" : "#94a3b8" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: "Inter, sans-serif",
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

      <Divider sx={{ borderColor: "#e0f2fe" }} />

      {/* Logout */}
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
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#fef2f2" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#dc2626" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{
                primary: {
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile — temporary drawer slides over content */}
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
          zIndex: 1300,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            border: "none",
            boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
            transition: "transform 0.25s ease !important",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop — inline box that animates width */}
      {!isMobile && (
        <Box
          sx={{
            width: open ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            overflow: "hidden",
            transition: "width 0.25s ease",
            height: "100%",
            borderRight: open ? "1px solid #e0f2fe" : "none",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              width: DRAWER_WIDTH,
              height: "100%",
              overflow: "auto",
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: "#e0f2fe",
                borderRadius: "99px",
              },
            }}
          >
            {drawerContent}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
