// src/theme.js
import { createTheme } from "@mui/material/styles";

const PRIMARY = "#2bddf4";
const PRIMARY_DARK = "#07d3d3";
const PRIMARY_LIGHT = "#c9ffff";
const BG = "#f5fbfb";
const TEXT = "#023039";

const themeMui = createTheme({
  palette: {
    primary: {
      main: PRIMARY,
      dark: PRIMARY_DARK,
      light: PRIMARY_LIGHT,
      contrastText: "#ffffff",
    },
    background: {
      default: BG,
      paper: "#ffffff",
    },
    text: {
      primary: TEXT,
    },
  },
  components: {
    /* ====== APP BAR / HEADER ====== */
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "var(--gradient-primary)", // dùng gradient aqua
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          "@media (min-width:600px)": {
            minHeight: 72,
          },
        },
      },
    },

    /* ====== BUTTON MENU (trong header) ====== */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 500,
        },
        text: {
          // button text dùng cho menu trong AppBar
          color: "#ffffff",
          paddingInline: 12,
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.16)",
          },
        },
        containedPrimary: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "0 3px 8px rgba(0,184,184,0.4)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,184,184,0.5)",
          },
        },
      },
    },

    /* ====== ICON BUTTON (menu icon) ====== */
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: TEXT,
        },
      },
    },

    /* ====== MENU DROPDOWN (MUI Menu / MenuItem) ====== */
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(43, 221, 244, 0.12)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(43, 221, 244, 0.18)",
          },
        },
      },
    },

    /* ====== SIDEBAR / DRAWER + LIST MENU ====== */
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BG,
          borderRight: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          marginInline: 8,
          paddingInline: 16,
          "&.Mui-selected": {
            backgroundColor: "rgba(43, 221, 244, 0.18)",
            color: TEXT,
          },
          "&.Mui-selected .MuiListItemIcon-root": {
            color: PRIMARY_DARK,
          },
          "&:hover": {
            backgroundColor: "rgba(43, 221, 244, 0.12)",
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: TEXT, 
        },
      },
    },
  },
});

export default themeMui;
export { PRIMARY, PRIMARY_DARK, PRIMARY_LIGHT, BG, TEXT };
