const theme = {
    colors: {
        whiteClr: "hsl(0, 0%, 100%)",
        darkShade: "#111827",
        greyish: "#4B5563",
        lightBlue: "#0EA5E9",
        greyishBlack: "#4B5563",
        lightGreyish: "#E5E7EB",

        backgroundLight: "#F4F5F5",
        neutralGrey600: "#787778",
        neutralGrey500: "#969697",
        accentBlue100: "#A4D3F8",
        accentBlue200: "#5DB7FC",
        accentBlue300: "#109AFE",
        accentBlue400: "#74C3FE",
        darkIndigo: "#1E1D2A",
        pastelPurple: "#CFB8D1",
        neutralGrey700: "#737781",
        accentBlue500: "#9BBDDF",
        accentOrange: "#FF6B00",
        glassmorphism_clr: "rgba(200, 200, 200, 0.05)",
    },
    fonts: {
        poppinsFont: "'Poppins', sans-serif",
    },
    zIndex: {
        modal: 3,
        overlay: 1,
        navbar: 2,
    },
    breakpoints: {
        mobile: "screen and (max-width: 767px)",
        desktop: "screen and (min-width: 768px)",
    },
}


export default theme;
export type ThemeType = typeof theme;