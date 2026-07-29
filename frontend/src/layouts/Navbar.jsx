import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Skeleton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { logout } from "../features/auth/authSlice";
import axiosInstance from "../api/axiosInstance";

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loginIdentifier, role } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [fundBalance, setFundBalance] = useState(null);
  const [loadingFund, setLoadingFund] = useState(true);

  useEffect(() => {
    if (role === "SECRETARY") {
      axiosInstance
        .get("/api/payment/fund/balance")
        .then((res) => setFundBalance(res.data.balance))
        .catch(() => setFundBalance(null))
        .finally(() => setLoadingFund(false));
    }
  }, [role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #e0f2fe",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: "56px !important", px: { xs: 1.5, sm: 2 } }}>
        {/* Hamburger */}
        <IconButton
          onClick={onMenuClick}
          size="small"
          sx={{ mr: 1, color: "#0891b2" }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <ApartmentIcon sx={{ color: "#0891b2", fontSize: 22, mr: 0.8 }} />
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="#0891b2"
          sx={{ flexGrow: 1, letterSpacing: 0.3 }}
        >
          UrbanSync
        </Typography>

        {/* Fund Balance — Secretary only */}
        {role === "SECRETARY" && (
          <Box
            sx={{
              mr: 2,
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 16, color: "#0891b2" }} />
            {loadingFund ? (
              <Skeleton width={60} height={20} />
            ) : (
              <Chip
                label={
                  fundBalance !== null
                    ? `₹${Number(fundBalance).toLocaleString("en-IN")}`
                    : "—"
                }
                size="small"
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0e7490",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            )}
          </Box>
        )}

        {/* Avatar Menu */}
        <Tooltip title={loginIdentifier}>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#0891b2",
                fontSize: "0.8rem",
              }}
            >
              {loginIdentifier?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                border: "1px solid #e0f2fe",
                borderRadius: 2,
                minWidth: 200,
                mt: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {loginIdentifier}
            </Typography>
            <Chip
              label={role}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: "#e0f2fe",
                color: "#0891b2",
                fontSize: "0.65rem",
                height: 18,
                fontWeight: 700,
              }}
            />
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/secretary/dashboard/profile");
            }}
            sx={{ fontSize: "0.875rem", gap: 1.5, py: 1 }}
          >
            <AccountCircleIcon fontSize="small" sx={{ color: "#64748b" }} />
            My Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ fontSize: "0.875rem", gap: 1.5, py: 1, color: "#dc2626" }}
          >
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
