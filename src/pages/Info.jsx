import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, Smartphone, MapPin, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

const Info = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Realmente es 100% gratis?',
      a: 'Sí, GustoMenu es completamente gratuito. No cobramos comisiones por pedidos ni tarifas mensuales. Queremos apoyar a los emprendedores y restaurantes locales a digitalizarse sin costos ocultos.'
    },
    {
      q: '¿Cómo llegan los pedidos a mi WhatsApp?',
      a: 'Tus clientes entran a tu menú digital, seleccionan los platos que desean y hacen clic en "Pedir por WhatsApp". El sistema genera automáticamente un mensaje estructurado con el resumen del pedido y abre el chat directamente con tu número para que te lo envíen con un toque.'
    },
    {
      q: '¿Es obligatorio registrarse?',
      a: 'No. Puedes crear tu menú al instante sin registrarte. Los datos del menú se guardarán de forma segura en tu navegador. Sin embargo, registrarse te permite acceder al Panel de Control para gestionar tu menú desde cualquier dispositivo, ver estadísticas y habilitar el mapa de restaurantes.'
    },
    {
      q: '¿Cómo puedo ofrecer el menú con un código QR?',
      a: 'Una vez que creas tu menú, se te proporcionará un enlace único. Puedes copiar ese enlace y usar cualquier generador de códigos QR gratuito en internet para imprimirlo y colocarlo en las mesas de tu restaurante o local.'
    },
    {
      q: '¿Qué es el Mapa de Restaurantes Asociados?',
      a: 'Es una funcionalidad para dar visibilidad a tu negocio. Si decides activar la ubicación de tu restaurante, aparecerá en nuestro mapa interactivo para que nuevos clientes cercanos puedan descubrir tu propuesta gastronómica y ver tu menú.'
    }
  ];

  return (
    <div className="container animate-in">
      {/* Botón Volver */}
      <button 
        className="btn btn--secondary btn--sm" 
        onClick={() => navigate('/')} 
        style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={16} /> Volver al Inicio
      </button>

      {/* Hero de Info */}
      <div 
        style={{ 
          background: 'var(--hero-bg)', 
          borderRadius: 'var(--radius-xl)', 
          padding: 'var(--space-xl) var(--space-lg)', 
          color: 'var(--hero-text)', 
          textAlign: 'center', 
          marginBottom: 'var(--space-xl)',
          boxShadow: '0 10px 30px var(--shadow-primary)',
        }}
      >
        <span style={{ fontSize: '48px', display: 'block', marginBottom: 'var(--space-sm)' }}>🚀</span>
        <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-sm)' }}>
          Todo sobre GustoMenu
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.95, lineHeight: '1.6', maxWidth: '460px', margin: '0 auto' }}>
          La solución más rápida, atractiva y libre de fricciones para que tu restaurante reciba pedidos digitales.
        </p>
      </div>

      {/* Sección ¿Cómo Funciona? */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
          🛠️ ¿Cómo funciona? En 3 simples pasos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-md)', padding: '12px 0' }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>📝</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--on-surface)' }}>1. Diseña tu Menú</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px', lineHeight: '1.4' }}>
                Ingresa el nombre de tu restaurante, añade tus platos con descripción, precio y selecciona un emoji que represente cada delicia.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', padding: '12px 0', borderTop: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>🔗</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--on-surface)' }}>2. Comparte con tus Clientes</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px', lineHeight: '1.4' }}>
                Copia tu enlace único y compártelo en tu perfil de Instagram, estados de WhatsApp, o genera un código QR para imprimirlo en tus mesas.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', padding: '12px 0', borderTop: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>💬</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--on-surface)' }}>3. Recibe Pedidos por WhatsApp</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px', lineHeight: '1.4' }}>
                Tus comensales eligen sus favoritos desde su celular y envían su carrito directamente a tu chat personal en un mensaje claro y ordenado.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Qué Resolvemos (Características Clave) */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
          ✨ Características Principales
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          
          <div style={{ 
            background: 'var(--surface-low)', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <Smartphone size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Interfaz Premium</div>
            <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
              Diseño ultra rápido y responsivo que encanta a tus clientes y carga en milisegundos.
            </div>
          </div>

          <div style={{ 
            background: 'var(--surface-low)', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <MapPin size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Mapa Local</div>
            <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
              Ubica tu negocio en el mapa interactivo de GustoMenu para captar comensales en tu zona.
            </div>
          </div>

          <div style={{ 
            background: 'var(--surface-low)', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Pedidos Directos</div>
            <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
              Sin intermediarios ni cobro de comisiones. Las ganancias van 100% a tu negocio.
            </div>
          </div>

          <div style={{ 
            background: 'var(--surface-low)', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Privacidad y Control</div>
            <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
              Tus menús te pertenecen. Elige si guardas tus datos localmente o en tu cuenta registrada.
            </div>
          </div>

        </div>
      </div>

      {/* Sección FAQ (Preguntas Frecuentes) */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
          ❓ Preguntas Frecuentes (FAQ)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                style={{ 
                  background: 'var(--surface-low)', 
                  border: '1px solid var(--outline-variant)', 
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'var(--transition)'
                }}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    color: 'var(--on-surface)',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '14px',
                    gap: '12px'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div 
                    style={{ 
                      padding: '0 16px 16px 16px', 
                      fontSize: '13px', 
                      lineHeight: '1.5', 
                      color: 'var(--on-surface-variant)',
                      opacity: 0.9
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Final */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
        <button 
          className="btn btn--primary btn--full btn--pill" 
          style={{ fontSize: '17px', maxWidth: '380px' }}
          onClick={() => navigate('/crear')}
        >
          🍽️ Crear mi Menú Gratis
        </button>
        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
          Hecho con <Heart size={12} fill="var(--primary)" color="var(--primary)" /> para dueños de restaurantes.
        </span>
      </div>
    </div>
  );
};

export default Info;
