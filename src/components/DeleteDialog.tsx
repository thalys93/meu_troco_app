import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Transaction } from '@/utils/services/api/transation'

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    deleteFunction: () => void
    title: string
    description: string
    itemDetails: Transaction
}

function DeleteDialog({ deleteFunction, title, description, itemDetails, open, onOpenChange }: DialogProps) {

    const handleCancel = () => {
        onOpenChange(false);        
    };

    const handleConfirmDelete = () => {
        deleteFunction();        
        onOpenChange(false);
    };    

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>

                        <Button type="button" variant='destructive' onClick={handleConfirmDelete}>
                            Excluir
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog