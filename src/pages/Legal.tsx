import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/layout/Logo';

/** Correo de contacto que aparece en las páginas legales. */
const CONTACTO = 'manuel28042005@gmail.com';
const ACTUALIZADO = '13 de octubre de 2026';

function Seccion({ titulo, children }: {titulo: string;children: React.ReactNode;}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>);

}

function Privacidad() {
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-tight">Aviso de privacidad</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: {ACTUALIZADO}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        Cobrix es una aplicación para gestionar la cobranza de pequeñas y medianas empresas por WhatsApp. Este aviso explica qué datos tratamos, para qué y
        cómo puedes ejercer tus derechos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).
      </p>

      <Seccion titulo="1. Datos que recabamos">
        <p>
          <strong className="text-fg">De tu cuenta:</strong> nombre, correo electrónico y foto de perfil cuando inicias sesión con Google (solo los permisos
          básicos <em>openid</em>, <em>email</em> y <em>profile</em>), o el nombre, empresa y correo que escribes al registrarte. No accedemos a tu Gmail, Drive,
          Calendario ni a ningún otro servicio de Google.
        </p>
        <p>
          <strong className="text-fg">De tu cartera:</strong> la información de clientes, facturas, promesas de pago y mensajes que tú cargas o generas en la app.
        </p>
        <p>
          <strong className="text-fg">Técnicos:</strong> registros básicos de uso y errores necesarios para operar y proteger el servicio.
        </p>
      </Seccion>

      <Seccion titulo="2. Para qué los usamos">
        <p>Para identificarte, mostrarte tu propia cartera, enviar los recordatorios que tú confirmas, registrar las respuestas de tus clientes y responder tus preguntas en la Guía. No vendemos ni rentamos tus datos y no los usamos para publicidad.</p>
      </Seccion>

      <Seccion titulo="3. Con quién se comparten">
        <p>Solo con los proveedores necesarios para que Cobrix funcione, que los tratan por cuenta nuestra:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase: base de datos e inicio de sesión.</li>
          <li>Vercel y Render: alojamiento de la aplicación.</li>
          <li>Google (Gemini): genera las respuestas de la Guía a partir de tus preguntas y un resumen de tu cartera.</li>
          <li>Meta (WhatsApp Business Platform): envío y recepción de mensajes, solo si activas el canal de WhatsApp.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Seguridad y conservación">
        <p>
          Cada cuenta solo puede ver su propia información (aislamiento por usuario en la base de datos) y las conexiones viajan cifradas. Conservamos los datos
          mientras tu cuenta exista; puedes vaciar tu cartera en Ajustes en cualquier momento.
        </p>
      </Seccion>

      <Seccion titulo="5. Tus derechos (ARCO)">
        <p>
          Puedes pedir acceso, rectificación, cancelación u oposición al uso de tus datos, o la eliminación de tu cuenta, escribiendo a{' '}
          <a href={`mailto:${CONTACTO}`} className="text-brand underline">
            {CONTACTO}
          </a>
          . Respondemos en un máximo de 20 días hábiles.
        </p>
      </Seccion>

      <Seccion titulo="6. Cambios">
        <p>Si este aviso cambia, publicaremos la nueva versión en esta misma página con su fecha de actualización.</p>
      </Seccion>
    </>);

}

function Terminos() {
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-tight">Términos de uso</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: {ACTUALIZADO}</p>
      <Seccion titulo="1. El servicio">
        <p>Cobrix ayuda a organizar la cobranza: prioriza clientes, envía recordatorios con plantillas y registra respuestas y promesas de pago. Las decisiones y acuerdos con tus clientes son tuyos.</p>
      </Seccion>
      <Seccion titulo="2. Uso responsable">
        <p>Te comprometes a contactar solo a personas con las que tienes una relación comercial, a no enviar mensajes engañosos o amenazantes y a cumplir las políticas de WhatsApp Business y la normativa de cobranza aplicable.</p>
      </Seccion>
      <Seccion titulo="3. Versión de demostración">
        <p>Esta es una versión de demostración: los datos de ejemplo son ficticios y el servicio se ofrece “tal cual”, sin garantía de disponibilidad.</p>
      </Seccion>
      <Seccion titulo="4. Contacto">
        <p>
          Dudas:{' '}
          <a href={`mailto:${CONTACTO}`} className="text-brand underline">
            {CONTACTO}
          </a>
          .
        </p>
      </Seccion>
    </>);

}

export function Legal({ tipo }: {tipo: 'privacidad' | 'terminos';}) {
  return (
    <div className="min-h-[100dvh] bg-bg text-fg">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" aria-label="Ir a Cobrix">
          <Logo />
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link to="/privacidad" className={tipo === 'privacidad' ? 'text-fg' : 'hover:text-fg'}>
            Privacidad
          </Link>
          <Link to="/terminos" className={tipo === 'terminos' ? 'text-fg' : 'hover:text-fg'}>
            Términos
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">{tipo === 'privacidad' ? <Privacidad /> : <Terminos />}</main>
    </div>);

}
