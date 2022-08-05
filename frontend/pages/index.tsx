import {FirebaseContext} from '@/contexts/FirebaseContext';
import {Button} from '@mui/material';
import {useRouter} from 'next/router';
import {useContext} from 'react';

function HomePage() {
    const firebaseContext = useContext(FirebaseContext);
    const router = useRouter();

    return (
        <div>
            <h1>
                Welcome to Training-Web {firebaseContext.auth.currentUser?.displayName}
            </h1>
            <span>{firebaseContext.auth.currentUser?.uid}</span>
            <br/>
            <br/>
            <Button
                onClick={async () => {
                    await firebaseContext.auth.signOut();
                    router.reload();
                }}
            >
                Logout
            </Button>
        </div>
    );
}

export default HomePage;
