import {Metadata} from 'next';
import Script from 'next/script';
import {promises as fs} from 'fs';
import * as yaml from 'js-yaml';
import {FamilyNode} from '@/lib/types';
import {FamilyTree} from '@/components/FamilyTree';

export default async function Page() {
    const file = await fs.readFile(process.cwd() + '/src/app/data.yaml', 'utf8');
    const data = yaml.load(file) as {nodes: FamilyNode[]};

    return (
        <main>
            <FamilyTree data={data.nodes} />
            <Script src="https://www.biblegateway.com/public/link-to-us/tooltips/bglinks.js" />
        </main>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Bible Tree',
        description: 'A Bible family tree.',
    };
}
