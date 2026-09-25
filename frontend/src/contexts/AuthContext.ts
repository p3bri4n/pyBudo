import {createContext} from "react";
import type { AuthContextType } from "../interfaces/interfaces";

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);
