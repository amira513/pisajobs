import React, { useState, useEffect } from "react";

const MOCK_ANNUNCI = [
  {
    id: 1,
    titolo: "Baby sitter per 1 pomeriggio",
    descrizione: "Cerco baby sitter per 1 pomeriggio a Pisa centro.",
    tipo: "micro",
    zona: "Centro",
    compenso: "15€/h",
  },
  {
    id: 2,
    titolo: "Giardiniere part-time",
    descrizione: "Lavoro giardinaggio per 2 giorni a Pisa nord.",
    tipo: "micro",
    zona: "San Marco",
    compenso: "20€/h",
  },
  {
    id: 3,
    titolo: "Addetto vendita negozio",
    descrizione: "Part-time pomeriggio presso negozio in zona Porta a Mare.",
    tipo: "macro",
    zona: "Porta a Mare",
    compenso: "7€/h",
  },
];

const ZONE_PISA = [
  "Tutti",
  "Centro",
  "San Marco",
  "Porta a Mare",
  "Santa Maria",
  "Ospedaletto",
  "San Giusto",
];

const TrovaLavoro = () => {
  const [keyword, setKeyword] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("tutti");
  const [zonaFiltro, setZonaFiltro] = useState("Tutti");
  const [annunci, setAnnunci] = useState([]);

  useEffect(() => {
    let risultati = MOCK_ANNUNCI;

    if (keyword.trim() !== "") {
      risultati = risultati.filter(
        (a) =>
          a.titolo.toLowerCase().includes(keyword.toLowerCase()) ||
          a.descrizione.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    if (tipoFiltro !== "tutti") {
      risultati = risultati.filter((a) => a.tipo === tipoFiltro);
    }
    if (zonaFiltro !== "Tutti") {
      risultati = risultati.filter((a) => a.zona === zonaFiltro);
    }

    setAnnunci(risultati);
  }, [keyword, tipoFiltro, zonaFiltro]);

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Trova Lavoro su PisaJobs</h2>

      <div style={{ marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Cerca parole chiave..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} style={{ flex: 1, padding: 8 }}>
          <option value="tutti">Tutti i tipi</option>
          <option value="micro">Lavoretti brevi</option>
          <option value="macro">Offerte serie</option>
        </select>

        <select value={zonaFiltro} onChange={(e) => setZonaFiltro(e.target.value)} style={{ flex: 1, padding: 8 }}>
          {ZONE_PISA.map((zona) => (
            <option key={zona} value={zona}>
              {zona}
            </option>
          ))}
        </select>
      </div>

      <div>
        {annunci.length === 0 ? (
          <p>Nessun annuncio trovato.</p>
        ) : (
          annunci.map((annuncio) => (
            <div
              key={annuncio.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 15,
                marginBottom: 10,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 8px" }}>{annuncio.titolo}</h3>
              <p style={{ margin: "0 0 6px" }}>{annuncio.descrizione}</p>
              <small>
                <strong>Tipo:</strong> {annuncio.tipo === "micro" ? "Lavoretto breve" : "Offerta seria"} |{" "}
                <strong>Zona:</strong> {annuncio.zona} | <strong>Compenso:</strong> {annuncio.compenso}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrovaLavoro;
