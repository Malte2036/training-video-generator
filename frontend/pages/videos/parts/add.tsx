import { AppwriteContext } from "@/contexts/AppwriteContext"
import { Button, Input } from "@mui/material"
import { useRouter } from "next/router"
import { FormEvent, useContext, useState } from "react"

function AddVideoPartPage() {
    const appwrite = useContext(AppwriteContext)
    const router = useRouter();

    const [youtubeVideoId, setYoutubeVideoId] = useState<string>("")
    const [start, setStart] = useState<number | null>()
    const [end, setEnd] = useState<number | null>()

    async function createVideoPart(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        appwrite.database.createDocument(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_PARTS_ID ?? "", "unique()", { youtubeVideoId, start, end }).then(() => {
            router.push("/videos/parts")
        })
    }

    return <>
        <h1>AddVideoPartPage</h1>
        <form onSubmit={(event) => createVideoPart(event)}>
            <Input placeholder="youtubeVideoId" required value={youtubeVideoId} onChange={(event) => setYoutubeVideoId(event.target.value)}></Input>
            <Input placeholder="start" type={"number"} required value={start ?? ""} onChange={(event) => setStart(Number.parseInt(event.target.value))}></Input>
            <Input placeholder="end" type={"number"} required value={end ?? ""} onChange={(event) => setEnd(Number.parseInt(event.target.value))}></Input>
            <Button type="submit">Submit</Button>
        </form>
    </>
}

export default AddVideoPartPage
