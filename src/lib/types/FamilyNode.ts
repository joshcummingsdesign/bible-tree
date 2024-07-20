export const nodeGender = ['male', 'female'] as const;
export const nodeCategory = ['jew', 'gentile'] as const;
export const nodeType = ['person', 'patriarch', 'prophet', 'priest', 'king', 'nation'] as const;

export interface FamilyNode {
    id: number;
    parentId?: number;
    name: string;
    alt_names?: string[];
    gender: (typeof nodeGender)[number];
    category: (typeof nodeCategory)[number];
    type: (typeof nodeType)[number];
    link?: string;
    notes?: string[];
    _expanded?: boolean;
    _highlighted?: boolean;
    _upToTheRootHighlighted?: boolean;
    _dimmed?: boolean;
}
