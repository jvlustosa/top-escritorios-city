'use client';

import { useState, useEffect, useCallback } from 'react';

const TOUR_KEY = 'tour_completed';

type StepType = 'tooltip' | 'form';

interface TooltipStep {
  type: 'tooltip';
  message: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
  };
  arrowDirection: 'up' | 'down' | 'left' | 'right';
}

interface FormStep {
  type: 'form';
  title: string;
  subtitle: string;
}

type Step = TooltipStep | FormStep;

const steps: Step[] = [
  {
    type: 'form',
    title: 'Crie sua conta',
    subtitle: 'Cadastre seu escritório e apareça no ranking da cidade',
  },
  {
    type: 'tooltip',
    message: 'Esta é a cidade dos escritórios de advocacia',
    position: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    arrowDirection: 'down',
  },
  {
    type: 'tooltip',
    message: 'Cada prédio representa um escritório real',
    position: {
      top: '55%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    arrowDirection: 'up',
  },
  {
    type: 'tooltip',
    message: 'Registre o seu e apareça no ranking',
    position: {
      top: '80px',
      right: '16px',
    },
    arrowDirection: 'up',
  },
];

function Arrow({ direction }: { direction: TooltipStep['arrowDirection'] }) {
  const base = 'absolute border-[8px] border-transparent';

  if (direction === 'up') {
    return (
      <span
        className={`${base} -top-[16px] left-1/2 -translate-x-1/2`}
        style={{ borderBottomColor: '#ffffff' }}
      />
    );
  }

  if (direction === 'down') {
    return (
      <span
        className={`${base} -bottom-[16px] left-1/2 -translate-x-1/2`}
        style={{ borderTopColor: '#ffffff' }}
      />
    );
  }

  if (direction === 'left') {
    return (
      <span
        className={`${base} -left-[16px] top-1/2 -translate-y-1/2`}
        style={{ borderRightColor: '#ffffff' }}
      />
    );
  }

  return (
    <span
      className={`${base} -right-[16px] top-1/2 -translate-y-1/2`}
      style={{ borderLeftColor: '#ffffff' }}
    />
  );
}

export default function GuidedTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) setVisible(true);
    } catch {
      // localStorage unavailable — skip tour
    }
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Mínimo de 6 caracteres';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    const current = steps[step];
    if (current.type === 'form') {
      if (!validateForm()) return;
      // TODO: submit registration to backend
    }
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [step, completeTour, validateForm]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        completeTour();
      }
    },
    [completeTour],
  );

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeTour();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, completeTour]);

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  if (current.type === 'form') {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label="Cadastro"
      >
        <div
          className="w-[460px] max-w-[92vw] bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-8 pb-2">
            {/* Step counter */}
            <p className="text-sm uppercase tracking-widest text-[#999] mb-2 select-none font-medium">
              {step + 1} de {steps.length}
            </p>

            {/* Title */}
            <h2 className="text-3xl font-bold text-black mb-1">
              {current.title}
            </h2>
            <p className="text-lg text-[#666] mb-8">
              {current.subtitle}
            </p>

            {/* Form fields */}
            <div className="space-y-5">
              <div>
                <label htmlFor="tour-name" className="block text-base font-semibold text-black mb-1.5">
                  Nome completo
                </label>
                <input
                  id="tour-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((d) => ({ ...d, name: e.target.value }));
                    setFormErrors((errs) => { const { name, ...rest } = errs; return rest; });
                  }}
                  placeholder="João da Silva"
                  className={`w-full px-4 py-3 text-lg rounded-xl border-2 bg-[#f9f9f9] text-black placeholder:text-[#bbb] outline-none transition-colors ${
                    formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-[#e0e0e0] focus:border-black'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="tour-email" className="block text-base font-semibold text-black mb-1.5">
                  E-mail
                </label>
                <input
                  id="tour-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((d) => ({ ...d, email: e.target.value }));
                    setFormErrors((errs) => { const { email, ...rest } = errs; return rest; });
                  }}
                  placeholder="joao@escritorio.com.br"
                  className={`w-full px-4 py-3 text-lg rounded-xl border-2 bg-[#f9f9f9] text-black placeholder:text-[#bbb] outline-none transition-colors ${
                    formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-[#e0e0e0] focus:border-black'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="tour-password" className="block text-base font-semibold text-black mb-1.5">
                  Senha
                </label>
                <input
                  id="tour-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((d) => ({ ...d, password: e.target.value }));
                    setFormErrors((errs) => { const { password, ...rest } = errs; return rest; });
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-3 text-lg rounded-xl border-2 bg-[#f9f9f9] text-black placeholder:text-[#bbb] outline-none transition-colors ${
                    formErrors.password ? 'border-red-400 focus:border-red-500' : 'border-[#e0e0e0] focus:border-black'
                  }`}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pt-5 pb-4 flex items-center justify-between">
            <button
              onClick={completeTour}
              className="text-[#999] text-base hover:text-black transition-colors underline underline-offset-2"
            >
              Pular
            </button>

            <button
              onClick={handleNext}
              className="px-7 py-3 bg-black text-white text-lg font-semibold rounded-xl hover:bg-[#222] transition-colors"
            >
              Próximo
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex h-[4px] rounded-b-2xl overflow-hidden">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-colors duration-300 ${
                  i <= step ? 'bg-black' : 'bg-[#eee]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tooltip step
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado"
    >
      <div
        className="absolute w-[400px] max-w-[92vw] bg-white text-black rounded-2xl shadow-2xl"
        style={{
          top: current.position.top,
          bottom: current.position.bottom,
          left: current.position.left,
          right: current.position.right,
          transform: current.position.transform,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Arrow direction={current.arrowDirection} />

        <div className="px-8 py-6">
          {/* Step counter */}
          <p className="text-sm uppercase tracking-widest text-[#999] mb-3 select-none font-medium">
            {step + 1} de {steps.length}
          </p>

          {/* Message */}
          <p className="text-xl font-semibold leading-relaxed text-black">
            {current.message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={completeTour}
              className="text-[#999] text-base hover:text-black transition-colors underline underline-offset-2"
            >
              Pular
            </button>

            <button
              onClick={handleNext}
              className="px-7 py-3 bg-black text-white text-lg font-semibold rounded-xl hover:bg-[#222] transition-colors"
            >
              {isLast ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex h-[4px] rounded-b-2xl overflow-hidden">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-colors duration-300 ${
                i <= step ? 'bg-black' : 'bg-[#eee]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
