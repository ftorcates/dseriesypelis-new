import { Database } from "lucide-react";

export function DemoNotice({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <div className="demo-notice shell"><Database size={16} /><span>Vista de demostración. Añade las credenciales de Notion para cargar tu catálogo real.</span></div>;
}
