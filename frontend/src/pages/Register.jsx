import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const toast = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      toast("Compte créé !");
      navigate("/menu");
    } catch (err) {
      toast(err.message, "error");
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">S'inscrire</Button>
          </form>
          <p className="text-sm text-center mt-4 text-[var(--muted-foreground)]">
            Déjà un compte ? <Link to="/login" className="text-[#e67e22] hover:underline">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
