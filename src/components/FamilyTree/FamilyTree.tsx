'use client';

import {FC, useLayoutEffect, useRef} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {OrgChart} from 'd3-org-chart';
import {FamilyNode} from '@/lib/types';
import {FamilyNodeContent} from './FamilyNodeContent';
import styles from './styles.module.scss';

interface Props {
    data: FamilyNode[];
}

export const FamilyTree: FC<Props> = ({data}) => {
    const d3Container = useRef<HTMLDivElement>(null);
    const chart = useRef<OrgChart<FamilyNode> | null>();

    const handleExpandAll = () => {
        if (chart.current) {
            chart.current.expandAll();
        }
    };

    const handleCollapseAll = () => {
        if (chart.current) {
            chart.current.collapseAll();
        }
    };

    useLayoutEffect(() => {
        if (data && d3Container.current) {
            if (!chart.current) {
                chart.current = new OrgChart();
            }

            chart.current
                .container(d3Container.current as any)
                .initialExpandLevel(12)
                .compact(false)
                .data(data)
                .nodeWidth(() => 300)
                .nodeHeight(() => 150)
                .nodeContent(({data}) => {
                    return renderToStaticMarkup(<FamilyNodeContent data={data} />);
                })
                .render();
        }
    }, [data, chart, d3Container.current]);

    return (
        <div className={styles.container}>
            <button onClick={handleExpandAll}>Expand All</button>
            <button onClick={handleCollapseAll}>Collapse All</button>
            <div className={styles.canvas} ref={d3Container} />;
        </div>
    );
};
