import { AppwriteContext } from "@/contexts/AppwriteContext"
import { FormEvent, useContext, useState } from "react"

function AddVideoPartPage() {
    const appwrite = useContext(AppwriteContext)

    const [youtubeVideoId, setYoutubeVideoId] = useState<string>("")
    const [start, setStart] = useState<number | null>()
    const [end, setEnd] = useState<number | null>()

    async function createVideoPart(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        appwrite.database.createDocument(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_PARTS_ID ?? "", "unique()", { youtubeVideoId, start, end })
    }

    return <>
        <h1>AddVideoPartPage</h1>
        <form onSubmit={(event) => createVideoPart(event)}>
            <input placeholder="youtubeVideoId" required value={youtubeVideoId} onChange={(event) => setYoutubeVideoId(event.target.value)}></input>
            <input placeholder="start" type={"number"} required value={start ?? ""} onChange={(event) => setStart(Number.parseInt(event.target.value))}></input>
            <input placeholder="end" type={"number"} required value={end ?? ""} onChange={(event) => setEnd(Number.parseInt(event.target.value))}></input>
            <button type="submit">Submit</button>
        </form>
    </>
}

export default AddVideoPartPage
