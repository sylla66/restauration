import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, Truck, Star, Clock } from "lucide-react";

const features = [
  { icon: Utensils, title: "Cuisine Sénégalaise", desc: "Thiébou Dieune, Yassa, Mafé et bien plus" },
  { icon: Truck, title: "Livraison Rapide", desc: "Livré chez vous en un rien de temps" },
  { icon: Star, title: "Produits Frais", desc: "Ingrédients locaux de qualité" },
  { icon: Clock, title: "Commande Flexible", desc: "Sur place, à emporter ou livré" },
];

export default function Home() {
  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Bienvenue chez <span className="text-[#e67e22]">Dakar Gourmet</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez les saveurs authentiques du Sénégal, commandez en ligne et dégustez chez vous.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/menu"><Button size="lg">Voir le menu</Button></Link>
          <Link to="/register"><Button variant="outline" size="lg">Créer un compte</Button></Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map((f) => (
          <div key={f.title} className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <f.icon className="w-10 h-10 text-[#e67e22] mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
