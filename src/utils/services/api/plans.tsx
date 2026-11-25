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
    status?: PlanStatus;
}

export type PlanStatus = 'active' | 'archived';

const mapPlan = (id: string, data: Record<string, unknown>): Plan => ({
    id,
    title: (data.title as string) ?? '',
    price: (data.price as string) ?? '',
    period: data.period as string | undefined,
    features: Array.isArray(data.features) ? data.features as Plan['features'] : [],
    isPopular: data.isPopular === true,
    status: (data.status as PlanStatus | undefined) ?? 'active',
});

const createPlan = async (data: Plan) => {
    const ref = collection(FireStore, 'plans');
    const docRef = await addDoc(ref, { ...data, status: data.status ?? 'active' });
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
    return snapshot.docs.map((doc) => mapPlan(doc.id, doc.data()));
}

const getActivePlans = async () => {
    const plans = await getPlans();
    return plans.filter((plan) => (plan.status ?? 'active') === 'active');
}

const getPlan = async (id: string) => {
    const ref = doc(FireStore, 'plans', id);
    const docSnap = await getDoc(ref);
    return docSnap.exists() ? mapPlan(docSnap.id, docSnap.data()) : null;
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
        retry: false,
        staleTime: 60_000
    })
}

export const useGetActivePlans = () => {
    return useQuery({
        queryKey: ['plans', 'active'],
        queryFn: () => getActivePlans(),
        retry: false,
        staleTime: 60_000
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