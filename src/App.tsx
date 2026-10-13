import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CobranzaProvider } from './contexts/CobranzaContext';
import { GuiaProvider } from './contexts/GuiaContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { UIProvider } from './contexts/UIContext';
import { AuthGate } from './pages/Acceso';
import { Ajustes } from './pages/Ajustes';
import { Cartera } from './pages/Cartera';
import { Guia } from './pages/Guia';
import { Inicio } from './pages/Inicio';
import { Legal } from './pages/Legal';
import { Landing } from './pages/Landing';
import { Docs } from './pages/docs/Docs';
import { Promesas } from './pages/Promesas';

interface AppProps {
  tema?: 'oscuro' | 'claro';
  /** Si es falso, la app inicia con la cartera vacía para mostrar el estado inicial. */
  datosDeEjemplo?: boolean;
}

/** Remonta los datos al cambiar de usuario para no mezclar carteras. */
function DatosDeUsuario({ children, iniciarVacio }: {children: React.ReactNode;iniciarVacio: boolean;}) {
  const { sesion } = useAuth();
  return (
    <CobranzaProvider key={sesion?.user.id ?? 'local'} iniciarVacio={iniciarVacio}>
      <TutorialProvider key={sesion?.user.id ?? 'local'} usuarioId={sesion?.user.id ?? 'local'}>
        <GuiaProvider key={sesion?.user.id ?? 'local'}>{children}</GuiaProvider>
      </TutorialProvider>
    </CobranzaProvider>);

}

export function App({ tema = 'oscuro', datosDeEjemplo = true }: AppProps) {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <UIProvider temaInicial={tema}>
          <Routes>
            {/* Páginas públicas (sin sesión): las pide Google para el inicio de sesión con OAuth. */}
            <Route path="privacidad" element={<Legal tipo="privacidad" />} />
            <Route path="terminos" element={<Legal tipo="terminos" />} />
            <Route path="docs" element={<Docs />} />
            <Route path="bienvenida" element={<Landing />} />
            <Route
              path="*"
              element={
              <AuthProvider>
            <AuthGate>
              <DatosDeUsuario iniciarVacio={!datosDeEjemplo}>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<Inicio />} />
                    <Route path="cartera/:id?" element={<Cartera />} />
                    <Route path="director" element={<Navigate to="/guia" replace />} />
                    <Route path="promesas" element={<Promesas />} />
                    <Route path="guia" element={<Guia />} />
                    <Route path="ajustes" element={<Ajustes />} />
                    <Route path="demo" element={<Navigate to="/" replace />} />
                    <Route path="entrar" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </DatosDeUsuario>
            </AuthGate>
          </AuthProvider>
              } />

          </Routes>
        </UIProvider>
      </BrowserRouter>
    </MotionConfig>);

}
