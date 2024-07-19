export interface FamilyNode {
    id: number;
    parentId?: number;
    name: string;
    alt_names?: string[];
    gender: 'male' | 'female';
    category?: 'jew' | 'gentile';
    type?: 'person' | 'patriarch' | 'prophet' | 'priest' | 'king' | 'nation';
    link?: string;
    notes?: string[];
    _expanded?: boolean;
    _highlighted?: boolean;
    _upToTheRootHighlighted?: boolean;
}
