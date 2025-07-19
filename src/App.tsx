
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter} from "react-router-dom";
import ThemeProvider from "@/components/ThemeProvider";
import Routes from "@/routes";
import { initMercadoPago } from "@mercadopago/sdk-react";


const queryClient = new QueryClient();
initMercadoPago(import.meta.env.VITE_MERCADO_PAGO_KEY);
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
