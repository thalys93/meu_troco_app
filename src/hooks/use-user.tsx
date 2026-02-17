import { useNavigate } from "react-router-dom";
import useUserStore from "@/store/UserStore"
import { User } from "@/types/entities/User";
import { logout } from "@/utils/services/api/auth";

export const useUser = () => {
    const navigate = useNavigate();
    const { addUser, removeUser, user, removeUid, setUid } = useUserStore();

    const handleAddUser = (user: User) => addUser(user);

    const handleLogout = () => {
        removeUid();
        removeUser();
        logout().then(() => navigate("/oauth/login", { replace: true }));
    };

    return { user, handleAddUser, handleLogout };
}