import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ApartmentIcon from "@mui/icons-material/Apartment";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <Box>
        <ApartmentIcon sx={{ fontSize: 48, color: "#0891b2", mb: 2 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "3rem",
            color: "#0891b2",
            lineHeight: 1,
          }}
        >
          404
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#1e293b",
            mt: 1,
            mb: 1,
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            color: "#64748b",
            mb: 3,
          }}
        >
          The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 2,
            bgcolor: "#0891b2",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
