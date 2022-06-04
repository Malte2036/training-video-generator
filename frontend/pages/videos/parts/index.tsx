import { AppwriteContext } from '@/contexts/AppwriteContext';
import { VideoPart } from '@/models/VideoPart';
import {
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

export default function VideoPartsPage() {
	const appwrite = useContext(AppwriteContext);
	const router = useRouter();

	const [videoParts, setVideoParts] = useState<VideoPart[]>([]);

	useEffect(() => {
		appwrite.database
			.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_PARTS_ID ?? ''
			)
			.then((docs) => {
				setVideoParts(docs.documents.map((doc) => doc as VideoPart));
			});
	}, [appwrite.database]);

	return (
		<>
			<h1>VideoPartsPage</h1>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>youtubeId</TableCell>
							<TableCell>start</TableCell>
							<TableCell>end</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{videoParts.map((videoPart) => (
							<TableRow key={videoPart.$id}>
								<TableCell
									onClick={async () => {
										if (videoPart.storageId) {
											const filePreviewUrl = appwrite.storage.getFileView(
												process.env
													.NEXT_PUBLIC_APPWRITE_BUCKET_VIDEO_PARTS_ID ?? '',
												videoPart.storageId
											);
											router.push(filePreviewUrl);
										} else {
											router.reload();
										}
									}}
								>
									<span style={{ cursor: 'pointer' }}>
										{videoPart.youtubeVideoId}
									</span>
								</TableCell>
								<TableCell>{videoPart.start}</TableCell>
								<TableCell>{videoPart.end}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<br />
			<Button onClick={() => router.push('/videos/parts/add')}>
				Create new
			</Button>
		</>
	);
}
