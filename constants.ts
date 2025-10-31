
import React from 'react';
import { Verdict } from './types';
import { CheckCircleIcon } from './components/icons/CheckCircleIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { QuestionMarkCircleIcon } from './components/icons/QuestionMarkCircleIcon';

interface VerdictStyle {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const VERDICT_STYLES: Record<Verdict, VerdictStyle> = {
  [Verdict.TRUE]: {
    label: 'True',
    icon: CheckCircleIcon,
    bgColor: 'bg-green-900/50',
    textColor: 'text-green-300',
    borderColor: 'border-green-700',
  },
  [Verdict.LIKELY_TRUE]: {
    label: 'Likely True',
    icon: CheckCircleIcon,
    bgColor: 'bg-teal-900/50',
    textColor: 'text-teal-300',
    borderColor: 'border-teal-700',
  },
  [Verdict.MISLEADING]: {
    label: 'Misleading',
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-900/50',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-700',
  },
  [Verdict.LIKELY_FALSE]: {
    label: 'Likely False',
    icon: XCircleIcon,
    bgColor: 'bg-orange-900/50',
    textColor: 'text-orange-300',
    borderColor: 'border-orange-700',
  },
  [Verdict.FALSE]: {
    label: 'False',
    icon: XCircleIcon,
    bgColor: 'bg-red-900/50',
    textColor: 'text-red-300',
    borderColor: 'border-red-700',
  },
  [Verdict.UNVERIFIABLE]: {
    label: 'Unverifiable',
    icon: QuestionMarkCircleIcon,
    bgColor: 'bg-slate-700/50',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-600',
  },
};
