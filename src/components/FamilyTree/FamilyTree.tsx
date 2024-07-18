'use client';

import {useEffect, useRef, useState} from 'react';
import styles from './styles.module.scss';

declare global {
    interface Window {
        FamilyTree: any;
    }
}

interface FamilyNode {
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
    notes?: string;
}

interface Props {
    nodes: FamilyNode[];
}

export const FamilyTree = ({nodes}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [roots, setRoots] = useState<number[]>([]);

    useEffect(() => {
        // Set search placeholder
        window.FamilyTree.SEARCH_PLACEHOLDER = 'Search';

        // Add icon template
        const icon = `
            <text
                x="215"
                y="30"
                font-size="20px"
                style="cursor: pointer;">
                <a class="custom-node-icon" href="#" onclick="event.preventDefault();">{val}</a>
            </text>
        `;
        window.FamilyTree.templates.tommy_male.icon = icon;
        window.FamilyTree.templates.tommy_female.icon = icon;

        // Add notes text area
        window.FamilyTree.elements.notesTextArea = (
            data: {[key: string]: string[]},
            editElement: {label: string; binding: string},
            minWidth: number,
            readOnly: boolean
        ) => {
            const id = window.FamilyTree.elements.generateId();
            const value: string[] = data[editElement.binding] || [];
            const items = value.map((v: string) => `<li>${v}</li>`);

            let html = `
                <label
                    for="${id}"
                    style="
                        padding: 0 12px;
                        font-family: Helvetica;
                        color: #acacac;
                        font-size: 13px;
                    ">${editElement.label}</label>
            `;
            if (items.length > 0) {
                html += `
                    <ul
                        style="
                            width: 100%;
                            font-size: 15px;
                            padding: 0 12px 0 28px;
                            list-style-type: disc;
                        ">${items.join('')}</ul>
                `;
            } else {
                html += `
                    <ul
                        style="
                            width: 100%;
                            font-size: 15px;
                            padding: 0 12px 0 28px;
                            list-style-type: disc;
                        "><li>No notes.</li></ul>
                `;
            }

            return {html, id, value};
        };

        // Add link text
        window.FamilyTree.elements.linkText = (
            data: {[key: string]: string},
            editElement: {label: string; binding: string},
            minWidth: number,
            readOnly: boolean
        ) => {
            const id = window.FamilyTree.elements.generateId();
            const value: string | undefined = data[editElement.binding];

            let html = '';
            if (value) {
                html = `
                <a
                    target="_blank"
                    href="${value}"
                    style="
                        color: #3100ff;
                        margin-top: 5px;
                        font-size: 15px;
                        padding: 0 12px 0 28px;
                    ">View More</a>
                `;
            }

            return {html, id, value};
        };

        // Instantiate with configuration
        const family = new window.FamilyTree(containerRef.current, {
            nodeBinding: {
                field_0: 'name',
                field_1: 'alt_names',
                field_2: 'category',
                field_3: 'link',
                field_4: 'notes',
                icon: 'type',
            },
            editForm: {
                readOnly: true,
                buttons: {
                    share: null,
                    pdf: null,
                },
                generateElementsFromFields: false,
                elements: [
                    {type: 'notesTextArea', label: 'notes', binding: 'notes'},
                    {type: 'linkText', label: 'link', binding: 'link'},
                ],
            },
            mouseScrool: window.FamilyTree.action.yScroll,
            zoom: {
                speed: 25,
            },
            filterBy: {
                category: {},
                gender: {},
                type: {},
            },
            tags: {
                filter: {
                    template: 'dot',
                },
            },
            searchFields: ['name', 'alt_names'],
            searchFieldsAbbreviation: {},
        });

        // Handle icon click
        family.onNodeClick((args: {event: React.MouseEvent; node: {id: number}}) => {
            const target = args.event.target as HTMLElement;

            if (target.classList.contains('custom-node-icon')) {
                if (family.config.roots.includes(args.node.id)) {
                    family.config.roots = [];
                    setRoots([]);
                    family.draw();
                    return false;
                }

                family.config.roots = [args.node.id];
                setRoots([args.node.id]);
                family.draw();
                return false;
            }
        });

        // Customize nodes
        family.onField((args: {name: string; value: string; data: FamilyNode}) => {
            // Add links to nodes
            if (args.name === 'name' && args.data.link) {
                const name = args.data.name;
                const link = args.data.link;
                args.value = `<a style="fill: #ffffff;" target="_blank" href="${link}">${name}</a>`;
            }

            // Add icons to nodes
            if (args.name === 'type') {
                switch (args.data.type) {
                    case 'patriarch':
                        args.value = '👨‍👧‍👦';
                        break;
                    case 'prophet':
                        args.value = '📖';
                        break;
                    case 'priest':
                        args.value = '🙏';
                        break;
                    case 'king':
                        args.value = '👑';
                        break;
                    case 'nation':
                        args.value = '🌐';
                        break;
                    default:
                        args.value = '👤';
                        break;
                }
            }
        });

        // Init
        family.load(nodes);
    }, []);

    return <div ref={containerRef} className={styles.container} data-has-roots={roots.length > 0}></div>;
};
