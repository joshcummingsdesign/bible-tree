import {FC} from 'react';
import {FamilyNode} from '@/lib/types';
import styles from './styles.module.scss';

interface Props {
    data: FamilyNode;
}

export const FamilyNodeContent: FC<Props> = ({data: {name, alt_names, type}}) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.alt_names}>{alt_names?.join(', ')}</p>
            <span className={styles.icon}>
                <FamilyNodeIcon type={type} />
            </span>
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
