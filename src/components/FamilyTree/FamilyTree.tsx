'use client';

import {FC, useCallback, useLayoutEffect, useRef, useState} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {OrgChart} from 'd3-org-chart';
import {FamilyNode} from '@/lib/types';
import {FamilyNodeContent} from './FamilyNodeContent';
import {SearchInput} from './SearchInput';
import styles from './styles.module.scss';

interface Props {
    data: FamilyNode[];
}

export const FamilyTree: FC<Props> = ({data}) => {
    const d3Container = useRef<HTMLDivElement>(null);
    const chart = useRef<OrgChart<FamilyNode> | null>();
    const [searchValue, setSearchValue] = useState<string>('');
    const [highlightedNode, setHighlightedNode] = useState<FamilyNode | null>(null);

    const handleExpandAll = () => {
        if (!chart.current) return;

        setSearchValue('');
        chart.current.expandAll().clearHighlighting();

        if (highlightedNode) {
            chart.current.setCentered(highlightedNode.id).render();
        }

        setHighlightedNode(null);
    };

    const handleCollapseAll = () => {
        if (!chart.current) return;

        setSearchValue('');
        setHighlightedNode(null);
        chart.current.collapseAll().clearHighlighting().initialZoom(1).setCentered(1).render();
    };

    const handleSearchChange = (node?: FamilyNode) => {
        if (!chart.current || !node) return;

        chart.current
            .clearHighlighting()
            .setHighlighted(node.id)
            .expandAll()
            .setCentered(node.id)
            .initialZoom(0.75)
            .render();
    };

    const handleSearchInputChange = (value: string) => {
        setSearchValue(value);
    };

    const handleClearSearchInput = () => {
        if (!chart.current) return;

        setSearchValue('');
        setHighlightedNode(null);
        chart.current.clearHighlighting();
    };

    const handleFit = () => {
        if (!chart.current) return;

        chart.current.fit();
    };

    const handleNodeClick = useCallback(
        (e: MouseEvent) => {
            if (!chart.current) return;

            const target = e.target as HTMLElement;

            // Handle click away
            if (target.classList.contains('svg-chart-container')) {
                setHighlightedNode(null);
                chart.current.clearHighlighting();
            }

            // Handle node icon click
            if (target.classList.contains('btr-node-container')) {
                const data = chart.current.data() || [];
                const id = Number(target.getAttribute('data-node-id'));
                const descendants = getDescendants(data, id);

                chart.current.clearHighlighting();

                // Mark all previously expanded nodes for collapse
                data.forEach((d) => (d._expanded = false));

                // Find the nodes and toggle the highlighting
                descendants.forEach((d, index) => {
                    if (index === 0) {
                        d._highlighted = true;
                        setHighlightedNode(d);
                    } else {
                        d._upToTheRootHighlighted = true;
                    }
                    d._expanded = true;
                });

                // Update data and rerender graph
                chart.current.data(data).setCentered(id).render();

                return;
            }

            // Handle container click
            if (target.classList.contains('btr-node-icon')) {
                const data = chart.current.data() || [];
                const id = Number(target.getAttribute('data-node-id'));
                chart.current.clearHighlighting().setUpToTheRootHighlighted(id).render();
                setHighlightedNode(data.find((d) => d.id === id) || null);

                return;
            }
        },
        [chart]
    );

    const getDescendants = (nodes: FamilyNode[], id: number) => {
        const descendants = nodes.filter((node) => node.id === id);

        function findChildren(parentId: number) {
            nodes.forEach((node) => {
                if (node.parentId === parentId) {
                    descendants.push(node);
                    findChildren(node.id);
                }
            });
        }

        findChildren(id);
        return descendants;
    };

    useLayoutEffect(() => {
        if (data && d3Container.current) {
            if (!chart.current) {
                chart.current = new OrgChart();
            }

            chart.current
                .container(d3Container.current as any)
                .compact(false)
                .data(data)
                .nodeWidth(() => 300)
                .nodeHeight(() => 150)
                .nodeContent(({data}) => {
                    return renderToStaticMarkup(<FamilyNodeContent node={data} />);
                })
                .expandAll()
                .render();
        }
    }, [data, chart, d3Container]);

    useLayoutEffect(() => {
        document.addEventListener('click', handleNodeClick);

        return () => {
            document.removeEventListener('click', handleNodeClick);
        };
    }, [handleNodeClick]);

    return (
        <div className={styles.container}>
            <button onClick={handleExpandAll}>Expand All</button>
            <button onClick={handleCollapseAll}>Collapse All</button>
            <button onClick={handleFit}>Fit to Window</button>
            <SearchInput
                data={data}
                inputValue={searchValue}
                onSearchChange={handleSearchChange}
                onSearchInputChange={handleSearchInputChange}
                onClearSearchInput={handleClearSearchInput}
            />
            <div className={styles.canvas} ref={d3Container} />
        </div>
    );
};
