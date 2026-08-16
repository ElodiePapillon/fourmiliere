import React, { useState, useEffect } from 'react';
import { Dexie } from 'dexie';
import { supabase } from './supabaseClient';

const db = new Dexie('FourmiliereDB');
db.version(1).stores({
  associations: '++id, code_postal, statut',
  avis: '++id, id_asso',
  urgences: '++id, timestamp'
});

const SERVICES = ['Domiciliation', 'Hebergement urgence', 'Accueil ecoute', 'Aide juridique', 'Accompagnement demarches'];

export default function Fourmiliere() {
  const [assocs, setAssocs] = useState([]);
  const [statut, setStatut] = useState('online');
  const [filtre, setFiltre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: '', adresse: '', code_postal: '', tel: '', email: '',
horaires: '', services: [], conditions: '', accepte_hors_commune: false,
    presentation: '', dispositifs: '', a_apporter: '', limites: ''
  });

  useEffect(() => {
    const handleOnline = () => setStatut('online');
    const handleOffline = () => setStatut('offline');

    charger();
    setStatut(navigator.onLine ? 'online' : 'offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

const charger = async () => {
    setAssocs(await db.associations.toArray());
    if (!navigator.onLine) return;
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .eq('valide', true);
    if (error || !data) return;
    await db.associations.clear();
    await db.associations.bulkPut(data);
    setAssocs(await db.associations.toArray());
  };    

const majStatut = async (id, s) => {
    const maj = { statut: s, last_update: new Date().toISOString() };
    await db.associations.update(id, maj);
    setAssocs(await db.associations.toArray());
    if (!navigator.onLine) {
      alert("Hors connexion : le changement n'est visible que sur cet appareil.");
      return;
    }
    const { data, error } = await supabase
      .from('associations')
      .update(maj)
      .eq('id', id)
      .select();
    if (error) {
      alert("Le changement n'a pas pu etre envoye : " + error.message);
      return;
    }
    if (!data || data.length === 0) {
      alert("La base a refuse la modification. Verifier la regle d'autorisation.");
      return;
    }
    charger();
  };
  const supprimer = async (id) => {
    if (window.confirm('Supprimer cette association ?')) {
      await db.associations.delete(id);
      charger();
    }
  };

  const toggleService = (s) => {
    setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  };

  const enregistrer = async () => {
    if (!form.nom.trim()) return alert('Le nom est obligatoire');
    if (!form.tel.trim()) return alert('Le telephone est obligatoire');
    if (form.services.length === 0) return alert('Cochez au moins un service');
if (!navigator.onLine) return alert('Vous etes hors connexion. Reessayez une fois connectee.');
    const fiche = { ...form, statut: 'dispo', valide: false, last_update: new Date().toISOString() };
    const { error } = await supabase.from('associations').insert([fiche]);
    if (error) return alert('Erreur envoi : ' + error.message);
    alert('Merci ! Votre fiche a bien ete envoyee. Elle apparaitra apres verification.');
    setForm({ nom: '', adresse: '', code_postal: '', tel: '', email: '', horaires: '', services: [], conditions: '', accepte_hors_commune: false, presentation: '', dispositifs: '', a_apporter: '', limites: '' });    setShowForm(false);
    charger();
  };

  const liste = assocs.filter(a =>
    filtre === '' ||
    a.nom?.toLowerCase().includes(filtre.toLowerCase()) ||
    a.services?.join(' ').toLowerCase().includes(filtre.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={{ margin: 0 }}>FOURMILIERE</h1>
        <p style={{ color: '#666', marginTop: 6 }}>Le reseau des petites associations qui oeuvrent ensemble pour soutenir les victimes de violences conjugales.</p>
        <span style={{ ...S.badge, background: statut === 'online' ? '#27ae60' : '#e67e22' }}>
          {statut === 'online' ? 'En ligne' : 'Hors connexion - donnees locales'}
        </span>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={S.btnPrincipal}>
          Inscrire mon association
        </button>
      )}

      {showForm && (
        <div style={S.form}>
          <h2 style={{ marginTop: 0 }}>Inscrire mon association</h2>
          <p style={S.aide}>Seule votre association peut renseigner ces informations. Elles seront visibles par les personnes qui cherchent de l'aide.</p>

          <label style={S.label}>Nom de l'association *</label>
          <input style={S.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />

          <label style={S.label}>Adresse</label>
          <input style={S.input} value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />

          <label style={S.label}>Code postal</label>
          <input style={S.input} value={form.code_postal} onChange={e => setForm({ ...form, code_postal: e.target.value })} />

          <label style={S.label}>Telephone *</label>
          <input style={S.input} value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} />

          <label style={S.label}>Email</label>
          <input style={S.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

          <label style={S.label}>Horaires reels d'accueil</label>
          <input style={S.input} placeholder="ex: lundi et jeudi 9h-12h" value={form.horaires} onChange={e => setForm({ ...form, horaires: e.target.value })} />

          <label style={S.label}>Services proposes *</label>
          <div style={{ marginBottom: 14 }}>
            {SERVICES.map(s => (
              <label key={s} style={S.check}>
                <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} /> {s}
              </label>
            ))}
          </div>

          <label style={S.label}>Conditions d'acces</label>
          <textarea style={{ ...S.input, height: 70 }} placeholder="ex: sur rendez-vous, justificatif de domicile demande..." value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} />
            <h3 style={{ marginTop: 24, marginBottom: 4 }}>Fiche de presentation</h3>
          <p style={S.aide}>Ces informations aident les personnes a savoir si elles peuvent pousser votre porte. Ecrivez avec vos mots.</p>

          <label style={S.label}>Qui nous sommes</label>
          <textarea style={{ ...S.input, height: 70 }} placeholder="En quelques lignes : votre association, depuis quand, par qui" value={form.presentation} onChange={e => setForm({ ...form, presentation: e.target.value })} />

          <label style={S.label}>Les soutiens et dispositifs que nous proposons</label>
          <textarea style={{ ...S.input, height: 110 }} placeholder="ex: domiciliation postale, accompagnement au depot de plainte, aide au dossier CAF, mise a l'abri quelques nuits, vestiaire, garde d'enfants pendant les rendez-vous..." value={form.dispositifs} onChange={e => setForm({ ...form, dispositifs: e.target.value })} />

          <label style={S.label}>Ce qu'il faut apporter ou preparer</label>
          <textarea style={{ ...S.input, height: 70 }} placeholder="ex: une piece d'identite si vous l'avez. Rien d'obligatoire pour un premier contact." value={form.a_apporter} onChange={e => setForm({ ...form, a_apporter: e.target.value })} />

          <label style={S.label}>Ce que nous ne pouvons pas faire</label>
          <textarea style={{ ...S.input, height: 70 }} placeholder="ex: nous n'avons pas d'hebergement ni d'avocat sur place. Nous orientons vers..." value={form.limites} onChange={e => setForm({ ...form, limites: e.target.value })} />

          <label style={{ ...S.check, background: '#fff8e1', padding: 10, borderRadius: 6 }}>
            <input type="checkbox" checked={form.accepte_hors_commune} onChange={e => setForm({ ...form, accepte_hors_commune: e.target.checked })} />
            {' '}Nous accueillons les personnes venant d'une autre commune ou d'un autre departement
          </label>

          <div style={{ marginTop: 18 }}>
            <button onClick={enregistrer} style={S.btnPrincipal}>Enregistrer</button>
            <button onClick={() => setShowForm(false)} style={S.btnGris}>Annuler</button>
          </div>
        </div>
      )}

      <input style={{ ...S.input, marginTop: 20 }} placeholder="Rechercher une association ou un service..." value={filtre} onChange={e => setFiltre(e.target.value)} />

      <div style={S.bloc}>
        <h2 style={{ marginTop: 0 }}>Associations inscrites ({liste.length})</h2>
        {liste.length === 0 && <p style={{ color: '#999' }}>Aucune association pour le moment.</p>}
        {liste.map(a => (
          <div key={a.id} style={{ ...S.carte, borderLeft: '5px solid ' + (a.statut === 'dispo' ? '#27ae60' : a.statut === 'saturee' ? '#f39c12' : '#e74c3c') }}>
            <h3 style={{ margin: '0 0 8px' }}>{a.nom}</h3>
            <p style={S.ligne}><b>Services :</b> {Array.isArray(a.services) ? a.services.join(', ') : a.services}</p>
            <p style={S.ligne}><b>Adresse :</b> {a.adresse} {a.code_postal}</p>
            <p style={S.ligne}><b>Telephone :</b> <a href={'tel:' + a.tel}>{a.tel}</a></p>
            {a.email && <p style={S.ligne}><b>Email :</b> {a.email}</p>}
            <p style={S.ligne}><b>Horaires :</b> {a.horaires || 'non renseignes'}</p>
            {a.conditions && <p style={S.ligne}><b>Conditions :</b> {a.conditions}</p>}
            {(a.presentation || a.dispositifs || a.a_apporter || a.limites) && (
              <div style={S.fiche}>
                {a.presentation && <p style={S.ligne}><b>Qui nous sommes :</b> {a.presentation}</p>}
                {a.dispositifs && <p style={S.ligne}><b>Soutiens et dispositifs :</b> {a.dispositifs}</p>}
                {a.a_apporter && <p style={S.ligne}><b>A apporter :</b> {a.a_apporter}</p>}
                {a.limites && <p style={S.ligne}><b>Ce que nous ne faisons pas :</b> {a.limites}</p>}
              </div>
            )}
            {a.accepte_hors_commune && <p style={{ ...S.ligne, color: '#27ae60', fontWeight: 'bold' }}>Accueille les personnes hors commune</p>}
            <div style={{ marginTop: 10 }}>
              <button onClick={() => majStatut(a.id, 'dispo')} style={{ ...S.btnMini, background: '#27ae60' }}>Disponible</button>
              <button onClick={() => majStatut(a.id, 'saturee')} style={{ ...S.btnMini, background: '#f39c12' }}>Saturee</button>
              <button onClick={() => majStatut(a.id, 'fermee')} style={{ ...S.btnMini, background: '#e74c3c' }}>Fermee</button>
              <button onClick={() => supprimer(a.id)} style={{ ...S.btnMini, background: '#7f8c8d' }}>Supprimer</button>
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              Mis a jour : {a.last_update ? new Date(a.last_update).toLocaleString('fr-FR') : 'jamais'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily: 'system-ui, Arial, sans-serif', maxWidth: 900, margin: '0 auto', padding: 20, background: '#f4f4f4', minHeight: '100vh' },
  header: { background: '#fff', padding: 24, borderRadius: 10, borderTop: '5px solid #c0392b', marginBottom: 16 },
  badge: { display: 'inline-block', padding: '6px 12px', color: '#fff', borderRadius: 4, fontSize: 13, fontWeight: 'bold' },
  form: { background: '#fff', padding: 24, borderRadius: 10, marginBottom: 16 },
  aide: { background: '#eef6ff', padding: 12, borderRadius: 6, fontSize: 14, color: '#34495e' },
  label: { display: 'block', fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 5, fontSize: 15, boxSizing: 'border-box' },
  check: { display: 'block', marginBottom: 6, fontSize: 15 },
  bloc: { background: '#fff', padding: 24, borderRadius: 10, marginTop: 16 },
  carte: { background: '#fafafa', padding: 16, borderRadius: 6, marginBottom: 14 },
  ligne: { margin: '4px 0', fontSize: 15 },
  fiche: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, marginTop: 10 },
  btnPrincipal: { padding: '12px 22px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 5, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginRight: 8 },
  btnGris: { padding: '12px 22px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer' },
  btnMini: { padding: '7px 12px', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 6, fontSize: 13 }
};