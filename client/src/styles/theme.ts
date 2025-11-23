const theme = {
    colors: {
        whiteClr: "hsl(0, 0%, 100%)",
        darkShade: "#111827",
        greyish: "#4B5563",
        lightBlue: "#0EA5E9",
        greyishBlack: "#4B5563",
        lightGreyish: "#E5E7EB",
    },
    fonts: {
        poppinsFont: "'Poppins', sans-serif",
    },
    breakpoints: {
        mobile: "screen and (max-width: 767px)",
        desktop: "screen and (min-width: 768px)",
    },
}


export default theme;
export type ThemeType = typeof theme;