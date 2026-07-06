import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboard } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, XCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/");
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={DollarSign} title="Ventes du jour" value="--- FCFA" />
        <MetricCard icon={TrendingUp} title="Top plat" value="---" />
        <MetricCard icon={XCircle} title="Annulations" value="---" />
        <MetricCard icon={Clock} title="Temps moyen" value="---" />
      </div>
      <p className="text-gray-500 text-center py-8">Les données détaillées du dashboard seront disponibles après intégration complète de l'API.</p>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Icon className="w-5 h-5 text-[#e67e22]" />
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
