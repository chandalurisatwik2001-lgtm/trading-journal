import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import Step1Experience from './Steps/Step1Experience';
import Step2Goals from './Steps/Step2Goals';
import Step3Balance from './Steps/Step3Balance';
import Step4Broker from './Steps/Step4Broker';

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const [formData, setFormData] = useState({
        trading_experience: '',
        goals: [] as string[],
        initial_balance: '',
        currency: 'USD',
        broker: ''
    });

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me/onboarding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    trading_experience: formData.trading_experience,
                    goals: formData.goals,
                    initial_balance: parseFloat(formData.initial_balance),
                    currency: formData.currency,
                    broker: formData.broker
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save onboarding data');
            }

            setCompleted(true);

            // Delay redirect to show success state
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error('Onboarding error:', error);
            alert(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6 relative z-10"
                >
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold">All Set!</h1>
                    <p className="text-gray-400 text-lg">Redirecting you to your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <OnboardingLayout progress={progress}>
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Step1Experience
                            value={formData.trading_experience}
                            onChange={(val) => setFormData({ ...formData, trading_experience: val })}
                            onNext={handleNext}
                        />
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Step2Goals
                            value={formData.goals}
                            onChange={(val) => setFormData({ ...formData, goals: val })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Step3Balance
                            balance={formData.initial_balance}
                            currency={formData.currency}
                            onBalanceChange={(val) => setFormData({ ...formData, initial_balance: val })}
                            onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    </motion.div>
                )}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Step4Broker
                            value={formData.broker}
                            onChange={(val) => setFormData({ ...formData, broker: val })}
                            onSubmit={handleSubmit}
                            onBack={handleBack}
                            loading={loading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </OnboardingLayout>
    );
};

export default OnboardingWizard;
