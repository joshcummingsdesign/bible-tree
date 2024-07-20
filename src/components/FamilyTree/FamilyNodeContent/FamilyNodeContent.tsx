import {FC} from 'react';
import {FamilyNode} from '@/lib/types';
import {combineClassNames as css} from '@/lib/utils/combineClassNames';
import styles from './styles.module.scss';

interface Props {
    node: FamilyNode;
}

/**
 * This is appended to the DOM in an SVG, so SCSS must be used.
 */
export const FamilyNodeContent: FC<Props> = ({node}) => {
    const {id, name, alt_names, gender, type, _dimmed} = node;
    return (
        <div className={css(styles.container, 'btr-node-container', gender, _dimmed && 'dimmed')} data-node-id={id}>
            <h2
                className={css(styles.name, 'btr-node-heading')}
                style={{fontFamily: 'var(--font-heading)'}}
                data-node-id={id}
            >
                {name}
            </h2>
            <p className={styles.alt_names}>{alt_names?.join(', ')}</p>
            <button className={css(styles.icon, 'btr-node-icon')} data-node-id={id}>
                <FamilyNodeIcon type={type} />
            </button>
        </div>
    );
};

const FamilyNodeIcon = ({type}: {type: FamilyNode['type']}) => {
    switch (type) {
        case 'patriarch':
            return '👨‍👧‍👦';
        case 'prophet':
            return '📖';
        case 'priest':
            return '🙏';
        case 'king':
            return '👑';
        case 'nation':
            return '🌐';
        default:
            return '👤';
    }
};
