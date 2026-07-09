import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, UtensilsCrossed, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone || !password) { toast("Veuillez remplir tous les champs", "error"); return; }
    setLoading(true);
    try {
      await login(phone, password);
      toast("Bienvenue !");
      navigate("/menu");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Connectez-vous pour commander</p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]" />
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Téléphone</Label>
                <div className="relative">
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 000 00 01" className="pl-9" required />
                  <LogIn className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                </div>
              </div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-center text-[var(--muted-foreground)] mb-3">Comptes de démonstration</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button type="button" onClick={() => { setPhone("770 000 00 01"); setPassword("admin123"); }} className="px-2 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--card-hover)] text-left transition-colors"><span className="font-semibold">Admin</span><br />770 000 00 01</button>
                <button type="button" onClick={() => { setPhone("770 000 00 02"); setPassword("client123"); }} className="px-2 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--card-hover)] text-left transition-colors"><span className="font-semibold">Client</span><br />770 000 00 02</button>
                <button type="button" onClick={() => { setPhone("770 000 00 03"); setPassword("livreur123"); }} className="px-2 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--card-hover)] text-left transition-colors"><span className="font-semibold">Livreur</span><br />770 000 00 03</button>
                <button type="button" onClick={() => { setPhone("770 000 00 98"); setPassword("gerant123"); }} className="px-2 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--card-hover)] text-left transition-colors"><span className="font-semibold">Gérant</span><br />770 000 00 98</button>
              </div>
            </div>
            <p className="text-sm text-center mt-4 text-[var(--muted-foreground)]">
              Pas de compte ? <Link to="/register" className="text-[var(--primary)] hover:underline font-semibold">S'inscrire</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
