// Contexto cross-cutting para o sistema de toasts (useToast).
// Criado aqui para evitar prop-drilling em todos os domínios.
// Providenciado em app.js usando o padrão Nexa: ToastCtx.provide(value, () => h(Shell))

import { createContext } from "../../../dist/nexa.js";

export const ToastCtx = createContext(null);
