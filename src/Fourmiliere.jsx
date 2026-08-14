import React, { useState, useEffect } from 'react';
import { Dexie } from 'dexie';

const db = new Dexie('FourmiliereDB');
db.version(1).stores({
  associations: '++id, code_postal, statut',
  avis: '++id, id_asso',
  urgences: '++id, timestamp'
});

export default function Fourmiliere() {
  const [assocs, setAssocs] = useState([]);
  const [statut, setStatut] = useState('online');
  const [selectedType, setSelectedType] = useState('all');
  const [nomAssoFilter, setNomAssoFilter] = useState('');

  useEffect(() => {
    loadAssocs();
    checkConnection();
    window.addEventListener('online', () => setStatut('online'));
    window.addEventListener('offline', () => setStatut('offline'));
  }, []);

  const loadAssocs = async () => {
    try {
      const data = await db.associations.toArray();
      setAssocs(data);
    } catch (e) {
      console.error('Erreur:', e);
    }
  };

  const checkConnection = () => {
    setStatut(navigator.onLine ? 'online' : 'offline');
  };

  const updateStatutAsso = async (idAsso, nouveauStatut) => {
    try {
      await db.associations.update(idAsso, {
        statut: nouveauStatut,
        last_update: new Date().toISOString()
      });
      loadAssocs();
    } catch (e) {
      console.error('Erreur:', e);
    }
  };

  const signalUrgence = async () => {
    const details = prompt('Type urgence?');
    if (details) {
      await db.urgences.add({
        type: details,
        lieu: 'Essonne',
        timestamp: new Date().toISOString()
      });
    }
  };

  const addAssoTest = async () => {
    const assoTest = {
      nom: prompt('Nom asso?') || 'Asso Test',
      services: 'Domiciliation',
      adresse: '123 rue Test',
      code_postal: '91000',
      tel: '06 12 34 56 78',
      horaires: 'Lun-Ven 9-17',
      statut: 'dispo',
      last_update: new Date().toISOString()
    };
    await db.associations.add(assoTest);
    loadAssocs();
  };

  const assosFiltrees = assocs.filter(a => {
    const matchType = selectedType === 'all' || a.services?.includes(selectedType);
    const matchNom = nomAssoFilter === '' || a.nom?.toLowerCase().includes(nomAssoFilter.toLowerCase());
    return matchType && matchNom;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🐜 FOURMILIÈRE</h1>
        <p>Réseau des petites associations Essonne</p>
        <div style={{...styles.statusBadge, backgroundColor: statut === 'online' ? '#27ae60' : '#e74c3c'}}>
          {statut === 'online' ? '✓ En ligne' : '⚠️ Hors ligne'}
        </div>
      </div>

      <div style={styles.urgenceBox}>
        <h3>🚨 Urgence?</h3>
        <button onClick={signalUrgence} style={styles.btnUrgence}>SIGNALER URGENCE</button>
      </div>

      <div style={styles.filterBox}>
        <input type="text" placeholder="Chercher..." value={nomAssoFilter} onChange={(e) => setNomAssoFilter(e.target.value)} style={styles.input} />
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={styles.select}>
          <option value="all">Tous</option>
          <option value="Domiciliation">Domiciliation</option>
          <option value="Hébergement">Hébergement</option>
        </select>
      </div>

      <div style={styles.assocList}>
        <h2>Les fourmis ({assosFiltrees.length})</h2>
        {assosFiltrees.length === 0 ? (
          <div style={styles.empty}>
            <p>Aucune asso</p>
            <button onClick={addAssoTest} style={styles.btnAdd}>+ Ajouter une asso</button>
          </div>
        ) : (
          assosFiltrees.map(asso => (
            <div key={asso.id} style={{...styles.assoCard, borderLeft: `4px solid ${asso.statut === 'dispo' ? '#27ae60' : '#e74c3c'}`}}>
              <div style={styles.assoHeader}>
                <h3>{asso.nom}</h3>
                <span>{asso.statut === 'dispo' ? '🟢' : '🔴'}</span>
              </div>
              <p><strong>Services:</strong> {asso.services}</p>
              <p><strong>Adresse:</strong> {asso.adresse}</p>
              <p><strong>Tél:</strong> {asso.tel}</p>
              <div style={styles.buttonsGroup}>
                <button onClick={() => updateStatutAsso(asso.id, 'dispo')} style={{...styles.btnStatut, backgroundColor: '#27ae60'}}>🟢 Dispo</button>
                <button onClick={() => updateStatutAsso(asso.id, 'fermee')} style={{...styles.btnStatut, backgroundColor: '#e74c3c'}}>🔴 Fermée</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  header: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', borderBottom: '4px solid #e74c3c' },
  statusBadge: { display: 'inline-block', padding: '10px 15px', color: 'white', borderRadius: '5px', fontWeight: 'bold' },
  urgenceBox: { backgroundColor: '#fff3cd', padding: '20px', marginBottom: '20px', borderRadius: '10px', borderLeft: '4px solid #ffc107' },
  btnUrgence: { padding: '12px 24px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  filterBox: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  select: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  assocList: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' },
  assoCard: { borderRadius: '5px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' },
  assoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  buttonsGroup: { display: 'flex', gap: '5px', marginTop: '10px' },
  btnStatut: { padding: '8px 12px', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  btnAdd: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px 20px', color: '#999' }
};