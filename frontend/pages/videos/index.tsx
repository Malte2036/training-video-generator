import GenerateRandomVideoForm from '@/components/GenerateRandomVideoForm';
import {FirebaseContext} from '@/contexts/FirebaseContext';
import {
    GeneratedVideo,
    generatedVideoConverter,
} from '@/models/GeneratedVideo';
import {
    Alert,
    Button,
    Checkbox,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';
import {getDownloadURL, ref} from 'firebase/storage';
import {useRouter} from 'next/router';
import {useContext, useEffect, useState} from 'react';
import {VideoPart, videoPartConverter} from "@/models/VideoPart";
import {YoutubeVideoMetadata, youtubeVideoMetadataConverter} from '@/models/YoutubeVideoMetadata';

export type AlertData = {
    message: string;
    onClose?: () => void;
};

function VideosPage() {
    const firebaseContext = useContext(FirebaseContext);
    const router = useRouter();

    const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

    const [videoParts, setVideoParts] = useState<VideoPart[]>([]);
    const [youtubeVideoMetadatas, setYoutubeVideoMetadatas] = useState<YoutubeVideoMetadata[]>([]);

    const [alertData, setAlertData] = useState<AlertData | undefined>(undefined);

    const [debug] = useState<boolean>(router.query.hasOwnProperty("debug"))

    useEffect(() => {
        const fetchGeneratedVideos = async () => {
            const querySnapshot = await getDocs(
                collection(firebaseContext.db, 'GeneratedVideos')
            );
            setGeneratedVideos(
                querySnapshot.docs.map((doc) =>
                    generatedVideoConverter.fromFirestore(doc, undefined)
                )
            );
        };
        fetchGeneratedVideos();

        const unsubscribe = onSnapshot(
            collection(firebaseContext.db, 'GeneratedVideos'),
            (querySnapshot) => {
                setGeneratedVideos(
                    querySnapshot.docs.map((doc) =>
                        generatedVideoConverter.fromFirestore(doc, undefined)
                    )
                );
            }
        );
        return () => unsubscribe();
    }, [firebaseContext.db]);


    useEffect(() => {
        const fetchVideoParts = async () => {
            const querySnapshot = await getDocs(
                collection(firebaseContext.db, 'VideoParts')
            );
            setVideoParts(
                querySnapshot.docs.map((doc) =>
                    videoPartConverter.fromFirestore(doc, undefined)
                )
            );
        };
        fetchVideoParts();
    }, [firebaseContext.db]);

    useEffect(() => {
        const fetchYoutubeVideoMetadata = async () => {
            const querySnapshot = await getDocs(
                collection(firebaseContext.db, 'YoutubeVideoMetadata')
            );
            setYoutubeVideoMetadatas(
                querySnapshot.docs.map((doc) =>
                    youtubeVideoMetadataConverter.fromFirestore(doc, undefined)
                )
            );
        };
        fetchYoutubeVideoMetadata();
    }, [firebaseContext.db, videoParts]);

    function getIncludedVideoMetadatasByGeneratedVideo(video: GeneratedVideo): YoutubeVideoMetadata[] {
        const includedVideoPartIds = videoParts.filter(videoPart => video.videoPartIds.includes(videoPart.$id))
            .map(videoPart => videoPart.youtubeVideoId)

        return youtubeVideoMetadatas.filter(metadata => includedVideoPartIds.includes(metadata.$id))
    }

    function getVideoLength(video: GeneratedVideo): string {
        const length = video.videoPartIds.map(id => videoParts.find(videoPart => videoPart.$id === id))
            .filter(videoPart => videoPart !== undefined)
            .map(videoPart => videoPart!.end - videoPart!.start)
            .reduce<number>((accumulator, current) => {
                return accumulator + current;
            }, 0)
        return `${parseInt((length / 60).toString())}:${length % 60}`
    }

    return (
        <div>
            <br/>
            <Snackbar open={alertData != undefined} autoHideDuration={10000} onClose={() => {
                if (alertData?.onClose) {
                    alertData?.onClose();
                }
                setAlertData(undefined);
            }}>
                <Alert
                    severity="success" sx={{width: '100%'}}>
                    {alertData?.message}
                </Alert>
            </Snackbar>

            <h1>VideosPage</h1>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>timestamp</TableCell>
                            {debug && <TableCell>videoPartIds</TableCell>}
                            <TableCell>includedVideos</TableCell>
                            <TableCell>videoLength</TableCell>
                            <TableCell>state</TableCell>
                            {debug && <TableCell>storageId</TableCell>}
                            <TableCell>mergedVideoPartsPercent</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {generatedVideos
                            .sort(
                                (a, b) =>
                                    (a.timestamp?.toMillis() ?? 0) -
                                    (b.timestamp?.toMillis() ?? 0)
                            )
                            .map((video) => (
                                <TableRow key={video.$id} style={video.done ? {opacity: 0.3} : undefined}>
                                    <TableCell>
                                        <Checkbox
                                            checked={video.done}
                                            onClick={async () => await updateDoc(doc(firebaseContext.db, 'GeneratedVideos', video.$id), {
                                                done: !video.done
                                            })}/>
                                    </TableCell>
                                    <TableCell>
                                        {video.timestamp?.toDate().toLocaleString() ?? 'unknown'}
                                    </TableCell>
                                    {debug && <TableCell>
                                        {video.videoPartIds.map((id) => (
                                            <span key={id} style={{cursor: 'pointer'}}>
                                        {`${id}, `}
                                        </span>
                                        ))}
                                    </TableCell>}
                                    <TableCell>
                                        {
                                            getIncludedVideoMetadatasByGeneratedVideo(video).map(youtubeVideoMetadata => youtubeVideoMetadata.title)
                                                .join(', ')
                                        }
                                    </TableCell>
                                    <TableCell>{getVideoLength(video)}min</TableCell>
                                    <TableCell>{video.state}</TableCell>
                                    {debug && <TableCell>{video.storageId}</TableCell>}
                                    <TableCell>{video.mergeVideoPartsPercent && `${video.mergeVideoPartsPercent}%`}</TableCell>
                                    <TableCell>
                                        {video.storageId && (
                                            <Button
                                                onClick={async () => {
                                                    if (video.storageId) {
                                                        const pathReference = ref(
                                                            firebaseContext.storage,
                                                            video.storageId
                                                        );
                                                        const url = await getDownloadURL(pathReference);
                                                        router.push(url);
                                                    }
                                                }}
                                            >
                                                view
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={async () => {
                                                await deleteDoc(
                                                    doc(firebaseContext.db, 'GeneratedVideos', video.$id)
                                                );
                                            }}
                                        >
                                            delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <br/>
            <GenerateRandomVideoForm setAlertData={setAlertData}/>
        </div>
    );
}

export default VideosPage;
