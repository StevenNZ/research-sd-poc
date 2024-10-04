import React from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingSpinnerScreen: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      margin="auto"
    >
      <CircularProgress color="primary" size={100} />
    </Box>
  );
};

export default LoadingSpinnerScreen;
