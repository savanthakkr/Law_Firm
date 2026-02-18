import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Faq {
  id: number;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  brandColor?: string;
  faqs: Faq[];
  settings?: any;
  sectionData?: {
    title?: string;
    subtitle?: string;
    cta_text?: string;
    button_text?: string;
    default_faqs?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export default function FaqSection({ faqs, settings, sectionData, brandColor = '#3b82f6' }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  faqs = sectionData.faqs.length > 0 ? sectionData.faqs : faqs;
  //console.log('FAQs in FaqSection:', faqs);
  // add id in faqs if not present
  faqs = faqs.map((faq, index) => ({
    id: faq.id || index + 1,
    ...faq
  }));
  // Default FAQs if none provided
  const defaultFaqs = [
    {
      id: 1,
      question: 'What is a legal case management system?',
      answer: 'A legal case management system is a comprehensive software solution that helps law firms and legal professionals organize, track, and manage their cases, clients, documents, deadlines, and billing in one centralized platform.'
    },
    {
      id: 2,
      question: 'Is client data secure and confidential?',
      answer: 'Yes, we use bank-level encryption and security measures to protect all client data. Our system is designed with attorney-client privilege in mind, ensuring complete confidentiality and compliance with legal industry standards.'
    },
    {
      id: 3,
      question: 'Can multiple team members collaborate on cases?',
      answer: 'Absolutely! Our system supports team collaboration with role-based permissions. You can assign team members to cases, share documents securely, and track everyone\'s contributions while maintaining proper access controls.'
    },
    {
      id: 4,
      question: 'How does time tracking and billing work?',
      answer: 'Our integrated time tracking allows you to log billable hours directly within cases and tasks. The system automatically generates invoices based on your time entries and billing rates, streamlining your billing process.'
    },
    {
      id: 5,
      question: 'Can I manage court schedules and deadlines?',
      answer: 'Yes, our calendar system helps you track court dates, filing deadlines, and important case milestones. You\'ll receive automated reminders to ensure you never miss critical dates.'
    },
    {
      id: 6,
      question: 'What types of documents can I store and manage?',
      answer: 'You can store all types of legal documents including contracts, pleadings, evidence, correspondence, and research materials. Our document management system supports version control and secure sharing.'
    },
    {
      id: 7,
      question: 'Is there a mobile app available?',
      answer: 'Yes, our responsive web application works seamlessly on mobile devices, allowing you to access case information, update time entries, and communicate with clients from anywhere.'
    },
    {
      id: 8,
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply sign up for an account, set up your firm profile, and begin adding your cases and clients. Our intuitive interface requires no technical expertise to use effectively.'
    }
  ];

  const backendFaqs = sectionData?.default_faqs?.map((faq, index) => ({
    id: index + 1,
    ...faq
  })) || defaultFaqs;
  
  const displayFaqs = faqs.length > 0 ? faqs : backendFaqs;

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {sectionData?.title || 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            {sectionData?.subtitle || 'Got questions? We\'ve got answers. If you can\'t find what you\'re looking for, feel free to contact our support team.'}
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {displayFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 border border-gray-200 rounded-lg"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                aria-expanded={openFaq === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
                aria-describedby={`faq-question-${faq.id}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4" id={`faq-question-${faq.id}`}>
                  {faq.question}
                </h3>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" aria-hidden="true" />
                )}
              </button>
              
              {openFaq === faq.id && (
                <div className="px-6 pb-4 border-t border-gray-200" id={`faq-answer-${faq.id}`} role="region" aria-labelledby={`faq-question-${faq.id}`}>
                  <p className="text-gray-600 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {(sectionData?.cta_text || sectionData?.button_text) && (
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 mb-4">
              {sectionData?.cta_text || 'Still have questions?'}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              style={{ backgroundColor: brandColor }}
            >
              {sectionData?.button_text || 'Contact Support'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}