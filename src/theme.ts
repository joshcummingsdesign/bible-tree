'use client';

import {createTheme, ThemeOptions} from '@mui/material/styles';
import {colors, fonts, typography} from './assets/styles';

declare module '@mui/material/styles' {
    interface Palette {
        brand: {
            black: string;
            white: string;
            grey: string;
            lightGrey: string;
            purple: string;
            blue: string;
            pink: string;
        };
    }
}

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#e0e0e0',
        },
        brand: {
            black: colors.black,
            white: colors.white,
            grey: colors.grey,
            lightGrey: colors.lightGrey,
            purple: colors.purple,
            blue: colors.blue,
            pink: colors.pink,
        },
    },
    typography: {
        fontFamily: fonts.fontBody,
        h1: {
            ...typography.h1,
        },
        h2: {
            ...typography.h2,
        },
        h3: {
            ...typography.h3,
        },
        h4: {
            ...typography.h4,
        },
        h5: {
            ...typography.h5,
        },
        h6: {
            ...typography.h6,
        },
        body1: {
            ...typography.body1,
        },
        body2: {
            ...typography.body2,
        },
    },
} as ThemeOptions);

export default theme;
