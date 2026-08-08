import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { logout } from "../features/auth/authSlice";

const DRAWER_WIDTH = 220;
const MOBILE_DRAWER_WIDTH = 200;

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    path: "/resident/dashboard/home",
  },
  {
    label: "My Profile",
    icon: <PersonIcon fontSize="small" />,
    path: "/resident/dashboard/profile",
  },
  {
    label: "My Bills",
    icon: <ReceiptIcon fontSize="small" />,
    path: "/resident/dashboard/bills",
  },
  {
    label: "Complaints",
    icon: <ReportProblemIcon fontSize="small" />,
    path: "/resident/dashboard/complaints",
  },
  {
    label: "Permissions",
    icon: <LockOpenIcon fontSize="small" />,
    path: "/resident/dashboard/permissions",
  },
  {
    label: "Announcements",
    icon: <CampaignIcon fontSize="small" />,
    path: "/resident/dashboard/announcements",
  },
  {
    label: "Properties",
    icon: <HomeWorkIcon fontSize="small" />,
    path: "/resident/dashboard/properties",
  },
];

const ResidentAppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const loginIdentifier = useSelector((state) => state.auth.loginIdentifier);

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
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2.5 },
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          flexShrink: 0,
          minHeight: { xs: 60, sm: 80 },
        }}
      >
        <Box
          component="img"
          src="/urbansync-logo-purple.svg"
          sx={{
            width: { xs: 30, sm: 42 },
            height: { xs: 30, sm: 42 },
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              color: "white",
              letterSpacing: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            UrbanSync
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.6rem", sm: "0.7rem" },
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              mt: 0.1,
            }}
          >
            Resident Panel
          </Typography>
        </Box>
      </Box>

      {/* Resident Info */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1, sm: 1.5 },
          bgcolor: "#f5f3ff",
          borderBottom: "1px solid #e9d5ff",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar
            sx={{
              width: { xs: 28, sm: 36 },
              height: { xs: 28, sm: 36 },
              bgcolor: "#7c3aed",
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              fontWeight: 700,
            }}
          >
            {loginIdentifier?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
                fontWeight: 700,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {flatNumber || "Resident"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.62rem", sm: "0.68rem" },
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              +91{loginIdentifier}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List
        sx={{
          flexGrow: 1,
          px: { xs: 0.8, sm: 1 },
          py: 0.8,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#e9d5ff",
            borderRadius: "99px",
          },
        }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.2 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: { xs: 0.6, sm: 0.9 },
                  px: { xs: 1, sm: 1.5 },
                  bgcolor: isActive ? "#f3e8ff" : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: isActive ? "#f3e8ff" : "#faf5ff" },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 28, sm: 36 },
                    color: isActive ? "#7c3aed" : "#64748b",
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.75rem", sm: "0.82rem" },
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#7c3aed" : "#475569",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#e9d5ff" }} />

      {/* Logout */}
      <List sx={{ px: { xs: 0.8, sm: 1 }, py: 0.8 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: { xs: 0.6, sm: 0.9 },
              px: { xs: 1, sm: 1.5 },
              "&:hover": { bgcolor: "#fee2e2" },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: { xs: 28, sm: 36 },
                color: "#dc2626",
                "& .MuiSvgIcon-root": {
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{
                primary: {
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontWeight: 500,
                  color: "#dc2626",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#faf5ff",
      }}
    >
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e9d5ff",
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ minHeight: "52px !important", px: { xs: 1.5, sm: 2 } }}>
          <IconButton
            onClick={() =>
              isMobile
                ? setMobileOpen(!mobileOpen)
                : setSidebarOpen(!sidebarOpen)
            }
            size="small"
            sx={{ mr: 1, color: "#7c3aed" }}
          >
            <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
          <ApartmentIcon
            sx={{ color: "#7c3aed", fontSize: { xs: 18, sm: 22 }, mr: 0.8 }}
          />
          <Typography
            sx={{
              flexGrow: 1,
              letterSpacing: 0.3,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.88rem", sm: "1rem" },
              color: "#7c3aed",
            }}
          >
            UrbanSync
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.68rem", sm: "0.78rem" },
              color: "#7c3aed",
              fontWeight: 700,
              bgcolor: "#f3e8ff",
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              borderRadius: 2,
            }}
          >
            {flatNumber}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: MOBILE_DRAWER_WIDTH,
              bgcolor: "white",
              border: "none",
              boxShadow: "4px 0 20px rgba(124,58,237,0.12)",
              transition: "transform 0.25s ease !important",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: sidebarOpen ? DRAWER_WIDTH : 0,
              flexShrink: 0,
              overflow: "hidden",
              transition: "width 0.25s ease",
              height: "100%",
              borderRight: sidebarOpen ? "1px solid #e9d5ff" : "none",
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
                  background: "#e9d5ff",
                  borderRadius: "99px",
                },
              }}
            >
              {drawerContent}
            </Box>
          </Box>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2, md: 3 },
            overflow: "auto",
            minWidth: 0,
            transition: "all 0.25s ease",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#d8b4fe",
              borderRadius: "99px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#c084fc" },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ResidentAppLayout;
