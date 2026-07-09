import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, UtensilsCrossed, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) { toast("Veuillez remplir tous les champs", "error"); return; }
    if (form.password.length < 6) { toast("Mot de passe : 6 caractères minimum", "error"); return; }
    setLoading(true);
    try {
      await register(form);
      toast("Compte créé avec succès !");
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
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Rejoignez-nous et commandez</p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-orange-400 to-[var(--secondary)]" />
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Nom complet</Label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Votre nom" required />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="77 000 00 00" required />
              </div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="6 caractères minimum" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Inscription..." : <><UserPlus className="w-4 h-4" /> S'inscrire</>}
              </Button>
            </form>
            <p className="text-sm text-center mt-4 text-[var(--muted-foreground)]">
              Déjà un compte ? <Link to="/login" className="text-[var(--primary)] hover:underline font-semibold">Se connecter</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
