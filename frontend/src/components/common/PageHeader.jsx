import { Box, Typography } from "@mui/material";

const PageHeader = ({ icon, title, subtitle, action }) => (
  <Box
    sx={{
      mb: 2.5,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        bgcolor: "#e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: "#1e293b",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            color: "#64748b",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && action}
  </Box>
);

export default PageHeader;
