import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth"
import { AuthProvider, FireStore, GoogleProvider } from "@/utils/api/firebase"
import { useMutation, useQuery } from "@tanstack/react-query";
import { doc, Firestore, getDoc, setDoc } from "firebase/firestore";
import { LoginForm } from "@/types/validation/login";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SignUpForm } from "@/types/validation/signUp";
import { User } from "@/types/entities/User";
import { AccountTypes } from "@/types/enums/AccountsTypes";
import useUserStore from "@/store/UserStore";
import { AccountProviders } from "@/types/enums/AccountProviders";

export const loginWithEmail = async (data: LoginForm) => {
    const result = await signInWithEmailAndPassword(AuthProvider, data.email, data.password);
    const user = result.user;

    return {
        status: 200,
        uid: user.uid
    }
}

export const createWithEmail = async (data: SignUpForm) => {
    const result = await createUserWithEmailAndPassword(AuthProvider, data.email, data.password);
    const user = result.user;

    const docRef = doc(FireStore, "users", user.uid);
    const userToSet: Partial<User> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        displayName: data.firstName + data.lastName,
        accountType: AccountTypes.BASIC,
        provider: AccountProviders.EMAIL,
        createdAt: new Date(),
        fullName: data.firstName + data.lastName,
        photoUrl: user.photoURL,
        uid: user.uid,
        updatedAt: new Date()
    }

    await setDoc(docRef, userToSet);

    return {
        message: "Cadastrado com sucesso",
        status: 201
    }
}

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(AuthProvider, GoogleProvider);
    if (result.user) {
        const user = result.user;

        const userToSet: User = {
            firstName: "",
            lastName: "",
            email: user.email,
            displayName: user.displayName,
            accountType: AccountTypes.BASIC,
            provider: AccountProviders.GOOGLE,
            createdAt: new Date(),
            fullName: "",
            photoUrl: user.photoURL,
            uid: user.uid,
            updatedAt: new Date()
        }

        await setDoc(doc(FireStore, "users", result.user.uid), userToSet);
    }
    return {
        status: 200,
        uid: result.user.uid
    }
}

export const useLoginWithGoogle = () => {
    const navigation = useNavigate();
    const { setUid } = useUserStore();

    return useMutation({
        mutationFn: loginWithGoogle,
        onSuccess: ({ uid }) => {
            toast({
                title: "Bem-vindo!",
                description: " Vocé fez login com o google com sucesso.",
            })

            setUid(uid)
            navigation("/dashboard", { replace: true });
        }
    })
}

export const useLoginWithEmail = () => {
    return useMutation({
        mutationFn: loginWithEmail
    })
}

export const useCreateWithEmail = () => {
    return useMutation({
        mutationFn: createWithEmail
    })
}

export const getUserData = async (id: string) => {
    const docRef = doc(FireStore, "users", id)
    const docSnap = await getDoc(docRef)

    return docSnap.exists() ? (docSnap.data()) : null;
}

export const useGetUserData = (id: string | undefined) => {
    return useQuery({
        queryKey: ["user", id],
        queryFn: () => getUserData(id),
        enabled: !!id
    })
}

export const logout = async () => {
    await signOut(AuthProvider);
}