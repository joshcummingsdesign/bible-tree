'use client';

import {useEffect} from 'react';

interface FamilyNode {
    id: number;
    pids?: number[];
    mid?: number;
    fid?: number;
    name: string;
    alt_names: string[];
    gender: 'male' | 'female';
}

interface Props {
    nodes: FamilyNode[];
}

export const FamilyTree = ({nodes}: Props) => {
    useEffect(() => {
        const family = new (window as any).FamilyTree('#tree', {
            nodeBinding: {
                field_0: 'name',
                field_1: 'alt_names',
            },
            editForm: {
                readOnly: true,
                buttons: {
                    share: null,
                    pdf: null,
                },
            },
            nodeMouseClick: (window as any).FamilyTree.action.none,
            mouseScrool: (window as any).FamilyTree.action.yScroll,
            zoom: {
                speed: 25,
            },
        });

        family.onField((args: any) => {
            // Add links
            if (args.name === 'name' && args.data['link']) {
                var name = args.data['name'];
                var link = args.data['link'];
                args.value = '<a target="_blank" href="' + link + '">' + name + '</a>';
            }
        });

        family.load(nodes);
    }, []);

    return <div id="tree" style={{height: '100vh'}}></div>;
};
