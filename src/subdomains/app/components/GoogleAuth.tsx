import { Button } from '@/components/ui/button'
import { useLoginWithGoogle } from '@/utils/api/auth'
import { GoogleLogoIcon } from '@phosphor-icons/react'

function GoogleAuth() {
    const login = useLoginWithGoogle();
    async function handleLogin() { login.mutate(); }

    return (
        <Button variant='outline' onClick={handleLogin} className='bg-emerald-500 border-0'>
            <GoogleLogoIcon className='scale-150 text-white' />
        </Button>
    )
}

export default GoogleAuth