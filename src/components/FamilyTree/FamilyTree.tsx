'use client';

import {FC, useCallback, useLayoutEffect, useRef, useState} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {OrgChart} from 'd3-org-chart';
import {FamilyNode} from '@/lib/types';
import {FamilyNodeContent} from './FamilyNodeContent';
import {SearchInput} from './SearchInput';
import {Button, ButtonGroup, Popover, styled} from '@mui/material';
import {UnfoldLess, UnfoldMore, ZoomOutMap, RestartAlt, FilterAlt} from '@mui/icons-material';
import {FilterToggles, FilterTogglesRef, FilterTogglesState} from './FilterToggles';

interface Props {
    data: FamilyNode[];
}

export const FamilyTree: FC<Props> = ({data}) => {
    const d3Container = useRef<HTMLDivElement>(null);
    const chart = useRef<OrgChart<FamilyNode> | null>();
    const genderToggleRef = useRef<FilterTogglesRef>(null);
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchSelectedNode, setSearchSelectedNode] = useState<FamilyNode | null>(null);
    const [highlightedNode, setHighlightedNode] = useState<FamilyNode | null>(null);
    const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleExpandAll = () => {
        if (!chart.current) return;

        setSearchValue('');
        setSearchSelectedNode(null);
        chart.current.expandAll().clearHighlighting();

        if (highlightedNode) {
            chart.current.setCentered(highlightedNode.id).render();
        }

        setHighlightedNode(null);
    };

    const resetFilters = () => {
        if (!chart.current || !genderToggleRef.current) return;

        const data = chart.current.data() || [];

        // Mark all previously expanded nodes for collapse
        data.forEach((d) => (d._dimmed = false));

        // Reset the toggles
        genderToggleRef.current.reset();

        // Update data and rerender graph
        chart.current.data(data).render();
    };

    const handleCollapseAll = () => {
        if (!chart.current) return;

        setSearchValue('');
        setSearchSelectedNode(null);
        setHighlightedNode(null);
        chart.current.collapseAll().clearHighlighting().initialZoom(1).setCentered(1).render();
    };

    const handleSearchChange = (node?: FamilyNode) => {
        if (!chart.current || !node) return;

        setSearchSelectedNode(node);

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
        setSearchSelectedNode(null);
        setHighlightedNode(null);
        chart.current.clearHighlighting();
    };

    const handleFit = () => {
        if (!chart.current) return;

        chart.current.fit();
    };

    const handleReset = () => {
        if (!chart.current) return;

        resetFilters();
        handleClearSearchInput();
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

    const handleGenderFilter = (value: FilterTogglesState) => {
        if (!chart.current) return;

        const data = chart.current.data() || [];
        const filtered = data.filter((d) => !value[d.gender]);

        // Mark all previously expanded nodes for collapse
        data.forEach((d) => (d._dimmed = false));

        // Find the nodes and toggle the highlighting
        filtered.forEach((d) => {
            d._dimmed = true;
        });

        // Update data and rerender graph
        chart.current.data(data).render();
    };

    const handleShowFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
        setFiltersAnchorEl(event.currentTarget);
    };

    const handleHideFilters = () => {
        setFiltersAnchorEl(null);
    };

    /**
     * Get all the descendants of a node.
     */
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

    // Initialize the chart
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

    // Add event listeners
    useLayoutEffect(() => {
        document.addEventListener('click', handleNodeClick);

        return () => {
            document.removeEventListener('click', handleNodeClick);
        };
    }, [handleNodeClick]);

    return (
        <div>
            <Header>
                <ButtonGroup variant="contained" aria-label="Basic button group">
                    <Button onClick={handleExpandAll}>
                        <UnfoldMore />
                    </Button>
                    <Button onClick={handleCollapseAll}>
                        <UnfoldLess />
                    </Button>
                    <Button onClick={handleFit}>
                        <ZoomOutMap />
                    </Button>
                    <Button onClick={handleReset}>
                        <RestartAlt />
                    </Button>
                    <Button onClick={handleShowFilters}>
                        <FilterAlt />
                    </Button>
                </ButtonGroup>
                <SearchInput
                    data={data}
                    value={searchSelectedNode}
                    inputValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onSearchInputChange={handleSearchInputChange}
                    onClearSearchInput={handleClearSearchInput}
                />
            </Header>
            <FilterTogglesWindow
                id={Boolean(filtersAnchorEl) ? 'btr-filter-toggle-window' : undefined}
                open={Boolean(filtersAnchorEl)}
                anchorEl={filtersAnchorEl}
                keepMounted={true}
                onClose={handleHideFilters}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <FilterToggles ref={genderToggleRef} options={['male', 'female']} onChange={handleGenderFilter} />
            </FilterTogglesWindow>
            <Canvas ref={d3Container} />
        </div>
    );
};

const Header = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20,
});

const Canvas = styled('div')({
    '& > .svg-chart-container': {
        height: '100vh',
    },
});

const FilterTogglesWindow = styled(Popover)({
    '.MuiPaper-root': {
        padding: '10px 15px',
        borderRadius: '8px',
    },
});
