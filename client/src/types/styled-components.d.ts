// styled-components.d.ts
import "styled-components";
import type { ThemeType } from "@/styles/theme"; // adjust this to where your theme object lives

declare module "styled-components" {
    export interface DefaultTheme extends ThemeType { }
}