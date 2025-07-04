import { useState } from "react";
import { signOut } from "firebase/auth";
import { AuthProvider, FireStore } from "@/utils/api/firebase";
import { User } from "@/types/entities/User";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/store/UserStore";

export function useAuth() {    
    const { addUser, removeUser, user } = useUserStore();    
    const navigate = useNavigate();

    // const handleUpdateUser = async (user: User) => {
    //     setLoading(true)
    //     const docRef = doc(FireStore, "users", user.uid);
    //     const docSnap = await getDoc(docRef);

    //     if (!docSnap.exists()) {
    //         await setDoc(docRef, user);
    //     } else {
    //         await updateDoc(docRef, {
    //             updatedAt: new Date(),
    //         });
    //     }

    //     addUser(user);
    //     setLoading(false);
    // }

    // const logout = async () => {
    //     await signOut(AuthProvider);
    //     removeUser()
    //     navigate("/oauth/login");
    // };

    // const checkActualUser = async () => {
    //     if(FirebaseActualUser) {            
    //         const docRef = doc(FireStore, "users", FirebaseActualUser.uid);
    //         const docSnap = await getDoc(docRef);

    //         if (docSnap.exists()) {
    //             // const userData = docSnap.data() as User;
                
    //         }
    //     }
    // }

    return {
        // user,
        // handleUpdateUser,
        // checkActualUser,
        // loading,
        // setLoading,
        // logout,
        // isAuthenticated: !!user,
    };
}
