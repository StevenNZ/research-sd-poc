import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      rootBackground: string;
      cardBackground: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      rootBackground?: string;
      cardBackground?: string;
    };
  }
}

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    primary: {
      main: mode === "light" ? "#fff" : "#1B1B1B", // Light and dark primary colors
      light: "#fff",
      dark: "#000",
    },
    secondary: {
      main: mode === "light" ? "#eee" : "#353535", // Light and dark secondary colors
    },
    error: {
      main: red.A400,
    },
    background: {
      default: mode === "light" ? "#ddd" : "#000", // Light and dark background
    },
    text: {
      primary: mode === "light" ? "#000" : "#fff", // Text color for light and dark modes
      secondary: mode === "light" ? "#1B1B1B" : "#DADADA",
    },
    // Additional custom colors can be defined here
    custom: {},
  },
});

// Usage
// For light mode
const lightTheme = createTheme(getDesignTokens("light"));

// For dark mode
const darkTheme = createTheme(getDesignTokens("dark"));

export { lightTheme, darkTheme };
