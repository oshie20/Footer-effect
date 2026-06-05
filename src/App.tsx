import ApexFooter from './components/ApexFooter'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#181818' }}>
      {/* Spacer to simulate page content above footer */}
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
        ↓ Footer below
      </div>
      <ApexFooter />
    </div>
  )
}
