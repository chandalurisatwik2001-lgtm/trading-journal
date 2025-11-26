import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import TradingExperienceStep from '../Onboarding/TradingExperienceStep';
import GoalsStep from '../Onboarding/GoalsStep';
import BrokerStep from '../Onboarding/BrokerStep';
import TradingAssetsStep from '../Onboarding/TradingAssetsStep';

export interface OnboardingData {
  tradingExperience?: string;
  goals?: string[];
  broker?: string;
  tradingAssets?: string[];
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const navigate = useNavigate();

  const totalSteps = 4;

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      navigate('/dashboard');
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                ← Back
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Log out
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {currentStep === 1 && (
          <TradingExperienceStep
            onContinue={(experience: string) => {
              updateData({ tradingExperience: experience });
              nextStep();
            }}
            initialValue={onboardingData.tradingExperience}
          />
        )}
        {currentStep === 2 && (
          <GoalsStep
            onContinue={(goals: string[]) => {
              updateData({ goals });
              nextStep();
            }}
            initialValue={onboardingData.goals}
          />
        )}
        {currentStep === 3 && (
          <BrokerStep
            onContinue={(broker: string) => {
              updateData({ broker });
              nextStep();
            }}
            initialValue={onboardingData.broker}
          />
        )}
        {currentStep === 4 && (
          <TradingAssetsStep
            onContinue={(assets: string[]) => {
              updateData({ tradingAssets: assets });
              handleComplete();
            }}
            initialValue={onboardingData.tradingAssets}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
