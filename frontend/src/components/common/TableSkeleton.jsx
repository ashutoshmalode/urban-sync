import { Box, Skeleton } from "@mui/material";

const TableSkeleton = ({ rows = 5 }) => (
  <Box sx={{ p: 3 }}>
    {[...Array(rows)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={44}
        sx={{ mb: 1, borderRadius: 1.5, animationDelay: `${i * 0.05}s` }}
      />
    ))}
  </Box>
);

export default TableSkeleton;
