'use client';

import {useCallback, useEffect, useRef} from 'react';
import FamilyTree from './familytree';
import {FamilyNode} from '@/lib/types/FamilyNode';
import styles from './styles.module.scss';

interface Props {
    nodes: FamilyNode[];
}

export const Tree = ({nodes}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const family = useRef<FamilyTree | null>(null);

    const getIconTemplate = useCallback(
        () => `
        <text x="215" y="30" class="btr-node-icon">
            <a class="btr-node-icon-link"
            onclick="event.preventDefault();"
            href="#">{val}</a>
        </text>
        `,
        []
    );

    const getNotesTextAreaElement = useCallback(
        (
            data: {[key: string]: string[]},
            editElement: {label: string; binding: string},
            minWidth: number,
            readOnly: boolean
        ) => {
            const id = FamilyTree.elements.generateId();
            const {label, binding} = editElement;
            const value: string[] = data[binding] || [];
            const items = value.map((v: string) => `<li>${v}</li>`).join('');

            let html = `<label for="${id}" class="btr-edit-label">${label}</label>`;

            if (items.length > 0) {
                html += `<ul class="btr-notes-list">${items}</ul>`;
            } else {
                html += `<ul class="btr-notes-list"><li>No notes.</li></ul>`;
            }

            return {html, id, value};
        },
        []
    );

    const getLinkTextElement = useCallback(
        (
            data: {[key: string]: string},
            editElement: {label: string; binding: string},
            minWidth: number,
            readOnly: boolean
        ) => {
            const id = FamilyTree.elements.generateId();
            const value: string | undefined = data[editElement.binding];

            let html = '';

            if (value) {
                html = `<a class="btr-link-text" target="_blank" href="${value}">View More</a>`;
            }

            return {html, id, value};
        },
        []
    );

    const handleSearchClick = useCallback(
        (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (!family.current || target.classList.contains('bft-link')) return;

            const inSearchInput = !!target.closest('.bft-search');

            // Reset roots when the search input is focused
            if (inSearchInput) {
                family.current.config.roots = [];
                family.current.draw();
            } else {
                // Otherwise, close the search input
                const closeBtn: HTMLAnchorElement | null = document.querySelector('.bft-search .bft-link');
                closeBtn && closeBtn.click();
            }
        },
        [family]
    );

    const handleNodeClick = useCallback(
        (args: {node: FamilyTree.node; event: React.MouseEvent}) => {
            if (!family.current || !args.node.id) return;

            const target = args.event.target as HTMLElement;

            // Toggle the roots when clicking the node icon
            if (target.classList.contains('btr-node-icon-link')) {
                if (family.current.config.roots && family.current.config.roots.includes(args.node.id)) {
                    family.current.config.roots = [];
                    family.current.draw();
                    return false;
                }

                family.current.config.roots = [args.node.id];
                family.current.draw();
                return false;
            }
        },
        [family]
    );

    const handleNodeFieldCustomizations = useCallback(
        (args: {node: FamilyTree.node; data: object; value: string; element: string; name: string; field: string}) => {
            const data = args.data as FamilyNode;

            // Add links to nodes
            if (args.name === 'name' && data.link) {
                const name = data.name;
                const link = data.link;
                args.value = `<a style="fill: #ffffff;" target="_blank" href="${link}">${name}</a>`;
            }

            // Add icons to nodes
            if (args.name === 'type') {
                switch (data.type) {
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
        },
        []
    );

    const loadTemplate = useCallback(() => {
        // Search
        FamilyTree.SEARCH_PLACEHOLDER = 'Search';

        // Template
        FamilyTree.templates.tommy_male.icon = getIconTemplate();
        FamilyTree.templates.tommy_female.icon = getIconTemplate();

        // Elements
        FamilyTree.elements.notesTextArea = getNotesTextAreaElement;
        FamilyTree.elements.linkText = getLinkTextElement;
    }, [getIconTemplate, getNotesTextAreaElement, getLinkTextElement]);

    const getConfiguration = useCallback(
        () => ({
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
            mouseScrool: FamilyTree.action.yScroll,
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
        }),
        []
    );

    // Initialize FamilyTree
    useEffect(() => {
        if (!containerRef.current || family.current) return;

        // Load template
        loadTemplate();

        // Instantiate FamilyTree
        family.current = new FamilyTree(containerRef.current, getConfiguration());

        // Add event listeners
        document.addEventListener('click', handleSearchClick);
        family.current.onNodeClick(handleNodeClick);
        family.current.onField(handleNodeFieldCustomizations);

        // Init
        family.current.load(nodes);

        return () => {
            // Remove event listeners
            document.removeEventListener('click', handleSearchClick);
        };
    }, [
        containerRef,
        family,
        nodes,
        loadTemplate,
        getConfiguration,
        handleSearchClick,
        handleNodeClick,
        handleNodeFieldCustomizations,
    ]);

    return <div ref={containerRef} className={styles.container}></div>;
};
