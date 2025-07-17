import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { FireStore } from "./firebase";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Plan {
    id?: string ;
    title: string;
    price: string;
    period?: string;
    features: (string | { value: string })[];
    isPopular?: boolean;    
}

const createPlan = async (data: Plan) => {
    const ref = collection(FireStore, 'plans');
    const docRef = await addDoc(ref, data);
    return docRef.id;
}

const updatePlan = async (id: string, data: Plan) => {
    const ref = doc(FireStore, 'plans', id);
    await updateDoc(ref, {...data});
}

const deletePlan = async (id: string) => {
    const ref = doc(FireStore, 'plans', id);
    await deleteDoc(ref);
}

const getPlans = async () => {
    const ref = collection(FireStore, 'plans');
    const snapshot = await getDocs(ref);  
    const mappedSnapshot = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));  
    return mappedSnapshot as Plan[];
}

const getPlan = async (id: string) => {
    const ref = doc(FireStore, 'plans', id);
    const docSnap = await getDoc(ref);
    return docSnap.exists() ? (docSnap.data() as Plan) : null;
}

export const useGetPlan = (id: string) => {    
    return useQuery({
        queryKey: ['plan', id],
        queryFn: () => getPlan(id),
        retry: false
    })
}

export const useGetPlans = () => {    
    return useQuery({
        queryKey: ['plans'],
        queryFn: () => getPlans(),
        retry: false
    })
}

export const useCreatePlan = () => {
    return useMutation({
        mutationFn: (data: Plan) => createPlan(data),
        retry: false
    })
}

export const useUpdatePlan = () => {
    return useMutation({
        mutationFn: (data: Plan) => updatePlan(data.id, data),
        retry: false
    })
}

export const useDeletePlan = () => {
    return useMutation({
        mutationFn: (id: string) => deletePlan(id),
        retry: false
    })
}