import { User } from '@/types/entities/User'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React from 'react'
import ImageDropzone from './Dropzone'

interface AvatarTriggerProps {
    open?: boolean
    user: User
    canChange?: boolean,
    type?: string
}

function AvatarTrigger({ open, user }: AvatarTriggerProps) {    
    return (
        <div className='flex items-center gap-2 p-2 rounded w-full'>           
                <Avatar>
                    <AvatarFallback>{user?.firstName.charAt(0) + user?.lastName.charAt(0)}</AvatarFallback>
                    <AvatarImage src={user?.photoUrl} alt={user?.displayName} />
                </Avatar>            

            <div className='flex flex-col justify-start items-start'>
                <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground my-1">{user?.email}</p>
            </div>

            {
                !open ? <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" /> :
                    <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            }
        </div>
    )
}

export default AvatarTrigger