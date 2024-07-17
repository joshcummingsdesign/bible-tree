import {expect, test} from '@jest/globals';
import {combineClassNames as css} from './combineClassNames';

test('should combine class names', () => {
    expect(css('c1', 'c2', false, null, '', 0, undefined)).toEqual('c1 c2');
});
