import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Transaction } from '@/utils/api/transation'

interface DialogProps {

    trigger: React.ReactNode
    deleteFunction: () => void
    title: string
    description: string
    itemDetails: Transaction
}

function DeleteDialog({ deleteFunction, title, description, itemDetails, trigger }: DialogProps) {

    const onClose = () => {
        deleteFunction()
    }

    return (
        <Dialog>
            <DialogTrigger>
                {trigger}
            </DialogTrigger>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {description}

                </DialogDescription>
                <Button variant='outline'>
                    {itemDetails?.description}
                </Button>

                <DialogFooter>
                    <div className='flex flex-col-reverse md:flex-row gap-1'>
                        <DialogClose>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>

                        <DialogClose>
                            <Button type="button" variant='destructive' onClick={onClose}>
                                Excluir
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog