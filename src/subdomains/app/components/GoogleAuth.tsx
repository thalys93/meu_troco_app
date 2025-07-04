import { Button } from '@/components/ui/button'
import { AuthProvider, GoogleProvider } from '@/utils/api/firebase'
import { GoogleLogoIcon } from '@phosphor-icons/react'
import { browserSessionPersistence, setPersistence, signInWithPopup } from 'firebase/auth'


function GoogleAuth() {            
    async function handleLogin() {
        try {
            await setPersistence(AuthProvider, browserSessionPersistence);
            await signInWithPopup(AuthProvider, GoogleProvider);
        } catch (error) {
            console.error("Erro no login com redirect:", error);
        }
    }    

    return (
        <Button variant='outline' onClick={handleLogin} className='bg-emerald-500 border-0'>
            <GoogleLogoIcon className='scale-150 text-white' />
        </Button>
    )
}

export default GoogleAuth