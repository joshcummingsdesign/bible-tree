import {DM_Serif_Display, Red_Hat_Display} from 'next/font/google';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {combineClassNames as css} from '@/lib/utils/combineClassNames';
import theme from '@/theme';
import '@/assets/styles/global.scss';

const fontHeading = DM_Serif_Display({
    variable: '--font-heading',
    weight: ['400'],
    style: ['normal'],
    subsets: ['latin'],
});

const fontBody = Red_Hat_Display({
    variable: '--font-body',
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
});

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <AppRouterCacheProvider options={{enableCssLayer: true}}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <body className={css(fontHeading.variable, fontBody.variable)}>{children}</body>
                </ThemeProvider>
            </AppRouterCacheProvider>
        </html>
    );
}
