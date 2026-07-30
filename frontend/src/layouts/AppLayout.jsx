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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f9ff" }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "56px",
          ml: { xs: 0, md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: "margin 0.25s ease",
          p: { xs: 2, sm: 2.5, md: 3 },
          minHeight: "calc(100vh - 56px)",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
