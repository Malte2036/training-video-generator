import { Appwrite } from "appwrite";
import { createContext } from "react";

export const appwrite = new Appwrite();
appwrite.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL ?? "");
appwrite.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "");

export const AppwriteContext = createContext(appwrite);