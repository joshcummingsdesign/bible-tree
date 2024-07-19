export interface FamilyNode {
    id: number;
    pids?: number[];
    mid?: number;
    fid?: number;
    name: string;
    alt_names?: string[];
    gender: 'male' | 'female';
    category?: 'jew' | 'gentile';
    type?: 'person' | 'patriarch' | 'prophet' | 'priest' | 'king' | 'nation';
    link?: string;
    notes?: string[];
}
