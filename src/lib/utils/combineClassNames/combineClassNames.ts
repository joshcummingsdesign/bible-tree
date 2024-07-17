/**
 * Combine class names.
 * ```
 * ('c1', 'c2', false, null, '') => 'c1 c2'
 *```
 *
 * @unreleased
 */
export const combineClassNames = (...classNames: any[]): string =>
    classNames
        .filter((c) => typeof c === 'string')
        .join(' ')
        .trim();
