import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog'
import { Payment } from '@mercadopago/sdk-react'
import { DialogTitle } from '@radix-ui/react-dialog'
import React from 'react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preferenceId: string | null;
  amount: number
}
function PaymentDialog({ onOpenChange, open, preferenceId, amount }: PaymentDialogProps) {
  const initialization = {
    preferenceId,
    amount
  };

  
  const customization = {
    paymentMethods: {
      // ticket: ["all"],
      bankTransfer: ["all"],
      creditCard: ["all"],
      prepaidCard: ["all"],
      debitCard: ["all"],
      mercadoPago: ["all"],
    },
  };
  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    // callback chamado ao clicar no botão de submissão dos dados
    return new Promise<void>((resolve, reject) => {
      fetch("/process_payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          // lidar com a resposta de erro ao tentar criar o pagamento
          reject();
        });
    });
  };
  const onError = async (error) => {
    // callback chamado para todos os casos de erro do Brick
    console.log(error);
  };
  const onReady = async () => {
    /*
      Callback chamado quando o Brick estiver pronto.
      Aqui você pode ocultar loadings do seu site, por exemplo.
    */
    console.log("ready");
  };

  if(!preferenceId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Área de Checkout</DialogTitle>
        </DialogHeader>
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onError={onError}
          onReady={onReady}
        />
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDialog