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
  const [mobileOpen, setMobileOpen] = useState(false);

  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const loginIdentifier = useSelector((state) => state.auth.loginIdentifier);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const DrawerContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ApartmentIcon sx={{ color: "white", fontSize: 24 }} />
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "white",
              }}
            >
              UrbanSync
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Resident Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Resident Info */}
      <Box sx={{ p: 2, bgcolor: "#f0f9ff", borderBottom: "1px solid #e0f2fe" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#0891b2",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {loginIdentifier?.[0]}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {flatNumber || "Resident"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.68rem",
                color: "#64748b",
              }}
            >
              +91{loginIdentifier}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  bgcolor: isActive ? "#e0f2fe" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#e0f2fe" : "#f8fbff" },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: isActive ? "#0891b2" : "#64748b" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primarytypographyprops={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#0891b2" : "#475569",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#e0f2fe" }} />

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, py: 1, "&:hover": { bgcolor: "#fee2e2" } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#dc2626" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primarytypographyprops={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "#dc2626",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fbff" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e0f2fe",
            zIndex: 1300,
          }}
        >
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: "#0891b2", mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <ApartmentIcon sx={{ color: "#0891b2", mr: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#1e293b",
                flexGrow: 1,
              }}
            >
              UrbanSync
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                color: "#0891b2",
                fontWeight: 600,
              }}
            >
              {flatNumber}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              border: "none",
              borderRight: "1px solid #e0f2fe",
              bgcolor: "white",
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: "white" },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: isMobile ? 7 : 0,
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ResidentAppLayout;
