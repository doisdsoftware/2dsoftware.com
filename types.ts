
// Added React import to provide access to React.ReactNode type
import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  href?: string;
  image?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  details?: string;
  image?: string;
  bullets?: string[];
}