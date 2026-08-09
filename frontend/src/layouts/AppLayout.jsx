import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DRAWER_WIDTH = 220;

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f0f9ff",
      }}
    >
      {/* Navbar - always full width on top */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Body - sidebar + content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - shifts smoothly */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2 },
            pt: { xs: 0.5, sm: 1 },
            overflow: "auto",
            minWidth: 0,
            transition: "all 0.25s ease",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#bae6fd",
              borderRadius: "99px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#7dd3fc" },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
