import {Metadata} from 'next';
import {promises as fs} from 'fs';
import {FamilyTree} from '@/components/FamilyTree';

export default async function Page() {
    const file = await fs.readFile(process.cwd() + '/src/app/data.json', 'utf8');
    const data = JSON.parse(file);
    const nodes = data.nodes;

    return (
        <main>
            <FamilyTree nodes={nodes} />
        </main>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Bible Tree',
        description: 'A Bible family tree.',
        robots: {
            index: false,
            follow: false,
        },
    };
}
