import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

const EmptyState = ({ icon, message, actionLabel, onAction }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 6,
      px: 2,
    }}
  >
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: 3,
        bgcolor: "#f1f5f9",
        mb: 1.5,
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />}
    </Box>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        color: "#94a3b8",
        fontSize: "0.88rem",
        mb: onAction ? 2 : 0,
      }}
    >
      {message}
    </Typography>
    {onAction && (
      <Button
        variant="outlined"
        size="small"
        onClick={onAction}
        sx={{
          borderRadius: 2,
          borderColor: "#0891b2",
          color: "#0891b2",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.8rem",
        }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
