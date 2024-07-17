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
        (window as any).FamilyTree.elements.notesTextArea = (
            data: any,
            editElement: any,
            minWidth: number,
            readOnly: boolean
        ) => {
            const id = (window as any).FamilyTree.elements.generateId();
            const value: string[] = data[editElement.binding] || [];
            const items = value.map((v: string) => `<li>${v}</li>`);

            if (items.length === 0) {
                return {
                    html: '',
                };
            }

            return {
                html: `
                    <label style="padding: 0 12px; font-family: Helvetica; color: #acacac; font-size: 13px;"
                        for="${id}">${editElement.label}</label>
                    <ul style="font-size: 15px; padding: 0 12px 0 28px; list-style-type: disc;">${items.join('')}</ul>
                `,
                id: id,
                value: value,
            };
        };

        const family = new (window as any).FamilyTree('#tree', {
            nodeBinding: {
                field_0: 'name',
                field_1: 'alt_names',
                field_2: 'notes',
            },
            editForm: {
                readOnly: true,
                buttons: {
                    share: null,
                    pdf: null,
                },
                elements: [{type: 'notesTextArea', label: 'notes', binding: 'notes'}],
            },
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
