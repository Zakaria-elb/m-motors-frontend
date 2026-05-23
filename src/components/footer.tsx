export function Footer() {
    return (
      <footer className="bg-slate-900 text-gray-400 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">M-Motors</h3>
              <p className="text-sm leading-relaxed">
                Spécialiste de la vente et location de véhicules d'occasion depuis 1987. 
                Qualité, fiabilité et satisfaction client.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Services</h3>
              <ul className="text-sm space-y-1">
                <li>Achat de véhicules</li>
                <li>Location longue durée (LLD)</li>
                <li>Reprise d'ancien véhicule</li>
                <li>Financement sur mesure</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Contact</h3>
              <ul className="text-sm space-y-1">
                <li>📍 1 000 000 clients au national</li>
                <li>👥 800 collaborateurs</li>
                <li>🕐 Lun-Sam : 9h-19h</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-center">
            © 2026 M-Motors. Tous droits réservés. — Examen Bachelor HETIC Bloc 3
          </div>
        </div>
      </footer>
    );
  }
  