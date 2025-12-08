export default function HomePage() {
  return (
    <div>
      <h1>Panel de Control</h1>
      <p>Bienvenido al Sistema de Trazabilidad de Datos Clínicos de Nacimiento.</p>
      
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Madres</h3>
          <p>Gestión de pacientes</p>
        </div>
        <div style={styles.card}>
          <h3>Partos</h3>
          <p>Registro de nacimientos</p>
        </div>
        <div style={styles.card}>
          <h3>Recién Nacidos</h3>
          <p>Datos de neonatos</p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};