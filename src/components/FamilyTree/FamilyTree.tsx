'use client';

import {FC, useCallback, useLayoutEffect, useRef, useState} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {OrgChart} from 'd3-org-chart';
import {FamilyNode, nodeCategory, nodeGender, nodeType} from '@/lib/types';
import {FamilyNodeContent} from './FamilyNodeContent';
import {SearchInput as SearchInputBase} from './SearchInput';
import {Button, ButtonGroup as ButtonGroupBase, Popover, styled} from '@mui/material';
import {UnfoldLess, UnfoldMore, ZoomOutMap, HighlightOff, FilterAlt} from '@mui/icons-material';
import {FilterToggles, FilterTogglesRef, FilterTogglesState} from './FilterToggles';
import {NotesDrawer} from './NotesDrawer';

interface Props {
    data: FamilyNode[];
}

declare global {
    interface Window {
        BGLinks: any;
    }
}

export const FamilyTree: FC<Props> = ({data}) => {
    const d3Container = useRef<HTMLDivElement>(null);
    const chart = useRef<OrgChart<FamilyNode> | null>();
    const genderToggleRef = useRef<FilterTogglesRef>(null);
    const categoryToggleRef = useRef<FilterTogglesRef>(null);
    const typeToggleRef = useRef<FilterTogglesRef>(null);
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchSelectedNode, setSearchSelectedNode] = useState<FamilyNode | null>(null);
    const [highlightedNode, setHighlightedNode] = useState<FamilyNode | null>(null);
    const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [filters, setFilters] = useState<string[]>([...nodeGender, ...nodeCategory, ...nodeType]);
    const [selectedNode, setSelectedNode] = useState<FamilyNode | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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
        if (!chart.current || !genderToggleRef.current || !categoryToggleRef.current || !typeToggleRef.current) return;

        const data = chart.current.data() || [];

        // Mark all previously expanded nodes for collapse
        data.forEach((d) => (d._dimmed = false));

        // Reset the toggles
        genderToggleRef.current.reset();
        categoryToggleRef.current.reset();
        typeToggleRef.current.reset();

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

                return;
            }

            // Handle heading click (open drawer)
            if (target.classList.contains('btr-node-heading')) {
                const data = chart.current.data() || [];
                const id = Number(target.getAttribute('data-node-id'));
                setSelectedNode(data.find((d) => d.id === id) || null);
                setIsDrawerOpen(true);

                setTimeout(() => {
                    window.BGLinks.version = 'ESV';
                    window.BGLinks.linkVerses();
                }, 300);

                return;
            }

            // Handle node icon click (highlight up)
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

            // Handle container click (highlight down)
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

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selectedNode) {
                setSelectedNode(null);
            }
        }, 300);
    };

    const handleFiltering = (value: FilterTogglesState) => {
        if (!chart.current) return;

        // Get options to add and remove from value
        const options = Object.keys(value).reduce<{add: string[]; remove: string[]}>(
            (acc, key) => {
                if (value[key] === true) {
                    acc['add'].push(key);
                } else {
                    acc['remove'].push(key);
                }
                return acc;
            },
            {add: [], remove: []}
        );

        // Dedupe and remove unselected
        const newFilters = Array.from(new Set([...filters, ...options.add])).filter((f) => !options.remove.includes(f));

        // Set the state
        setFilters(newFilters);

        // Get the data
        const data = chart.current.data() || [];

        // Prepare the data to dim (the unselected options)
        const filtered = data.filter(
            (d) => !newFilters.includes(d.gender) || !newFilters.includes(d.category) || !newFilters.includes(d.type)
        );

        // Show all previously dimmed nodes
        data.forEach((d) => (d._dimmed = false));

        // Dim the nodes
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
                    <ActionButton onClick={handleExpandAll} title="Expand All" aria-label="Expand All">
                        <UnfoldMore />
                    </ActionButton>
                    <ActionButton onClick={handleCollapseAll} title="Collapse All" aria-label="Collapse All">
                        <UnfoldLess />
                    </ActionButton>
                    <ActionButton onClick={handleFit} title="Fit to Viewport" aria-label="Fit to Viewport">
                        <ZoomOutMap />
                    </ActionButton>
                    <ActionButton onClick={handleReset} title="Reset" aria-label="Reset">
                        <HighlightOff />
                    </ActionButton>
                    <ActionButton onClick={handleShowFilters} title="Filter" aria-label="Filter">
                        <FilterAlt />
                    </ActionButton>
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
                <FilterToggles
                    ref={genderToggleRef}
                    options={nodeGender as unknown as string[]}
                    onChange={handleFiltering}
                />
                <FilterToggles
                    ref={categoryToggleRef}
                    options={nodeCategory as unknown as string[]}
                    onChange={handleFiltering}
                />
                <FilterToggles
                    ref={typeToggleRef}
                    options={nodeType as unknown as string[]}
                    onChange={handleFiltering}
                />
            </FilterTogglesWindow>
            <NotesDrawer
                open={isDrawerOpen}
                heading={selectedNode?.name || ''}
                text={selectedNode?.notes || 'No notes.'}
                onClose={handleDrawerClose}
            />
            <Canvas ref={d3Container} />
        </div>
    );
};

const Header = styled('div')(({theme}) => ({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    padding: 20,
    position: 'fixed',
    width: '100%',
    pointerEvents: 'none',

    [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
    },
}));

const ButtonGroup = styled(ButtonGroupBase)(({theme}) => ({
    pointerEvents: 'auto',
    width: '100%',

    [theme.breakpoints.up('sm')]: {
        width: 'auto',
    },
}));

const ActionButton = styled(Button)(({theme}) => ({
    [theme.breakpoints.down('sm')]: {
        flex: 1,
    },
}));

const SearchInput = styled(SearchInputBase)(({theme}) => ({
    pointerEvents: 'auto',

    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const Canvas = styled('div')({
    '& > .svg-chart-container': {
        height: '100vh',
    },
});

const FilterTogglesWindow = styled(Popover)({
    '.MuiPaper-root': {
        padding: '10px 15px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'row',
    },
});
