export const fonts = {
    fontHeading: 'var(--font-heading)',
    fontBody: 'var(--font-body)',
};

export const fontWeights = {
    regular: 'var(--fw-regular)',
    bold: 'var(--fw-bold)',
};

export const typography = {
    h1: {
        fontSize: '2.5rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.2',
        fontFamily: fonts.fontHeading,
    },
    h2: {
        fontSize: '1.75rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.3',
        fontFamily: fonts.fontHeading,
    },
    h3: {
        fontSize: '1.5rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.3',
        fontFamily: fonts.fontHeading,
    },
    h4: {
        fontSize: '1.375rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.3',
        fontFamily: fonts.fontHeading,
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.3',
        fontFamily: fonts.fontHeading,
    },
    h6: {
        fontSize: '1.125rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.3',
        fontFamily: fonts.fontHeading,
    },
    body1: {
        fontSize: '1.0625rem',
        fontWeight: fontWeights.bold,
        lineHeight: '1.6',
        fontFamily: fonts.fontBody,
    },
    body2: {
        fontSize: '0.8125rem',
        fontWeight: fontWeights.regular,
        lineHeight: '1.6',
        fontFamily: fonts.fontBody,

        a: {
            color: 'inherit',
        },
    },
};
