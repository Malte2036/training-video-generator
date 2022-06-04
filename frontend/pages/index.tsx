import { AppwriteContext } from "@/contexts/AppwriteContext";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useContext } from "react";

function HomePage() {
  const appwrite = useContext(AppwriteContext);

  const router = useRouter();

  return (
    <div>
      Welcome to Next.js!
      <Button
        onClick={async () => {
          await appwrite.account.deleteSessions();
          router.reload();
        }}
      >
        Logout
      </Button>
    </div>
  );
}

export default HomePage;
