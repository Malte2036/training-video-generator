import Link from 'next/link';

export default function Header() {
	return (
		<>
			<Link href={'/videos'}>VideosPage</Link>{' '}
			<Link href={'/videos/parts'}>VideoPartsPage</Link>
		</>
	);
}
